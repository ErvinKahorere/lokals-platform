<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hire_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('business_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category', 100)->default('equipment');
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('price_per_hour', 10, 2)->nullable();
            $table->decimal('price_per_day', 10, 2)->nullable();
            $table->decimal('deposit_amount', 10, 2)->nullable();
            $table->decimal('replacement_value', 10, 2)->nullable();
            $table->boolean('delivery_available')->default(false);
            $table->boolean('pickup_available')->default(true);
            $table->string('condition', 60)->default('good');
            $table->string('status', 40)->default('active');
            $table->string('verification_status', 40)->default('pending');
            $table->json('images')->nullable();
            $table->json('rules')->nullable();
            $table->json('included_items')->nullable();
            $table->json('unavailable_dates')->nullable();
            $table->timestamps();
        });

        Schema::create('hire_bookings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('hire_item_id')->constrained('hire_items')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 40)->default('pending');
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('rental_fee', 10, 2)->default(0);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->decimal('delivery_fee', 10, 2)->nullable();
            $table->decimal('total', 10, 2)->default(0);
            $table->string('payment_status', 40)->default('pending');
            $table->string('pickup_method', 40)->default('pickup');
            $table->string('delivery_address')->nullable();
            $table->decimal('delivery_latitude', 10, 7)->nullable();
            $table->decimal('delivery_longitude', 10, 7)->nullable();
            $table->text('notes')->nullable();
            $table->text('owner_notes')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('handed_over_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->unsignedTinyInteger('customer_rating')->nullable();
            $table->text('customer_rating_comment')->nullable();
            $table->timestamp('rated_at')->nullable();
            $table->timestamps();

            $table->index(['hire_item_id', 'status']);
            $table->index(['owner_id', 'status']);
            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hire_bookings');
        Schema::dropIfExists('hire_items');
    }
};
