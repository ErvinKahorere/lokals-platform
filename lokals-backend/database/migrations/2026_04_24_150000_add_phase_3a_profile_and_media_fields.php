<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('avatar')->nullable()->after('status');
            $table->text('bio')->nullable()->after('avatar');
            $table->string('whatsapp')->nullable()->after('bio');
            $table->string('secondary_phone')->nullable()->after('whatsapp');
            $table->string('profession')->nullable()->after('secondary_phone');
            $table->string('business_name')->nullable()->after('profession');
            $table->string('profile_visibility')->default('public')->after('business_name');
        });

        Schema::table('organizations', function (Blueprint $table): void {
            $table->string('logo_url')->nullable()->after('email');
            $table->string('whatsapp')->nullable()->after('logo_url');
            $table->json('opening_hours')->nullable()->after('whatsapp');
        });

        Schema::table('service_providers', function (Blueprint $table): void {
            $table->string('avatar_url')->nullable()->after('phone');
            $table->string('whatsapp')->nullable()->after('avatar_url');
            $table->json('opening_hours')->nullable()->after('whatsapp');
        });
    }

    public function down(): void
    {
        Schema::table('service_providers', function (Blueprint $table): void {
            $table->dropColumn(['avatar_url', 'whatsapp', 'opening_hours']);
        });

        Schema::table('organizations', function (Blueprint $table): void {
            $table->dropColumn(['logo_url', 'whatsapp', 'opening_hours']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'avatar',
                'bio',
                'whatsapp',
                'secondary_phone',
                'profession',
                'business_name',
                'profile_visibility',
            ]);
        });
    }
};
