<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Console\Command;

class NotificationSmokeCommand extends Command
{
    protected $signature = 'lokals:notification-smoke {email? : Demo user email to receive the smoke notification}';

    protected $description = 'Send a safe non-production notification smoke test to a demo user.';

    public function handle(): int
    {
        if (app()->environment('production')) {
            $this->error('Notification smoke testing is disabled in production.');

            return self::FAILURE;
        }

        $email = (string) ($this->argument('email') ?: config('app.smoke_notification_email', 'resident@lokals.app'));

        $user = User::query()
            ->whereIn('email', array_values(array_unique([
                $email,
                'resident@lokals.app',
                'resident@lokals.test',
            ])))
            ->first();

        if (! $user instanceof User) {
            $this->error('No smoke-test recipient could be found.');

            return self::FAILURE;
        }

        $user->notify(new SystemNotification(
            'Notification smoke test',
            'This is a safe non-production notification smoke event for deployment verification.',
            [
                'type' => 'notification_smoke_test',
                'target' => [
                    'type' => 'diagnostic',
                    'id' => 'notification-smoke',
                    'href' => '/dashboard/resident',
                    'title' => 'Notification smoke test',
                ],
                'town' => $user->default_town,
            ],
        ));

        $this->info('Notification smoke test sent to '.$user->email.'.');

        return self::SUCCESS;
    }
}
