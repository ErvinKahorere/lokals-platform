<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HireBookingResource;
use App\Http\Resources\HireItemResource;
use App\Models\HireBooking;
use App\Models\HireItem;
use App\Models\Organization;
use App\Notifications\SystemNotification;
use App\Support\HireAvailability;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HireItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HireItem::query()
            ->with(['owner:id,name,phone,avatar,default_town,default_area', 'business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified'])
            ->withCount('bookings')
            ->where('verification_status', HireItem::VERIFICATION_APPROVED)
            ->where('status', HireItem::STATUS_ACTIVE)
            ->latest();

        if ($category = $request->string('category')->value()) {
            $query->where('category', $category);
        }

        if ($town = $request->string('town')->value()) {
            $query->where('town', $town);
        }

        if ($area = $request->string('area')->value()) {
            $query->where('area', $area);
        }

        if ($request->boolean('delivery_available')) {
            $query->where('delivery_available', true);
        }

        if ($search = $request->string('q')->value()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        return response()->json([
            'data' => HireItemResource::collection($query->paginate((int) $request->integer('per_page', 18))),
        ]);
    }

    public function show(Request $request, HireItem $hireItem): JsonResponse
    {
        if (
            $hireItem->verification_status !== HireItem::VERIFICATION_APPROVED
            && ! $this->canManageItem($request->user(), $hireItem)
        ) {
            abort(404);
        }

        return response()->json([
            'data' => HireItemResource::make($hireItem->load(['owner:id,name,phone,avatar,default_town,default_area', 'business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified'])->loadCount('bookings')),
        ]);
    }

    public function myItems(Request $request): JsonResponse
    {
        $items = HireItem::query()
            ->with(['business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified'])
            ->withCount('bookings')
            ->where('owner_id', $request->user()->id)
            ->latest()
            ->paginate((int) $request->integer('per_page', 15));

        return response()->json([
            'data' => HireItemResource::collection($items),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateItem($request);

        if (isset($validated['business_id'])) {
            $business = Organization::query()->findOrFail($validated['business_id']);
            abort_unless((int) $business->owner_user_id === (int) $request->user()->id || $request->user()->hasAnyRole(['super_admin', 'operator']), 403);
        }

        $item = HireItem::query()->create([
            ...$validated,
            'owner_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Hire item created.',
            'data' => HireItemResource::make($item->load(['owner:id,name,phone,avatar,default_town,default_area', 'business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified'])->loadCount('bookings')),
        ], 201);
    }

    public function update(Request $request, HireItem $hireItem): JsonResponse
    {
        abort_unless($this->canManageItem($request->user(), $hireItem), 403);

        $validated = $this->validateItem($request, true);
        $hireItem->update($validated);

        return response()->json([
            'message' => 'Hire item updated.',
            'data' => HireItemResource::make($hireItem->fresh()->load(['owner:id,name,phone,avatar,default_town,default_area', 'business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified'])->loadCount('bookings')),
        ]);
    }

    public function destroy(Request $request, HireItem $hireItem): JsonResponse
    {
        abort_unless($this->canManageItem($request->user(), $hireItem), 403);

        $hireItem->delete();

        return response()->json(['message' => 'Hire item deleted.']);
    }

    public function book(Request $request, HireItem $hireItem): JsonResponse
    {
        abort_if($hireItem->verification_status !== HireItem::VERIFICATION_APPROVED || $hireItem->status !== HireItem::STATUS_ACTIVE, 422, 'This hire item is not available for booking right now.');

        $validated = $request->validate([
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
            'pickup_method' => ['required', 'string', 'in:pickup,delivery'],
            'delivery_address' => ['nullable', 'string', 'max:255'],
            'delivery_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'delivery_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'notes' => ['nullable', 'string'],
        ]);

        $start = Carbon::parse($validated['start_at']);
        $end = Carbon::parse($validated['end_at']);
        abort_if(! HireAvailability::isAvailable($hireItem, $start, $end), 422, 'This item is already booked for part of the requested time range.');
        abort_if($validated['pickup_method'] === 'delivery' && ! $hireItem->delivery_available, 422, 'This item is pickup-only right now.');

        $booking = DB::transaction(function () use ($request, $hireItem, $validated, $start, $end) {
            $days = max(1, (int) ceil($end->diffInMinutes($start) / 1440));
            $hours = max(1, (int) ceil($end->diffInMinutes($start) / 60));
            $rentalFee = $hireItem->price_per_day
                ? round((float) $hireItem->price_per_day * $days, 2)
                : round((float) ($hireItem->price_per_hour ?? 0) * $hours, 2);
            $deliveryFee = $validated['pickup_method'] === 'delivery' ? 35.00 : 0.00;
            $deposit = round((float) ($hireItem->deposit_amount ?? 0), 2);

            /** @var HireBooking $booking */
            $booking = HireBooking::query()->create([
                'hire_item_id' => $hireItem->id,
                'customer_id' => $request->user()->id,
                'owner_id' => $hireItem->owner_id,
                'status' => HireBooking::STATUS_PENDING,
                'start_at' => $start,
                'end_at' => $end,
                'quantity' => (int) ($validated['quantity'] ?? 1),
                'rental_fee' => $rentalFee,
                'deposit_amount' => $deposit,
                'delivery_fee' => $deliveryFee,
                'total' => round($rentalFee + $deposit + $deliveryFee, 2),
                'payment_status' => 'pending',
                'pickup_method' => $validated['pickup_method'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_latitude' => $validated['delivery_latitude'] ?? null,
                'delivery_longitude' => $validated['delivery_longitude'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            return $booking->load($this->bookingRelations());
        });

        $hireItem->owner?->notify(new SystemNotification(
            'New hire booking request',
            'A customer requested to hire one of your rental items.',
            $this->bookingTarget($booking)
        ));

        return response()->json([
            'message' => 'Hire booking requested.',
            'data' => HireBookingResource::make($booking),
        ], 201);
    }

    protected function validateItem(Request $request, bool $partial = false): array
    {
        $required = $partial ? ['sometimes'] : ['required'];

        return $request->validate([
            'business_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'title' => [...$required, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => [...$required, 'string', 'max:100'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'price_per_hour' => ['nullable', 'numeric', 'min:0'],
            'price_per_day' => ['nullable', 'numeric', 'min:0'],
            'deposit_amount' => ['nullable', 'numeric', 'min:0'],
            'replacement_value' => ['nullable', 'numeric', 'min:0'],
            'delivery_available' => ['nullable', 'boolean'],
            'pickup_available' => ['nullable', 'boolean'],
            'condition' => ['nullable', 'string', 'max:60'],
            'status' => ['nullable', 'string', 'max:40'],
            'verification_status' => ['nullable', 'string', 'max:40'],
            'images' => ['nullable', 'array'],
            'rules' => ['nullable', 'array'],
            'included_items' => ['nullable', 'array'],
            'unavailable_dates' => ['nullable', 'array'],
        ]);
    }

    protected function canManageItem(?object $user, HireItem $hireItem): bool
    {
        return $user !== null
            && (
                (int) $hireItem->owner_id === (int) $user->id
                || $user->hasAnyRole(['super_admin', 'operator', 'town_manager', 'municipality_admin'])
            );
    }

    protected function bookingRelations(): array
    {
        return [
            'item.owner:id,name,phone,avatar,default_town,default_area',
            'item.business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified',
            'customer:id,name,phone,avatar,default_town,default_area',
            'owner:id,name,phone,avatar,default_town,default_area',
            'courier:id,name,phone,avatar,default_town,default_area',
        ];
    }

    protected function bookingTarget(HireBooking $booking): array
    {
        return [
            'target' => [
                'type' => 'hire_booking',
                'id' => $booking->id,
                'href' => '/hire/bookings/'.$booking->id,
                'title' => sprintf('Hire booking HIRE-%05d', $booking->id),
            ],
            'status' => $booking->status,
        ];
    }
}
