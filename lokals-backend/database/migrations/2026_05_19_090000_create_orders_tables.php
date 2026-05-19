<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('service_fee', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->string('payment_method')->default('cash');
            $table->string('payment_status')->default('pending');
            $table->string('delivery_address');
            $table->decimal('delivery_latitude', 10, 7)->nullable();
            $table->decimal('delivery_longitude', 10, 7)->nullable();
            $table->string('pickup_address')->nullable();
            $table->decimal('pickup_latitude', 10, 7)->nullable();
            $table->decimal('pickup_longitude', 10, 7)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('preparing_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->unsignedTinyInteger('customer_rating')->nullable();
            $table->text('customer_rating_comment')->nullable();
            $table->timestamp('rated_at')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index(['courier_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['town', 'status']);
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
