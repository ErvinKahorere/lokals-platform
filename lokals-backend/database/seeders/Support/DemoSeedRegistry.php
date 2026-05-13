<?php

namespace Database\Seeders\Support;

class DemoSeedRegistry
{
    public const PASSWORD = 'Password123!';

    /**
     * @return list<string>
     */
    public static function emails(): array
    {
        return [
            'admin@lokals.app',
            'manager@lokals.app',
            'orgadmin@lokals.app',
            'resident@lokals.app',
            'resident@lokals.test',
            'market@lokals.app',
            'pharmacy@lokals.app',
            'hardware@lokals.app',
            'guesthouse@lokals.app',
            'butchery@lokals.app',
            'plumber@lokals.app',
            'electrician@lokals.app',
            'barber@lokals.app',
            'tailor@lokals.app',
            'cleaner@lokals.app',
            'mechanic@lokals.app',
            'tutor@lokals.app',
            'photographer@lokals.app',
            'taxi@lokals.app',
            'driver@lokals.test',
            'courier@lokals.app',
            'courier@lokals.test',
        ];
    }
}
