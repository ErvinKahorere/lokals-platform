<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerOrderController extends OrderController
{
    public function index(Request $request): JsonResponse
    {
        $businessIds = $request->user()->ownedOrganizations()->pluck('id');

        $query = Order::query()
            ->with($this->relations())
            ->whereIn('business_id', $businessIds)
            ->latest();

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        return response()->json([
            'data' => OrderResource::collection($query->paginate((int) $request->integer('per_page', 20))),
        ]);
    }

    public function accept(Request $request, Order $order): JsonResponse
    {
        $this->authorizeSeller($request, $order);
        abort_unless($order->status === Order::STATUS_PENDING, 422, 'This order can no longer be accepted.');

        $order->update([
            'status' => Order::STATUS_ACCEPTED,
            'accepted_at' => now(),
        ]);

        $order->customer?->notify(new SystemNotification(
            'Seller accepted your order',
            'Your order is now moving into preparation.',
            $this->notificationTarget($order)
        ));

        return response()->json([
            'message' => 'Order accepted.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }

    public function reject(Request $request, Order $order): JsonResponse
    {
        $this->authorizeSeller($request, $order);
        abort_unless($order->status === Order::STATUS_PENDING, 422, 'This order can no longer be rejected.');

        $order->update([
            'status' => Order::STATUS_REJECTED,
            'cancelled_at' => now(),
        ]);

        $order->customer?->notify(new SystemNotification(
            'Seller could not fulfill the order',
            'The seller rejected this order. You can place a new order anytime.',
            $this->notificationTarget($order)
        ));

        return response()->json([
            'message' => 'Order rejected.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }

    public function preparing(Request $request, Order $order): JsonResponse
    {
        $this->authorizeSeller($request, $order);
        abort_unless(in_array($order->status, [Order::STATUS_ACCEPTED, Order::STATUS_PREPARING], true), 422, 'This order cannot move to preparing.');

        $order->update([
            'status' => Order::STATUS_PREPARING,
            'preparing_at' => $order->preparing_at ?? now(),
        ]);

        $order->customer?->notify(new SystemNotification(
            'Order is being prepared',
            'The seller has started preparing your order.',
            $this->notificationTarget($order)
        ));

        return response()->json([
            'message' => 'Order marked as preparing.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }

    public function ready(Request $request, Order $order): JsonResponse
    {
        $this->authorizeSeller($request, $order);
        abort_unless(in_array($order->status, [Order::STATUS_ACCEPTED, Order::STATUS_PREPARING], true), 422, 'This order cannot be marked ready.');

        $order->update([
            'status' => Order::STATUS_READY_FOR_PICKUP,
            'ready_at' => now(),
        ]);

        $order->customer?->notify(new SystemNotification(
            'Order ready for courier pickup',
            'Your order is packed and waiting for a courier.',
            $this->notificationTarget($order)
        ));
        $this->notifyCouriersOrderReady($order->fresh($this->relations()));

        return response()->json([
            'message' => 'Order marked ready.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }

    private function authorizeSeller(Request $request, Order $order): void
    {
        abort_unless(
            $order->business?->owner_user_id === $request->user()->id || $request->user()->hasAnyRole(['super_admin', 'operator']),
            403
        );
    }
}
