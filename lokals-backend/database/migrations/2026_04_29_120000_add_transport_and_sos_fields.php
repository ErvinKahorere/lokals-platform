<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->text('notes')->nullable()->after('parcel_description');
        });

        Schema::table('ride_requests', function (Blueprint $table): void {
            $table->string('ride_type')->nullable()->after('dropoff_location');
            $table->string('trip_purpose')->nullable()->after('ride_type');
            $table->text('notes')->nullable()->after('trip_purpose');
        });

        Schema::table('sos_alerts', function (Blueprint $table): void {
            $table->string('emergency_type')->nullable()->after('message');
            $table->string('town')->nullable()->after('location');
            $table->string('area')->nullable()->after('town');
        });
    }

    public function down(): void
    {
        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->dropColumn('notes');
        });

        Schema::table('ride_requests', function (Blueprint $table): void {
            $table->dropColumn(['ride_type', 'trip_purpose', 'notes']);
        });

        Schema::table('sos_alerts', function (Blueprint $table): void {
            $table->dropColumn(['emergency_type', 'town', 'area']);
        });
    }
};
