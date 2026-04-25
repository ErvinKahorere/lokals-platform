<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('default_town')->nullable()->after('business_name');
            $table->string('default_area')->nullable()->after('default_town');
            $table->unsignedInteger('service_radius')->default(10)->after('default_area');
        });

        Schema::create('user_preferences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('default_town')->nullable();
            $table->string('default_area')->nullable();
            $table->json('interests')->nullable();
            $table->json('preferred_roles')->nullable();
            $table->json('notification_preferences')->nullable();
            $table->timestamps();
        });

        Schema::table('organizations', function (Blueprint $table): void {
            $table->foreignId('owner_user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->string('subcategory')->nullable()->after('category');
            $table->string('town')->nullable()->after('location');
            $table->string('area')->nullable()->after('town');
            $table->boolean('emergency_contact')->default(false)->after('status');
            $table->boolean('is_public_service')->default(false)->after('emergency_contact');
            $table->json('rates')->nullable()->after('opening_hours');
            $table->json('services_offered')->nullable()->after('rates');
        });

        Schema::table('services', function (Blueprint $table): void {
            $table->foreignId('organization_id')->nullable()->after('service_provider_id')->constrained('organizations')->nullOnDelete();
            $table->string('price_type')->default('fixed')->after('price');
            $table->boolean('is_bookable')->default(true)->after('price_type');
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->string('image_path')->nullable();
            $table->string('category')->nullable();
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->string('stock_status')->default('in_stock');
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('accommodations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('price_period')->default('month');
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->string('location')->nullable();
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('image_path')->nullable();
            $table->string('status')->default('published');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accommodations');
        Schema::dropIfExists('products');

        Schema::table('services', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('organization_id');
            $table->dropColumn(['price_type', 'is_bookable']);
        });

        Schema::table('organizations', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('owner_user_id');
            $table->dropColumn([
                'subcategory',
                'town',
                'area',
                'emergency_contact',
                'is_public_service',
                'rates',
                'services_offered',
            ]);
        });

        Schema::dropIfExists('user_preferences');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['default_town', 'default_area', 'service_radius']);
        });
    }
};
