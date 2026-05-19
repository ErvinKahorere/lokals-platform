<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HireBookingResource;
use App\Http\Resources\HireItemResource;
use App\Models\HireBooking;
use App\Models\HireItem;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminHireController extends Controller
{
    public function items(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator', 'town_manager', 'municipality_admin']), 403);

        $query = HireItem::query()
            ->with(['owner:id,name,phone,avatar,default_town,default_area', 'business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified'])
            ->withCount('bookings')
            ->latest();

        if ($status = $request->string('verification_status')->value()) {
            $query->where('verification_status', $status);
        }

        return response()->json([
            'data' => HireItemResource::collection($query->paginate((int) $request->integer('per_page', 20))),
        ]);
    }

    public function bookings(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator', 'town_manager', 'municipality_admin']), 403);

        $query = HireBooking::query()
            ->with(['item.owner:id,name,phone,avatar,default_town,default_area', 'item.business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified', 'customer:id,name,phone,avatar,default_town,default_area', 'owner:id,name,phone,avatar,default_town,default_area', 'courier:id,name,phone,avatar,default_town,default_area'])
            ->latest();

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return response()->json([
            'data' => HireBookingResource::collection($query->paginate((int) $request->integer('per_page', 20))),
        ]);
    }

    public function approve(Request $request, HireItem $hireItem): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator', 'town_manager', 'municipality_admin']), 403);

        $hireItem->update([
            'verification_status' => HireItem::VERIFICATION_APPROVED,
            'status' => HireItem::STATUS_ACTIVE,
        ]);

        $hireItem->owner?->notify(new SystemNotification(
            'Hire listing approved',
            'Your hire listing is now live for local customers.',
            $this->target($hireItem)
        ));

        return response()->json([
            'message' => 'Hire item approved.',
            'data' => HireItemResource::make($hireItem->fresh()->load(['owner:id,name,phone,avatar,default_town,default_area', 'business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified'])->loadCount('bookings')),
        ]);
    }

    public function reject(Request $request, HireItem $hireItem): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator', 'town_manager', 'municipality_admin']), 403);

        $hireItem->update([
            'verification_status' => HireItem::VERIFICATION_REJECTED,
            'status' => HireItem::STATUS_PAUSED,
        ]);

        $hireItem->owner?->notify(new SystemNotification(
            'Hire listing needs changes',
            'Your hire listing was rejected for now. Please review the listing and try again.',
            $this->target($hireItem)
        ));

        return response()->json([
            'message' => 'Hire item rejected.',
            'data' => HireItemResource::make($hireItem->fresh()->load(['owner:id,name,phone,avatar,default_town,default_area', 'business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified'])->loadCount('bookings')),
        ]);
    }

    public function resolveDispute(Request $request, HireBooking $hireBooking): JsonResponse
    {
        abort_unless($request->user()->hasAnyRole(['super_admin', 'operator', 'town_manager', 'municipality_admin']), 403);

        $validated = $request->validate([
            'owner_notes' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:returned,completed,cancelled'],
        ]);

        $status = $validated['status'] ?? HireBooking::STATUS_COMPLETED;
        $hireBooking->update([
            'status' => $status,
            'owner_notes' => $validated['owner_notes'] ?? $hireBooking->owner_notes,
            'completed_at' => $status === HireBooking::STATUS_COMPLETED ? now() : $hireBooking->completed_at,
            'cancelled_at' => $status === HireBooking::STATUS_CANCELLED ? now() : $hireBooking->cancelled_at,
            'returned_at' => $status === HireBooking::STATUS_RETURNED ? now() : $hireBooking->returned_at,
        ]);

        return response()->json([
            'message' => 'Hire booking dispute resolved.',
            'data' => HireBookingResource::make($hireBooking->fresh()->load(['item.owner:id,name,phone,avatar,default_town,default_area', 'item.business:id,name,owner_user_id,category,phone,whatsapp,logo_url,town,area,location,is_verified', 'customer:id,name,phone,avatar,default_town,default_area', 'owner:id,name,phone,avatar,default_town,default_area', 'courier:id,name,phone,avatar,default_town,default_area'])),
        ]);
    }

    protected function target(HireItem $hireItem): array
    {
        return [
            'target' => [
                'type' => 'hire_item',
                'id' => $hireItem->id,
                'href' => '/hire/'.$hireItem->id,
                'title' => $hireItem->title,
            ],
            'status' => $hireItem->verification_status,
        ];
    }
}
