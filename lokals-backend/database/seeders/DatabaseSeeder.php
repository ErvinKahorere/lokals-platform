<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\Support\DemoSeedRegistry;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    private const ROLES = [
        'citizen',
        'worker',
        'seller',
        'business_owner',
        'driver',
        'service_provider',
        'organization_admin',
        'organization_representative',
        'town_manager',
        'municipality_admin',
        'operator',
        'super_admin',
    ];

    public function run(): void
    {
        foreach (self::ROLES as $role) {
            Role::findOrCreate($role, 'sanctum');
        }

        if (! $this->demoSeedingEnabled()) {
            $this->command?->info('Skipping demo seed data. Set LOKALS_DEMO_SEED=true to enable demo seeding outside local/testing.');
            return;
        }

        if ($this->hasProductionUsers()) {
            $this->command?->warn('Skipping demo seed data because non-demo users already exist.');
            return;
        }

        $this->call([
            DemoAdminSeeder::class,
            DemoBusinessSeeder::class,
            DemoServiceProviderSeeder::class,
            DemoTownManagerSeeder::class,
            DemoMarketplaceSeeder::class,
            DemoEventSeeder::class,
            DemoNewsSeeder::class,
        ]);
    }

    private function demoSeedingEnabled(): bool
    {
        $flag = env('LOKALS_DEMO_SEED');

        if ($flag === null) {
            return app()->environment(['local', 'testing']);
        }

        return filter_var($flag, FILTER_VALIDATE_BOOL);
    }

    private function hasProductionUsers(): bool
    {
        return User::query()
            ->whereNotIn('email', DemoSeedRegistry::emails())
            ->exists();
    }
}
