<?php

namespace Tests\Feature;

use App\Models\HireBooking;
use App\Models\HireItem;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HireFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_owner_can_create_hire_item(): void
    {
        $owner = User::query()->where('email', 'market@lokals.app')->firstOrFail();
        $business = Organization::query()->where('owner_user_id', $owner->id)->firstOrFail();

        Sanctum::actingAs($owner);
        $this->postJson('/api/v1/hire/items', [
            'business_id' => $business->id,
            'title' => 'Event marquee tent',
            'description' => 'Perfect for local weddings and church events.',
            'category' => 'events',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'price_per_day' => 450,
            'deposit_amount' => 800,
            'delivery_available' => true,
            'pickup_available' => true,
            'condition' => 'excellent',
        ])->assertCreated();

        $this->assertDatabaseHas('hire_items', [
            'owner_id' => $owner->id,
            'title' => 'Event marquee tent',
            'category' => 'events',
        ]);
    }

    public function test_customer_can_request_booking_and_overlapping_booking_is_rejected(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $item = $this->approvedItem();

        Sanctum::actingAs($resident);
        $first = $this->postJson("/api/v1/hire/items/{$item->id}/book", [
            'start_at' => now()->addDays(2)->toIso8601String(),
            'end_at' => now()->addDays(4)->toIso8601String(),
            'pickup_method' => 'pickup',
        ])->assertCreated();

        $bookingId = $first->json('data.id');
        HireBooking::query()->whereKey($bookingId)->update(['status' => HireBooking::STATUS_ACCEPTED]);

        $this->postJson("/api/v1/hire/items/{$item->id}/book", [
            'start_at' => now()->addDays(3)->toIso8601String(),
            'end_at' => now()->addDays(5)->toIso8601String(),
            'pickup_method' => 'pickup',
        ])->assertStatus(422);
    }

    public function test_owner_can_accept_reject_and_complete_hire_flow(): void
    {
        $resident = User::query()->where('email', 'resident@lokals.app')->firstOrFail();
        $item = $this->approvedItem();
        $owner = $item->owner;

        Sanctum::actingAs($resident);
        $bookingId = $this->postJson("/api/v1/hire/items/{$item->id}/book", [
            'start_at' => now()->addDays(6)->toIso8601String(),
            'end_at' => now()->addDays(7)->toIso8601String(),
            'pickup_method' => 'pickup',
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($owner);
        $this->postJson("/api/v1/hire/bookings/{$bookingId}/accept")->assertOk()->assertJsonPath('data.status', HireBooking::STATUS_ACCEPTED);
        $this->postJson("/api/v1/hire/bookings/{$bookingId}/confirm")->assertOk()->assertJsonPath('data.status', HireBooking::STATUS_CONFIRMED);
        $this->postJson("/api/v1/hire/bookings/{$bookingId}/handed-over")->assertOk()->assertJsonPath('data.status', HireBooking::STATUS_HANDED_OVER);
        $this->postJson("/api/v1/hire/bookings/{$bookingId}/returned")->assertOk()->assertJsonPath('data.status', HireBooking::STATUS_RETURNED);
        $this->postJson("/api/v1/hire/bookings/{$bookingId}/complete")->assertOk()->assertJsonPath('data.status', HireBooking::STATUS_COMPLETED);
    }

    public function test_unauthorized_user_cannot_manage_another_owners_item(): void
    {
        $item = $this->approvedItem();
        $otherUser = User::query()->where('email', 'resident@lokals.test')->firstOrFail();

        Sanctum::actingAs($otherUser);
        $this->patchJson("/api/v1/hire/items/{$item->id}", [
            'title' => 'Hacked title',
        ])->assertForbidden();
    }

    public function test_admin_can_approve_and_reject_hire_item(): void
    {
        $owner = User::query()->where('email', 'market@lokals.app')->firstOrFail();
        $business = Organization::query()->where('owner_user_id', $owner->id)->firstOrFail();
        $admin = User::query()->where('email', 'admin@lokals.app')->firstOrFail();

        $item = HireItem::query()->create([
            'owner_id' => $owner->id,
            'business_id' => $business->id,
            'title' => 'Portable sound system',
            'description' => 'Good for community events.',
            'category' => 'sound',
            'town' => 'Okahandja',
            'area' => 'CBD',
            'price_per_day' => 350,
            'deposit_amount' => 500,
            'pickup_available' => true,
            'delivery_available' => true,
            'condition' => 'good',
            'status' => HireItem::STATUS_PAUSED,
            'verification_status' => HireItem::VERIFICATION_PENDING,
        ]);

        Sanctum::actingAs($admin);
        $this->postJson("/api/v1/admin/hire/items/{$item->id}/approve")->assertOk()->assertJsonPath('data.verification_status', HireItem::VERIFICATION_APPROVED);
        $this->postJson("/api/v1/admin/hire/items/{$item->id}/reject")->assertOk()->assertJsonPath('data.verification_status', HireItem::VERIFICATION_REJECTED);
    }

    protected function approvedItem(): HireItem
    {
        $owner = User::query()->where('email', 'market@lokals.app')->firstOrFail();
        $business = Organization::query()->where('owner_user_id', $owner->id)->firstOrFail();

        return HireItem::query()->create([
            'owner_id' => $owner->id,
            'business_id' => $business->id,
            'title' => 'Generator 5kVA',
            'description' => 'Reliable backup generator for events and home outages.',
            'category' => 'tools',
            'town' => 'Okahandja',
            'area' => 'Nau-Aib',
            'price_per_day' => 600,
            'deposit_amount' => 1200,
            'pickup_available' => true,
            'delivery_available' => true,
            'condition' => 'good',
            'status' => HireItem::STATUS_ACTIVE,
            'verification_status' => HireItem::VERIFICATION_APPROVED,
        ]);
    }
}
