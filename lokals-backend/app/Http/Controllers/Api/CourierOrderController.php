<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OrderResource;
use App\Models\CourierProfile;
use App\Models\Order;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourierOrderController extends OrderController
{
    public function available(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier') || $request->user()->hasRole('super_admin'), 403);

        $query = Order::query()
            ->with($this->relations())
            ->where('status', Order::STATUS_READY_FOR_PICKUP)
            ->whereNull('courier_id')
            ->when($request->user()->default_town, fn ($builder) => $builder->where('town', $request->user()->default_town))
            ->latest();

        return response()->json([
            'data' => OrderResource::collection($query->paginate((int) $request->integer('per_page', 20))),
        ]);
    }

    public function accept(Request $request, Order $order): JsonResponse
    {
        abort_unless($request->user()->hasRole('courier') || $request->user()->hasRole('super_admin'), 403);
        abort_unless($order->status === Order::STATUS_READY_FOR_PICKUP, 422, 'This order is not ready for courier pickup.');
        abort_unless($order->courier_id === null || $order->courier_id === $request->user()->id, 422, 'This order is already assigned.');

        $order->update([
            'courier_id' => $request->user()->id,
            'status' => Order::STATUS_COURIER_ASSIGNED,
        ]);

        $order->customer?->notify(new SystemNotification(
            'Courier assigned to your order',
            $request->user()->name.' will handle your order delivery.',
            $this->notificationTarget($order)
        ));

        return response()->json([
            'message' => 'Order delivery accepted.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }

    public function pickedUp(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->courier_id === $request->user()->id, 403);
        abort_unless(in_array($order->status, [Order::STATUS_COURIER_ASSIGNED, Order::STATUS_READY_FOR_PICKUP], true), 422, 'This order cannot be picked up yet.');

        $order->update([
            'status' => Order::STATUS_PICKED_UP,
            'picked_up_at' => now(),
        ]);

        $order->customer?->notify(new SystemNotification(
            'Order picked up',
            'Your order is now on the way.',
            $this->notificationTarget($order)
        ));

        return response()->json([
            'message' => 'Order picked up.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }

    public function delivered(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->courier_id === $request->user()->id, 403);
        abort_unless($order->status === Order::STATUS_PICKED_UP, 422, 'This order cannot be delivered yet.');

        $order->update([
            'status' => Order::STATUS_DELIVERED,
            'delivered_at' => now(),
        ]);

        $profile = CourierProfile::query()->where('user_id', $request->user()->id)->first();
        if ($profile) {
            $profile->increment('completed_deliveries');
            $profile->increment('lifetime_earnings', (float) ($order->delivery_fee ?? 0));
        }

        $order->customer?->notify(new SystemNotification(
            'Order delivered',
            'Your order has been delivered. You can now rate the experience.',
            $this->notificationTarget($order)
        ));

        return response()->json([
            'message' => 'Order delivered.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }
}
