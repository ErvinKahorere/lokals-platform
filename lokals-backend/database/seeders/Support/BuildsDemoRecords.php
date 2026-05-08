<?php

namespace Database\Seeders\Support;

use App\Models\AvailabilitySlot;
use App\Models\Organization;
use App\Models\Profile;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Support\Facades\Hash;

trait BuildsDemoRecords
{
    protected function upsertUser(
        string $email,
        array $attributes,
        array $roles,
        array $profile = [],
        array $preferences = [],
    ): User {
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'email' => $email,
                'password' => Hash::make(DemoSeedRegistry::PASSWORD),
                ...$attributes,
            ],
        );

        $user->syncRoles($roles);

        Profile::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => $profile['bio'] ?? 'LOKALS demo profile',
                'preferred_language' => $profile['preferred_language'] ?? 'English',
                'location' => $profile['location'] ?? $user->location,
                'lat' => $profile['lat'] ?? $user->lat,
                'lng' => $profile['lng'] ?? $user->lng,
                'completed_fields' => $profile['completed_fields'] ?? ['name', 'phone', 'location'],
                ...$profile,
            ],
        );

        UserPreference::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'default_town' => $preferences['default_town'] ?? $user->default_town,
                'default_area' => $preferences['default_area'] ?? $user->default_area,
                'interests' => $preferences['interests'] ?? ['Local services', 'City updates'],
                'preferred_roles' => $preferences['preferred_roles'] ?? $roles,
                'notification_preferences' => $preferences['notification_preferences'] ?? [
                    'alerts_from_followed_entities' => true,
                    'booking_updates' => true,
                    'job_updates' => true,
                    'sale_alerts' => true,
                    'city_alerts' => true,
                ],
                ...$preferences,
            ],
        );

        return $user;
    }

    protected function upsertOrganization(string $name, array $attributes): Organization
    {
        return Organization::query()->updateOrCreate(
            ['name' => $name],
            ['name' => $name, ...$attributes],
        );
    }

    protected function upsertServiceProvider(
        User $user,
        array $attributes,
        array $services = [],
        array $availabilitySlots = [],
    ): ServiceProvider {
        $provider = ServiceProvider::query()->updateOrCreate(
            ['user_id' => $user->id],
            ['user_id' => $user->id, ...$attributes],
        );

        foreach ($services as $service) {
            Service::query()->updateOrCreate(
                [
                    'service_provider_id' => $provider->id,
                    'name' => $service['name'],
                ],
                [
                    'service_provider_id' => $provider->id,
                    'organization_id' => $provider->organization_id,
                    'description' => $service['description'],
                    'duration_minutes' => $service['duration_minutes'] ?? 60,
                    'price' => $service['price'],
                    'price_type' => $service['price_type'] ?? 'fixed',
                    'is_bookable' => $service['is_bookable'] ?? true,
                    'is_active' => $service['is_active'] ?? true,
                ],
            );
        }

        foreach ($availabilitySlots as $slot) {
            AvailabilitySlot::query()->updateOrCreate(
                [
                    'service_provider_id' => $provider->id,
                    'day_of_week' => $slot['day_of_week'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                ],
                [
                    'service_provider_id' => $provider->id,
                    'is_available' => $slot['is_available'] ?? true,
                ],
            );
        }

        return $provider;
    }
}
