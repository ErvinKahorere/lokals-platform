<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderDeliveryFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_customer_can_create_order_and_totals_are_calculated_correctly(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $product = Product::query()->where('title', 'Fresh spinach family pack')->firstOrFail();

        Sanctum::actingAs($resident);
        $response = $this->postJson('/api/v1/orders', [
            'business_id' => $product->business_id,
            'payment_method' => 'cash',
            'delivery_address' => 'House 7, Nau-Aib, Okahandja',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])->assertCreated();

        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'user_id' => $resident->id,
            'status' => Order::STATUS_PENDING,
            'subtotal' => '140.00',
            'delivery_fee' => '25.00',
            'service_fee' => '7.00',
            'total' => '172.00',
        ]);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => '70.00',
            'total_price' => '140.00',
        ]);
    }

    public function test_seller_can_accept_prepare_and_ready_an_order(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $product = Product::query()->where('title', 'Fresh spinach family pack')->firstOrFail();
        $seller = $product->business?->owner;
        $this->assertNotNull($seller);

        Sanctum::actingAs($resident);
        $orderResponse = $this->postJson('/api/v1/orders', [
            'business_id' => $product->business_id,
            'payment_method' => 'cash',
            'delivery_address' => 'House 7, Nau-Aib, Okahandja',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $orderId = $orderResponse->json('data.id');

        Sanctum::actingAs($seller);
        $this->postJson("/api/v1/seller/orders/{$orderId}/accept")->assertOk()->assertJsonPath('data.status', Order::STATUS_ACCEPTED);
        $this->postJson("/api/v1/seller/orders/{$orderId}/preparing")->assertOk()->assertJsonPath('data.status', Order::STATUS_PREPARING);
        $this->postJson("/api/v1/seller/orders/{$orderId}/ready")->assertOk()->assertJsonPath('data.status', Order::STATUS_READY_FOR_PICKUP);
    }

    public function test_courier_can_accept_pick_up_and_deliver_ready_order(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $product = Product::query()->where('title', 'Fresh spinach family pack')->firstOrFail();
        $seller = $product->business?->owner;
        $courier = User::query()->where('email', 'courier@lokals.app')->firstOrFail();
        $this->assertNotNull($seller);

        Sanctum::actingAs($resident);
        $orderResponse = $this->postJson('/api/v1/orders', [
            'business_id' => $product->business_id,
            'payment_method' => 'cash',
            'delivery_address' => 'House 7, Nau-Aib, Okahandja',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();
        $orderId = $orderResponse->json('data.id');

        Sanctum::actingAs($seller);
        $this->postJson("/api/v1/seller/orders/{$orderId}/accept")->assertOk();
        $this->postJson("/api/v1/seller/orders/{$orderId}/ready")->assertOk();

        Sanctum::actingAs($courier);
        $this->postJson("/api/v1/courier/orders/{$orderId}/accept")->assertOk()->assertJsonPath('data.status', Order::STATUS_COURIER_ASSIGNED);
        $this->postJson("/api/v1/courier/orders/{$orderId}/picked-up")->assertOk()->assertJsonPath('data.status', Order::STATUS_PICKED_UP);
        $this->postJson("/api/v1/courier/orders/{$orderId}/delivered")->assertOk()->assertJsonPath('data.status', Order::STATUS_DELIVERED);
    }

    public function test_non_owner_cannot_access_someone_elses_order(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $otherResident = User::query()->where('email', 'resident@lokals.test')->firstOrFail();
        $product = Product::query()->where('title', 'Fresh spinach family pack')->firstOrFail();

        Sanctum::actingAs($resident);
        $orderResponse = $this->postJson('/api/v1/orders', [
            'business_id' => $product->business_id,
            'payment_method' => 'cash',
            'delivery_address' => 'House 7, Nau-Aib, Okahandja',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        Sanctum::actingAs($otherResident);
        $this->getJson('/api/v1/orders/'.$orderResponse->json('data.id'))->assertForbidden();
    }
}
