<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HireBookingResource;
use App\Models\HireBooking;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HireBookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HireBooking::query()
            ->with($this->relations())
            ->where('customer_id', $request->user()->id)
            ->latest();

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return response()->json([
            'data' => HireBookingResource::collection($query->paginate((int) $request->integer('per_page', 15))),
        ]);
    }

    public function show(Request $request, HireBooking $hireBooking): JsonResponse
    {
        abort_unless($this->canView($request->user(), $hireBooking), 403);

        return response()->json([
            'data' => HireBookingResource::make($hireBooking->load($this->relations())),
        ]);
    }

    public function ownerBookings(Request $request): JsonResponse
    {
        $query = HireBooking::query()
            ->with($this->relations())
            ->where('owner_id', $request->user()->id)
            ->latest();

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return response()->json([
            'data' => HireBookingResource::collection($query->paginate((int) $request->integer('per_page', 15))),
        ]);
    }

    public function cancel(Request $request, HireBooking $hireBooking): JsonResponse
    {
        abort_unless((int) $hireBooking->customer_id === (int) $request->user()->id, 403);
        abort_unless(in_array($hireBooking->status, [HireBooking::STATUS_PENDING, HireBooking::STATUS_ACCEPTED, HireBooking::STATUS_CONFIRMED], true), 422, 'This hire booking can no longer be cancelled.');

        $hireBooking->update([
            'status' => HireBooking::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        $hireBooking->owner?->notify(new SystemNotification(
            'Hire booking cancelled',
            'A customer cancelled a hire booking before handover.',
            $this->target($hireBooking)
        ));

        return response()->json([
            'message' => 'Hire booking cancelled.',
            'data' => HireBookingResource::make($hireBooking->fresh()->load($this->relations())),
        ]);
    }

    public function rate(Request $request, HireBooking $hireBooking): JsonResponse
    {
        abort_unless((int) $hireBooking->customer_id === (int) $request->user()->id, 403);
        abort_unless(in_array($hireBooking->status, [HireBooking::STATUS_COMPLETED, HireBooking::STATUS_RETURNED], true), 422, 'This hire booking cannot be rated yet.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $hireBooking->update([
            'customer_rating' => $validated['rating'],
            'customer_rating_comment' => $validated['comment'] ?? null,
            'rated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Hire booking rated.',
            'data' => HireBookingResource::make($hireBooking->fresh()->load($this->relations())),
        ]);
    }

    public function accept(Request $request, HireBooking $hireBooking): JsonResponse
    {
        return $this->transition($request, $hireBooking, HireBooking::STATUS_ACCEPTED, [
            'accepted_at' => now(),
        ], 'Hire booking accepted', 'Your hire booking was accepted by the owner.');
    }

    public function reject(Request $request, HireBooking $hireBooking): JsonResponse
    {
        return $this->transition($request, $hireBooking, HireBooking::STATUS_REJECTED, [], 'Hire booking rejected', 'Your hire booking was rejected by the owner.');
    }

    public function confirm(Request $request, HireBooking $hireBooking): JsonResponse
    {
        return $this->transition($request, $hireBooking, HireBooking::STATUS_CONFIRMED, [], 'Hire booking confirmed', 'The owner confirmed the hire arrangement.');
    }

    public function handedOver(Request $request, HireBooking $hireBooking): JsonResponse
    {
        return $this->transition($request, $hireBooking, HireBooking::STATUS_HANDED_OVER, [
            'handed_over_at' => now(),
        ], 'Item handed over', 'The hire item was handed over to the customer.');
    }

    public function returned(Request $request, HireBooking $hireBooking): JsonResponse
    {
        abort_unless(
            (int) $hireBooking->owner_id === (int) $request->user()->id
            || (int) $hireBooking->customer_id === (int) $request->user()->id
            || $request->user()->hasAnyRole(['super_admin', 'operator']),
            403
        );

        $hireBooking->update([
            'status' => HireBooking::STATUS_RETURNED,
            'returned_at' => now(),
        ]);

        $hireBooking->customer?->notify(new SystemNotification(
            'Item returned',
            'The hire item has been marked as returned.',
            $this->target($hireBooking)
        ));
        $hireBooking->owner?->notify(new SystemNotification(
            'Item returned',
            'The hire item has been marked as returned.',
            $this->target($hireBooking)
        ));

        return response()->json([
            'message' => 'Item returned.',
            'data' => HireBookingResource::make($hireBooking->fresh()->load($this->relations())),
        ]);
    }

    public function complete(Request $request, HireBooking $hireBooking): JsonResponse
    {
        return $this->transition($request, $hireBooking, HireBooking::STATUS_COMPLETED, [
            'completed_at' => now(),
        ], 'Hire booking completed', 'The hire booking is complete.');
    }

    protected function transition(Request $request, HireBooking $hireBooking, string $status, array $extra, string $title, string $customerBody): JsonResponse
    {
        abort_unless((int) $hireBooking->owner_id === (int) $request->user()->id || $request->user()->hasAnyRole(['super_admin', 'operator']), 403);

        $hireBooking->update([
            'status' => $status,
            ...$extra,
        ]);

        $hireBooking->customer?->notify(new SystemNotification($title, $customerBody, $this->target($hireBooking)));

        return response()->json([
            'message' => $title.'.',
            'data' => HireBookingResource::make($hireBooking->fresh()->load($this->relations())),
        ]);
    }

    protected function canView(object $user, HireBooking $booking): bool
    {
        return (int) $booking->customer_id === (int) $user->id
            || (int) $booking->owner_id === (int) $user->id
            || (int) ($booking->courier_id ?? 0) === (int) $user->id
            || $user->hasAnyRole(['super_admin', 'operator', 'town_manager', 'municipality_admin']);
    }

    protected function relations(): array
    {
        return [
            'item.owner:id,name,phone,avatar,default_town,default_area',
            'item.business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified',
            'customer:id,name,phone,avatar,default_town,default_area',
            'owner:id,name,phone,avatar,default_town,default_area',
            'courier:id,name,phone,avatar,default_town,default_area',
        ];
    }

    protected function target(HireBooking $booking): array
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
