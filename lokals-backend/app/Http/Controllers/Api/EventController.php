<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Follow;
use App\Models\EventTicket;
use App\Models\EventTicketType;
use App\Models\Organization;
use App\Models\ServiceProvider;
use App\Services\CalendarService;
use App\Services\EventReminderService;
use App\Services\EventService;
use App\Services\LocationService;
use App\Services\QueryService;
use App\Services\TicketService;
use App\Support\PilotLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EventController extends Controller
{
    public function __construct(
        private readonly LocationService $locationService,
        private readonly QueryService $queryService,
        private readonly EventService $eventService,
        private readonly TicketService $ticketService,
        private readonly EventReminderService $eventReminderService,
        private readonly CalendarService $calendarService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Event::query()
            ->with(['ticketTypes', 'organizer'])
            ->withCount(['tickets as attendees_count', 'saves as saves_count'])
            ->when(! $request->user()?->hasAnyRole(['municipality_admin', 'town_manager', 'super_admin', 'operator']), fn ($builder) => $builder->where('status', 'published'))
            ->latest('starts_at');

        if ($search = $request->string('search')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%');
            });
        }

        foreach (['category', 'status'] as $filter) {
            if ($value = $request->string($filter)->value()) {
                $query->where($filter, $value);
            }
        }

        if ($value = PilotLocation::requestTown($request)) {
            $query->where('town', $value);
        }

        if ($value = PilotLocation::requestArea($request)) {
            $query->where('area', $value);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('starts_at', '>=', $request->string('date_from')->value());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('starts_at', '<=', $request->string('date_to')->value());
        }

        if ($request->boolean('free')) {
            $query->where('is_free', true);
        }

        if ($request->filled('organizer')) {
            $organizer = $request->string('organizer')->value();
            $query->whereHasMorph('organizer', '*', fn ($builder) => $builder->where('name', 'like', '%'.$organizer.'%'));
        }

        $items = $query->get()->filter(function (Event $event) use ($request): bool {
            if (! $request->filled('lat') || ! $request->filled('lng') || ! $request->filled('radius')) {
                return true;
            }

            $distance = $this->locationService->distanceKm(
                (float) $request->input('lat'),
                (float) $request->input('lng'),
                $event->lat,
                $event->lng,
            );
            $event->distance_km = $distance;

            return $distance !== null && $distance <= (float) $request->input('radius');
        })->values();

        $items = $this->rankEvents($items, $request->user());

        return response()->json($this->queryService->paginateCollection(
            $items->map(fn (Event $event) => $this->serializeEvent($event, false, $request->user()?->id)),
            (int) $request->integer('per_page', 12)
        ));
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        abort_if($event->status !== 'published' && ! $request->user()?->hasAnyRole(['municipality_admin', 'town_manager', 'super_admin', 'operator']), 404);

        $event->load(['ticketTypes', 'organizer', 'creator'])->loadCount(['tickets as attendees_count', 'saves as saves_count']);

        $related = Event::query()
            ->whereKeyNot($event->id)
            ->where('status', 'published')
            ->where(function ($query) use ($event): void {
                $query->where('category', $event->category);
                if ($event->town) {
                    $query->orWhere('town', $event->town);
                }
            })
            ->orderBy('starts_at')
            ->limit(4)
            ->get()
            ->map(fn (Event $item) => $this->serializeEvent($item));

        return response()->json([
            'data' => $this->serializeEvent($event, true, $request->user()?->id),
            'related' => $related,
            'calendar' => $this->calendarService->calendarMeta($event),
        ]);
    }

    public function upcoming(Request $request): JsonResponse
    {
        $items = Event::query()
            ->where('status', 'published')
            ->where('starts_at', '>=', now())
            ->when(PilotLocation::isLocked(), fn ($query) => $query->where('town', PilotLocation::town()))
            ->orderBy('starts_at')
            ->limit((int) $request->integer('per_page', 12))
            ->get()
            ->pipe(fn ($events) => $this->rankEvents($events, $request->user()))
            ->map(fn (Event $event) => $this->serializeEvent($event, false, $request->user()?->id));

        return response()->json(['data' => $items]);
    }

    public function nearby(Request $request): JsonResponse
    {
        $items = Event::query()
            ->where('status', 'published')
            ->when(PilotLocation::isLocked(), fn ($query) => $query->where('town', PilotLocation::town()))
            ->orderBy('starts_at')
            ->get()
            ->filter(function (Event $event) use ($request): bool {
                if (! $request->filled('lat') || ! $request->filled('lng')) {
                    return true;
                }

                $distance = $this->locationService->distanceKm(
                    (float) $request->input('lat'),
                    (float) $request->input('lng'),
                    $event->lat,
                    $event->lng,
                );
                $event->distance_km = $distance;

                return $distance !== null && $distance <= (float) $request->input('radius', 25);
            })
            ->values()
            ->pipe(fn ($events) => $this->rankEvents($events, $request->user()))
            ->map(fn (Event $event) => $this->serializeEvent($event, false, $request->user()?->id));

        return response()->json(['data' => $items]);
    }

    public function calendar(Request $request): JsonResponse
    {
        $items = Event::query()
            ->where('status', 'published')
            ->where('starts_at', '>=', now()->startOfMonth())
            ->where('starts_at', '<=', now()->endOfMonth()->addMonth())
            ->when(PilotLocation::isLocked(), fn ($query) => $query->where('town', PilotLocation::town()))
            ->orderBy('starts_at')
            ->get()
            ->groupBy(fn (Event $event) => $event->starts_at?->toDateString() ?? 'unknown')
            ->map(fn ($events, $date) => [
                'date' => $date,
                'events' => $events->map(fn (Event $event) => $this->serializeEvent($event, false, $request->user()?->id))->values(),
            ])
            ->values();

        return response()->json(['data' => $items]);
    }

    public function myEvents(Request $request): JsonResponse
    {
        $user = $request->user();
        $items = Event::query()
            ->with(['ticketTypes', 'organizer'])
            ->withCount(['tickets as attendees_count', 'saves as saves_count'])
            ->where('created_by', $user->id)
            ->orWhere(function ($query) use ($user): void {
                $query->where('organizer_type', \App\Models\Organization::class)
                    ->whereIn('organizer_id', $user->ownedOrganizations()->pluck('id'));
            })
            ->latest('starts_at')
            ->paginate((int) $request->integer('per_page', 12));

        $items->setCollection($items->getCollection()->map(fn (Event $event) => $this->serializeEvent($event, true, $user->id)));

        return response()->json($items);
    }

    public function myTickets(Request $request): JsonResponse
    {
        $tickets = EventTicket::query()
            ->with(['event.organizer', 'ticketType'])
            ->where('user_id', $request->user()->id)
            ->latest('created_at')
            ->paginate((int) $request->integer('per_page', 12));

        $tickets->setCollection($tickets->getCollection()->map(fn (EventTicket $ticket) => $this->serializeTicket($ticket)));

        return response()->json($tickets);
    }

    public function save(Request $request, Event $event): JsonResponse
    {
        $this->eventService->saveEvent($request->user(), $event);

        return response()->json(['message' => 'Event saved.'], 201);
    }

    public function unsave(Request $request, Event $event): JsonResponse
    {
        $this->eventService->unsaveEvent($request->user(), $event);

        return response()->json(['message' => 'Event removed from saved list.']);
    }

    public function reminder(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'remind_at' => ['required', 'date'],
            'channel' => ['nullable', 'in:in_app,push,sms,email'],
        ]);

        $reminder = $this->eventReminderService->createReminder(
            $request->user(),
            $event,
            $validated['remind_at'],
            $validated['channel'] ?? 'in_app'
        );

        return response()->json(['data' => $reminder], 201);
    }

    public function reserveTicket(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'ticket_type_id' => ['nullable', 'integer', 'exists:event_ticket_types,id'],
            'holder_name' => ['nullable', 'string', 'max:255'],
            'holder_phone' => ['nullable', 'string', 'max:50'],
        ]);

        $ticketType = isset($validated['ticket_type_id'])
            ? EventTicketType::query()->findOrFail($validated['ticket_type_id'])
            : null;

        $ticket = $this->ticketService->reserveTicket($request->user(), $event, $ticketType, $validated);

        return response()->json(['data' => $this->serializeTicket($ticket)], 201);
    }

    public function cancelTicket(Request $request, EventTicket $ticket): JsonResponse
    {
        abort_unless(
            $ticket->user_id === $request->user()->id || $request->user()->hasAnyRole(['organization_admin', 'municipality_admin', 'town_manager', 'super_admin', 'operator']),
            403
        );

        $ticket = $this->ticketService->cancelTicket($ticket);

        return response()->json(['data' => $this->serializeTicket($ticket)]);
    }

    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate($this->eventRules());

        $event = $this->eventService->createEvent($request->user(), $validated);

        return response()->json(['data' => $this->serializeEvent($event, true, $request->user()->id)], 201);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $this->authorizeManage($request, $event);
        $validated = $request->validate($this->eventRules(false));
        $event = $this->eventService->updateEvent($event, $validated);

        return response()->json(['data' => $this->serializeEvent($event, true, $request->user()->id)]);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $this->authorizeManage($request, $event);
        $event->delete();

        return response()->json(['message' => 'Event deleted.']);
    }

    public function addTicketType(Request $request, Event $event): JsonResponse
    {
        $this->authorizeManage($request, $event);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'quantity_available' => ['nullable', 'integer', 'min:1'],
            'sales_start_at' => ['nullable', 'date'],
            'sales_end_at' => ['nullable', 'date', 'after_or_equal:sales_start_at'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $ticketType = $event->ticketTypes()->create($validated);
        $event->update(['ticketing_enabled' => true]);

        return response()->json(['data' => $ticketType], 201);
    }

    public function updateTicketType(Request $request, EventTicketType $ticketType): JsonResponse
    {
        $this->authorizeManage($request, $ticketType->event);
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'quantity_available' => ['nullable', 'integer', 'min:1'],
            'sales_start_at' => ['nullable', 'date'],
            'sales_end_at' => ['nullable', 'date', 'after_or_equal:sales_start_at'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $ticketType->update($validated);

        return response()->json(['data' => $ticketType->fresh()]);
    }

    public function eventTickets(Request $request, Event $event): JsonResponse
    {
        $this->authorizeManage($request, $event);
        $tickets = $event->tickets()->with(['user', 'ticketType'])->latest()->get()->map(fn (EventTicket $ticket) => $this->serializeTicket($ticket));

        return response()->json(['data' => $tickets]);
    }

    public function checkIn(Request $request, EventTicket $ticket): JsonResponse
    {
        $this->authorizeManage($request, $ticket->event);
        $ticket = $this->ticketService->checkInTicket($ticket);

        return response()->json(['data' => $this->serializeTicket($ticket)]);
    }

    public function downloadCalendar(Event $event): Response
    {
        $ics = $this->calendarService->generateIcs($event);

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="event-'.$event->id.'.ics"',
        ]);
    }

    private function authorizeManage(Request $request, Event $event): void
    {
        $user = $request->user();
        $ownsEvent = $event->created_by === $user->id;
        $ownsOrganization = $event->organizer_type === \App\Models\Organization::class
            && $user->ownedOrganizations()->whereKey($event->organizer_id)->exists();
        $ownsProvider = $event->organizer_type === \App\Models\ServiceProvider::class
            && \App\Models\ServiceProvider::query()->where('user_id', $user->id)->whereKey($event->organizer_id)->exists();

        abort_unless($ownsEvent || $ownsOrganization || $ownsProvider || $user->hasAnyRole(['municipality_admin', 'town_manager', 'super_admin', 'operator']), 403);
    }

    private function eventRules(bool $required = true): array
    {
        $prefix = $required ? ['required'] : ['sometimes'];

        return [
            'organizer_type' => ['nullable', 'in:organization,service_provider'],
            'organizer_id' => ['nullable', 'integer'],
            'title' => [...$prefix, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => [...$prefix, 'in:community,business,entertainment,sport,church,school,municipal,training,market,workshop,health,charity'],
            'venue_name' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'starts_at' => [...$prefix, 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'image_url' => ['nullable', 'url', 'max:255'],
            'status' => ['nullable', 'in:draft,published,cancelled,completed'],
            'is_free' => ['nullable', 'boolean'],
            'ticketing_enabled' => ['nullable', 'boolean'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'metadata' => ['nullable', 'array'],
            'is_featured' => ['nullable', 'boolean'],
        ];
    }

    private function serializeEvent(Event $event, bool $detailed = false, ?int $viewerId = null): array
    {
        $ticketTypes = $event->relationLoaded('ticketTypes') ? $event->ticketTypes : $event->ticketTypes()->get();
        $organizer = $event->relationLoaded('organizer') ? $event->organizer : $event->organizer;

        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'category' => $event->category,
            'venue_name' => $event->venue_name,
            'location' => $event->location,
            'location_label' => implode(', ', array_filter([$event->venue_name, $event->location, $event->area, $event->town])),
            'town' => $event->town,
            'area' => $event->area,
            'lat' => $event->lat,
            'lng' => $event->lng,
            'starts_at' => optional($event->starts_at)->toIso8601String(),
            'ends_at' => optional($event->ends_at)->toIso8601String(),
            'image_url' => $event->image_url,
            'status' => $event->status,
            'is_free' => $event->is_free,
            'ticketing_enabled' => $event->ticketing_enabled,
            'capacity' => $event->capacity,
            'metadata' => $event->metadata,
            'is_featured' => $event->is_featured,
            'distance_km' => $event->distance_km ?? null,
            'attendees_count' => (int) ($event->attendees_count ?? $event->tickets()->count()),
            'saves_count' => (int) ($event->saves_count ?? $event->saves()->count()),
            'is_saved' => $viewerId ? $event->saves()->where('user_id', $viewerId)->exists() : false,
            'ticket_price_from' => $ticketTypes->where('is_active', true)->pluck('price')->filter(fn ($price) => $price !== null)->min(),
            'ticket_price_to' => $ticketTypes->where('is_active', true)->pluck('price')->filter(fn ($price) => $price !== null)->max(),
            'organizer' => $organizer ? [
                'type' => $this->normalizeOrganizerType($event->organizer_type),
                'id' => $organizer->id,
                'name' => $organizer->name ?? ($organizer->title ?? 'Organizer'),
                'phone' => $organizer->phone ?? null,
                'whatsapp' => $organizer->whatsapp ?? null,
                'is_verified' => $organizer->is_verified ?? false,
            ] : null,
            'ticket_types' => $ticketTypes->map(fn (EventTicketType $type) => [
                'id' => $type->id,
                'name' => $type->name,
                'description' => $type->description,
                'price' => $type->price,
                'quantity_available' => $type->quantity_available,
                'quantity_sold' => $type->quantity_sold,
                'sales_start_at' => optional($type->sales_start_at)->toIso8601String(),
                'sales_end_at' => optional($type->sales_end_at)->toIso8601String(),
                'is_active' => $type->is_active,
            ])->values(),
            'calendar' => $this->calendarService->calendarMeta($event),
        ];
    }

    private function serializeTicket(EventTicket $ticket): array
    {
        $ticket->loadMissing(['event', 'ticketType', 'user']);

        return [
            'id' => $ticket->id,
            'event_id' => $ticket->event_id,
            'ticket_type_id' => $ticket->ticket_type_id,
            'user_id' => $ticket->user_id,
            'ticket_code' => $ticket->ticket_code,
            'status' => $ticket->status,
            'price_paid' => $ticket->price_paid,
            'holder_name' => $ticket->holder_name,
            'holder_phone' => $ticket->holder_phone,
            'qr_code_payload' => $ticket->qr_code_payload,
            'reserved_at' => optional($ticket->reserved_at)->toIso8601String(),
            'confirmed_at' => optional($ticket->confirmed_at)->toIso8601String(),
            'used_at' => optional($ticket->used_at)->toIso8601String(),
            'event' => $ticket->event ? $this->serializeEvent($ticket->event) : null,
            'ticket_type' => $ticket->ticketType ? [
                'id' => $ticket->ticketType->id,
                'name' => $ticket->ticketType->name,
                'price' => $ticket->ticketType->price,
            ] : null,
        ];
    }

    private function rankEvents(\Illuminate\Support\Collection $events, ?\App\Models\User $viewer): \Illuminate\Support\Collection
    {
        if (! $viewer) {
            return $events->sortByDesc(fn (Event $event) => sprintf('%05d-%s', $event->is_featured ? 99999 : 0, optional($event->starts_at)->timestamp ?? PHP_INT_MAX))->values();
        }

        $followedOrganizations = Follow::query()
            ->where('user_id', $viewer->id)
            ->where('followable_type', Organization::class)
            ->pluck('followable_id')
            ->all();

        $followedProviders = Follow::query()
            ->where('user_id', $viewer->id)
            ->where('followable_type', ServiceProvider::class)
            ->pluck('followable_id')
            ->all();

        return $events->sortByDesc(function (Event $event) use ($followedOrganizations, $followedProviders, $viewer): string {
            $score = 0;

            if ($event->is_featured) {
                $score += 200;
            }

            if ($event->town && $viewer->default_town && strcasecmp($event->town, $viewer->default_town) === 0) {
                $score += 80;
            }

            if ($event->area && $viewer->default_area && strcasecmp($event->area, $viewer->default_area) === 0) {
                $score += 50;
            }

            if ($event->organizer_type === Organization::class && in_array($event->organizer_id, $followedOrganizations, true)) {
                $score += 120;
            }

            if ($event->organizer_type === ServiceProvider::class && in_array($event->organizer_id, $followedProviders, true)) {
                $score += 120;
            }
            $timestamp = optional($event->starts_at)->timestamp ?? PHP_INT_MAX;

            return sprintf('%05d-%010d', $score, PHP_INT_MAX - $timestamp);
        })->values();
    }

    private function normalizeOrganizerType(?string $organizerType): ?string
    {
        return match ($organizerType) {
            Organization::class => 'organization',
            ServiceProvider::class => 'service_provider',
            default => null,
        };
    }
}
