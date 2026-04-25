<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->string('pickup_location')->nullable()->after('user_id');
            $table->string('dropoff_location')->nullable()->after('pickup_location');
            $table->text('parcel_description')->nullable()->after('dropoff_location');
            $table->string('parcel_size')->nullable()->after('parcel_description');
            $table->decimal('estimated_price', 10, 2)->nullable()->after('parcel_size');
            $table->foreignId('driver_id')->nullable()->after('estimated_price')->constrained('users')->nullOnDelete();
            $table->string('photo_url')->nullable()->after('driver_id');
        });

        Schema::table('city_reports', function (Blueprint $table): void {
            $table->string('photo_url')->nullable()->after('priority');
        });

        Schema::create('events', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('community');
            $table->string('location')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('post_drafts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('marketplace');
            $table->string('image_url')->nullable();
            $table->string('suggested_title')->nullable();
            $table->string('suggested_category')->nullable();
            $table->text('suggested_description')->nullable();
            $table->decimal('suggested_price', 10, 2)->nullable();
            $table->string('location')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_drafts');
        Schema::dropIfExists('events');

        Schema::table('city_reports', function (Blueprint $table): void {
            $table->dropColumn('photo_url');
        });

        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('driver_id');
            $table->dropColumn([
                'pickup_location',
                'dropoff_location',
                'parcel_description',
                'parcel_size',
                'estimated_price',
                'photo_url',
            ]);
        });
    }
};
