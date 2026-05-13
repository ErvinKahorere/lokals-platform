<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mode_preferences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('current_mode')->default('citizen');
            $table->json('pinned_modes')->nullable();
            $table->timestamps();
        });

        Schema::create('role_applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('requested_role');
            $table->string('status')->default('draft');
            $table->string('full_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->unsignedBigInteger('town_id')->nullable();
            $table->string('town_name')->nullable();
            $table->string('city_name')->nullable();
            $table->string('address')->nullable();
            $table->string('national_id_number')->nullable();
            $table->string('license_number')->nullable();
            $table->string('vehicle_registration')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('service_category')->nullable();
            $table->string('organisation_name')->nullable();
            $table->string('business_name')->nullable();
            $table->json('documents')->nullable();
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            $table->index(['requested_role', 'status']);
        });

        Schema::create('role_approval_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('role_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('acted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('driver_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('role_application_id')->nullable()->constrained()->nullOnDelete();
            $table->string('license_number')->nullable();
            $table->string('vehicle_registration')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->boolean('is_online')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('completed_trips')->default(0);
            $table->decimal('lifetime_earnings', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('courier_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('role_application_id')->nullable()->constrained()->nullOnDelete();
            $table->string('license_number')->nullable();
            $table->string('vehicle_registration')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->boolean('is_online')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('completed_deliveries')->default(0);
            $table->decimal('lifetime_earnings', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::table('ride_requests', function (Blueprint $table): void {
            $table->string('pickup_address')->nullable()->after('pickup_location');
            $table->string('dropoff_address')->nullable()->after('dropoff_location');
            $table->decimal('estimated_distance_km', 8, 2)->nullable()->after('fare_estimate');
            $table->timestamp('assigned_at')->nullable()->after('status');
            $table->timestamp('arrived_at')->nullable()->after('assigned_at');
            $table->timestamp('started_at')->nullable()->after('arrived_at');
            $table->timestamp('completed_at')->nullable()->after('started_at');
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');
            $table->string('cancel_reason')->nullable()->after('cancelled_at');
            $table->unsignedTinyInteger('rating')->nullable()->after('cancel_reason');
            $table->text('rating_comment')->nullable()->after('rating');
            $table->string('vehicle_label')->nullable()->after('rating_comment');
        });

        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->decimal('weight_kg', 8, 2)->nullable()->after('parcel_size');
            $table->string('urgency')->nullable()->after('weight_kg');
            $table->timestamp('assigned_at')->nullable()->after('status');
            $table->timestamp('picked_up_at')->nullable()->after('assigned_at');
            $table->timestamp('in_transit_at')->nullable()->after('picked_up_at');
            $table->timestamp('delivered_at')->nullable()->after('in_transit_at');
            $table->timestamp('cancelled_at')->nullable()->after('delivered_at');
            $table->string('cancel_reason')->nullable()->after('cancelled_at');
            $table->unsignedTinyInteger('rating')->nullable()->after('cancel_reason');
            $table->text('rating_comment')->nullable()->after('rating');
        });
    }

    public function down(): void
    {
        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->dropColumn([
                'weight_kg',
                'urgency',
                'assigned_at',
                'picked_up_at',
                'in_transit_at',
                'delivered_at',
                'cancelled_at',
                'cancel_reason',
                'rating',
                'rating_comment',
            ]);
        });

        Schema::table('ride_requests', function (Blueprint $table): void {
            $table->dropColumn([
                'pickup_address',
                'dropoff_address',
                'estimated_distance_km',
                'assigned_at',
                'arrived_at',
                'started_at',
                'completed_at',
                'cancelled_at',
                'cancel_reason',
                'rating',
                'rating_comment',
                'vehicle_label',
            ]);
        });

        Schema::dropIfExists('courier_profiles');
        Schema::dropIfExists('driver_profiles');
        Schema::dropIfExists('role_approval_logs');
        Schema::dropIfExists('role_applications');
        Schema::dropIfExists('mode_preferences');
    }
};
