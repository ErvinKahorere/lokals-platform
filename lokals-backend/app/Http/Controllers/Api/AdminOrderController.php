<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with([
                'customer:id,name,phone,default_town,default_area',
                'business:id,owner_user_id,name,category,town,area',
                'courier:id,name,phone',
                'items.product:id,title,image_path',
            ])
            ->latest();

        foreach (['status', 'payment_status', 'town', 'business_id', 'courier_id'] as $filter) {
            if ($value = $request->string($filter)->value()) {
                $query->where($filter, $value);
            }
        }

        return response()->json([
            'data' => OrderResource::collection($query->paginate((int) $request->integer('per_page', 25))),
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json([
            'data' => OrderResource::make($order->load([
                'customer:id,name,phone,default_town,default_area',
                'business:id,owner_user_id,name,category,town,area',
                'courier:id,name,phone',
                'items.product:id,title,image_path',
            ])),
        ]);
    }
}
