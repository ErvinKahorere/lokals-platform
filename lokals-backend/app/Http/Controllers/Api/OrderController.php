<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Product;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with($this->relations())
            ->where('user_id', $request->user()->id)
            ->latest();

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($request->boolean('active')) {
            $query->whereNotIn('status', [Order::STATUS_DELIVERED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED]);
        }

        return response()->json([
            'data' => OrderResource::collection($query->paginate((int) $request->integer('per_page', 15))),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_id' => ['required', 'integer', 'exists:organizations,id'],
            'town' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'string', 'max:60'],
            'payment_status' => ['nullable', 'string', 'max:60'],
            'delivery_address' => ['required', 'string', 'max:255'],
            'delivery_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'delivery_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'notes' => ['nullable', 'string'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
            'service_fee' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.name' => ['nullable', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        /** @var Organization $business */
        $business = Organization::query()->findOrFail($validated['business_id']);
        $items = collect($validated['items']);
        $products = Product::query()
            ->whereIn('id', $items->pluck('product_id')->filter()->all())
            ->get()
            ->keyBy('id');

        $serializedItems = $this->buildOrderItems($items, $products, $business);
        $subtotal = (float) $serializedItems->sum('total_price');
        $deliveryFee = round((float) ($validated['delivery_fee'] ?? 25), 2);
        $serviceFee = round((float) ($validated['service_fee'] ?? ($subtotal * 0.05)), 2);
        $total = round($subtotal + $deliveryFee + $serviceFee, 2);

        $order = DB::transaction(function () use ($request, $validated, $business, $serializedItems, $subtotal, $deliveryFee, $serviceFee, $total) {
            /** @var Order $order */
            $order = Order::query()->create([
                'user_id' => $request->user()->id,
                'business_id' => $business->id,
                'town' => $validated['town'] ?? $business->town ?? $request->user()->default_town,
                'area' => $validated['area'] ?? $business->area ?? $request->user()->default_area,
                'status' => Order::STATUS_PENDING,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'service_fee' => $serviceFee,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_status'] ?? 'pending',
                'delivery_address' => $validated['delivery_address'],
                'delivery_latitude' => $validated['delivery_latitude'] ?? null,
                'delivery_longitude' => $validated['delivery_longitude'] ?? null,
                'pickup_address' => $business->location ?? $business->name,
                'pickup_latitude' => $business->lat,
                'pickup_longitude' => $business->lng,
                'notes' => $validated['notes'] ?? null,
            ]);

            $order->items()->createMany($serializedItems->all());

            return $order->fresh($this->relations());
        });

        $this->notifyOrderPlaced($order);

        return response()->json([
            'message' => 'Order placed successfully.',
            'data' => OrderResource::make($order),
        ], 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($this->canView($request->user(), $order), 403);

        return response()->json([
            'data' => OrderResource::make($order->load($this->relations())),
        ]);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        abort_unless(in_array($order->status, [
            Order::STATUS_PENDING,
            Order::STATUS_ACCEPTED,
            Order::STATUS_PREPARING,
            Order::STATUS_READY_FOR_PICKUP,
        ], true), 422, 'This order can no longer be cancelled.');

        $order->update([
            'status' => Order::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        $order->business?->owner?->notify(new SystemNotification(
            'Order cancelled',
            'A customer cancelled an order before courier handoff.',
            $this->notificationTarget($order)
        ));

        return response()->json([
            'message' => 'Order cancelled.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }

    public function rate(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        abort_unless($order->status === Order::STATUS_DELIVERED, 422, 'Only delivered orders can be rated.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $order->update([
            'customer_rating' => $validated['rating'],
            'customer_rating_comment' => $validated['comment'] ?? null,
            'rated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Order rating saved.',
            'data' => OrderResource::make($order->fresh($this->relations())),
        ]);
    }

    protected function canView(User $user, Order $order): bool
    {
        return $order->user_id === $user->id
            || $order->courier_id === $user->id
            || $order->business?->owner_user_id === $user->id
            || $user->hasAnyRole(['operator', 'super_admin', 'town_manager', 'municipality_admin']);
    }

    protected function relations(): array
    {
        return [
            'customer:id,name,phone,avatar,default_town,default_area',
            'business:id,owner_user_id,name,category,phone,whatsapp,logo_url,town,area,location,lat,lng,is_verified',
            'business.owner:id,name,phone',
            'courier:id,name,phone,avatar,default_town,default_area',
            'items.product:id,title,image_path',
        ];
    }

    /**
     * @param Collection<int, array<string, mixed>> $items
     * @param Collection<int, Product> $products
     * @return Collection<int, array<string, mixed>>
     */
    protected function buildOrderItems(Collection $items, Collection $products, Organization $business): Collection
    {
        return $items->map(function (array $item) use ($products, $business): array {
            $product = isset($item['product_id']) ? $products->get((int) $item['product_id']) : null;

            if ($product && (int) $product->business_id !== (int) $business->id) {
                abort(422, 'All ordered products must belong to the selected seller.');
            }

            $unitPrice = $product
                ? (float) ($product->sale_price ?? $product->price)
                : round((float) ($item['unit_price'] ?? 0), 2);

            if (! $product && blank($item['name'])) {
                abort(422, 'Custom order items require a name.');
            }

            return [
                'product_id' => $product?->id,
                'name' => $product?->title ?? (string) $item['name'],
                'quantity' => (int) $item['quantity'],
                'unit_price' => round($unitPrice, 2),
                'total_price' => round($unitPrice * (int) $item['quantity'], 2),
                'notes' => $item['notes'] ?? null,
            ];
        });
    }

    protected function notifyOrderPlaced(Order $order): void
    {
        $order->business?->owner?->notify(new SystemNotification(
            'New order received',
            'A customer placed a new order that needs seller review.',
            $this->notificationTarget($order)
        ));

        $order->customer?->notify(new SystemNotification(
            'Order placed',
            'Your order has been sent to the seller for review.',
            $this->notificationTarget($order)
        ));
    }

    /**
     * @return array<string, mixed>
     */
    protected function notificationTarget(Order $order): array
    {
        return [
            'target' => [
                'type' => 'order',
                'id' => $order->id,
                'href' => '/orders/'.$order->id,
                'title' => sprintf('Order ORD-%05d', $order->id),
            ],
            'status' => $order->status,
        ];
    }

    /**
     * @return array<int, int>
     */
    protected function availableCourierAudienceIds(?string $town): array
    {
        return User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', 'courier'))
            ->whereHas('courierProfile', fn ($query) => $query->where('is_online', true)->where('is_verified', true))
            ->when($town, fn ($query) => $query->where('default_town', $town))
            ->pluck('id')
            ->all();
    }

    protected function notifyCouriersOrderReady(Order $order): void
    {
        $audienceIds = $this->availableCourierAudienceIds($order->town);
        if ($audienceIds === []) {
            return;
        }

        Notification::send(
            User::query()->whereIn('id', $audienceIds)->get(),
            new SystemNotification(
                'Order ready for pickup',
                'A seller has prepared an order that needs courier pickup.',
                $this->notificationTarget($order)
            )
        );
    }
}
