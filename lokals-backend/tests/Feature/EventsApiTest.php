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

        $this->getJson('/api/v1/events?town=Okahandja')
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
        $user = User::where('email', 'market@lokals.app')->firstOrFail();
        $organization = Organization::where('name', 'Okahandja Fresh Market')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/events', [
            'organizer_type' => 'organization',
            'organizer_id' => $organization->id,
            'title' => 'Owner Hosted Event',
            'description' => 'Community networking evening.',
            'category' => 'business',
            'venue_name' => 'Main Hall',
            'location' => 'Town Centre, Okahandja',
            'town' => 'Okahandja',
            'area' => 'Town Centre',
            'starts_at' => now()->addDays(5)->toIso8601String(),
            'ends_at' => now()->addDays(5)->addHours(2)->toIso8601String(),
            'status' => 'published',
            'is_free' => true,
        ])->assertCreated()
            ->assertJsonPath('data.organizer.type', 'organization');
    }

    public function test_free_ticket_can_be_reserved_and_oversell_is_blocked(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        Sanctum::actingAs($user);

        $event = Event::where('title', 'Town Hall Service Delivery Briefing')->firstOrFail();
        $ticketType = EventTicketType::query()->create([
            'event_id' => $event->id,
            'name' => 'Visitor Pass',
            'description' => 'Single attendee pass.',
            'price' => 0,
            'quantity_available' => 1,
            'quantity_sold' => 0,
            'sales_start_at' => now()->subDay(),
            'sales_end_at' => now()->addDay(),
            'is_active' => true,
        ]);

        $this->postJson("/api/v1/events/{$event->id}/tickets/reserve", [
            'ticket_type_id' => $ticketType->id,
            'holder_name' => 'Petrina Kamati',
            'holder_phone' => '+264810001050',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'confirmed');

        $secondUser = User::where('email', 'admin@lokals.app')->firstOrFail();
        Sanctum::actingAs($secondUser);

        $this->postJson("/api/v1/events/{$event->id}/tickets/reserve", [
            'ticket_type_id' => $ticketType->id,
        ])->assertStatus(422);
    }

    public function test_event_can_be_saved_and_calendar_can_be_generated(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        $event = Event::where('title', 'Town Hall Service Delivery Briefing')->firstOrFail();
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
            ->assertSee('SUMMARY:Town Hall Service Delivery Briefing', false);
    }

    public function test_my_tickets_endpoint_returns_ticket_payloads(): void
    {
        $user = User::where('email', 'resident@lokals.app')->firstOrFail();
        $event = Event::where('title', 'Town Hall Service Delivery Briefing')->firstOrFail();
        $ticketType = EventTicketType::query()->create([
            'event_id' => $event->id,
            'name' => 'Citizen Pass',
            'description' => 'Ticket for dashboard verification.',
            'price' => 0,
            'quantity_available' => 3,
            'quantity_sold' => 0,
            'sales_start_at' => now()->subDay(),
            'sales_end_at' => now()->addDay(),
            'is_active' => true,
        ]);
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/events/{$event->id}/tickets/reserve", [
            'ticket_type_id' => $ticketType->id,
            'holder_name' => 'Meriam Kambatuku',
            'holder_phone' => '+264810001050',
        ])->assertCreated();

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
