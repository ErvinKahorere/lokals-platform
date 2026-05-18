<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ride_requests', function (Blueprint $table): void {
            $table->decimal('pickup_latitude', 10, 7)->nullable()->after('pickup_address');
            $table->decimal('pickup_longitude', 10, 7)->nullable()->after('pickup_latitude');
            $table->decimal('dropoff_latitude', 10, 7)->nullable()->after('dropoff_address');
            $table->decimal('dropoff_longitude', 10, 7)->nullable()->after('dropoff_latitude');
        });

        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->decimal('pickup_latitude', 10, 7)->nullable()->after('pickup_location');
            $table->decimal('pickup_longitude', 10, 7)->nullable()->after('pickup_latitude');
            $table->decimal('dropoff_latitude', 10, 7)->nullable()->after('dropoff_location');
            $table->decimal('dropoff_longitude', 10, 7)->nullable()->after('dropoff_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('ride_requests', function (Blueprint $table): void {
            $table->dropColumn([
                'pickup_latitude',
                'pickup_longitude',
                'dropoff_latitude',
                'dropoff_longitude',
            ]);
        });

        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->dropColumn([
                'pickup_latitude',
                'pickup_longitude',
                'dropoff_latitude',
                'dropoff_longitude',
            ]);
        });
    }
};
