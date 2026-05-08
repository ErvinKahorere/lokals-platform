<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventTicketType;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_events_list_and_details_load(): void
    {
        $event = Event::query()->where('status', 'published')->firstOrFail();

        $this->getJson('/api/v1/events?town=Windhoek')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'title',
                    'category',
                    'starts_at',
                    'calendar',
                ]],
            ]);

        $this->getJson("/api/v1/events/{$event->id}")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'category',
                    'organizer',
                    'ticket_types',
                    'calendar',
                ],
                'related',
                'calendar',
            ]);
    }

    public function test_organizer_can_create_event(): void
    {
        $user = User::where('email', 'doctor@lokals.test')->firstOrFail();
        $organization = Organization::where('name', 'Wanaheda Corner Shop')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/events', [
            'organizer_type' => 'organization',
            'organizer_id' => $organization->id,
            'title' => 'Owner Hosted Event',
            'description' => 'Community networking evening.',
            'category' => 'business',
            'venue_name' => 'Main Hall',
            'location' => 'Wanaheda',
            'town' => 'Windhoek',
            'area' => 'Wanaheda',
            'starts_at' => now()->addDays(5)->toIso8601String(),
            'ends_at' => now()->addDays(5)->addHours(2)->toIso8601String(),
            'status' => 'published',
            'is_free' => true,
        ])->assertCreated()
            ->assertJsonPath('data.organizer.type', 'organization');
    }

    public function test_free_ticket_can_be_reserved_and_oversell_is_blocked(): void
    {
        $user = User::where('email', 'citizen@lokals.test')->firstOrFail();
        Sanctum::actingAs($user);

        $event = Event::where('title', 'School Open Day')->firstOrFail();
        $ticketType = EventTicketType::where('event_id', $event->id)->where('name', 'Visitor Pass')->firstOrFail();
        $ticketType->update([
            'quantity_available' => 1,
            'quantity_sold' => 0,
            'sales_start_at' => now()->subDay(),
            'sales_end_at' => now()->addDay(),
        ]);

        $this->postJson("/api/v1/events/{$event->id}/tickets/reserve", [
            'ticket_type_id' => $ticketType->id,
            'holder_name' => 'Petrina Kamati',
            'holder_phone' => '+264810000002',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'confirmed');

        $secondUser = User::where('email', 'admin@lokals.test')->firstOrFail();
        Sanctum::actingAs($secondUser);

        $this->postJson("/api/v1/events/{$event->id}/tickets/reserve", [
            'ticket_type_id' => $ticketType->id,
        ])->assertStatus(422);
    }

    public function test_event_can_be_saved_and_calendar_can_be_generated(): void
    {
        $user = User::where('email', 'citizen@lokals.test')->firstOrFail();
        $event = Event::where('title', 'Health Awareness Day')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/events/{$event->id}/save")
            ->assertCreated();

        $this->assertDatabaseHas('event_saves', [
            'user_id' => $user->id,
            'event_id' => $event->id,
        ]);

        $this->get("/api/v1/events/{$event->id}/calendar.ics")
            ->assertOk()
            ->assertHeader('Content-Type', 'text/calendar; charset=UTF-8')
            ->assertSee('BEGIN:VCALENDAR', false)
            ->assertSee('SUMMARY:Health Awareness Day', false);
    }

    public function test_my_tickets_endpoint_returns_ticket_payloads(): void
    {
        $user = User::where('email', 'citizen@lokals.test')->firstOrFail();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/my/tickets')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'ticket_code',
                    'status',
                    'event',
                    'ticket_type',
                ]],
            ]);
    }
}
