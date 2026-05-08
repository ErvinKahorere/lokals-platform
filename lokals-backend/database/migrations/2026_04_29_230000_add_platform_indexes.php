<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->index(['user_id', 'created_at'], 'products_user_created_idx');
            $table->index(['town', 'area'], 'products_town_area_idx');
            $table->index(['category', 'status'], 'products_category_status_idx');
        });

        Schema::table('accommodations', function (Blueprint $table): void {
            $table->index(['user_id', 'created_at'], 'accommodations_user_created_idx');
            $table->index(['town', 'area'], 'accommodations_town_area_idx');
            $table->index(['type', 'status'], 'accommodations_type_status_idx');
        });

        Schema::table('organizations', function (Blueprint $table): void {
            $table->index(['owner_user_id', 'created_at'], 'organizations_owner_created_idx');
            $table->index(['town', 'area'], 'organizations_town_area_idx');
            $table->index(['category', 'status'], 'organizations_category_status_idx');
        });

        Schema::table('service_providers', function (Blueprint $table): void {
            $table->index(['user_id', 'created_at'], 'service_providers_user_created_idx');
            $table->index(['town', 'area'], 'service_providers_town_area_idx');
            $table->index(['category', 'status'], 'service_providers_category_status_idx');
        });

        Schema::table('job_posts', function (Blueprint $table): void {
            $table->index(['user_id', 'created_at'], 'job_posts_user_created_idx');
            $table->index(['status', 'created_at'], 'job_posts_status_created_idx');
        });

        Schema::table('events', function (Blueprint $table): void {
            $table->index(['created_by', 'starts_at'], 'events_creator_starts_idx');
            $table->index(['town', 'area'], 'events_town_area_idx');
            $table->index(['category', 'status'], 'events_category_status_idx');
        });

        Schema::table('news_items', function (Blueprint $table): void {
            $table->index(['town', 'area'], 'news_items_town_area_idx');
            $table->index(['category', 'published_at'], 'news_items_category_published_idx');
        });

        Schema::table('announcements', function (Blueprint $table): void {
            $table->index(['organization_id', 'published_at'], 'announcements_org_published_idx');
            $table->index(['status', 'published_at'], 'announcements_status_published_idx');
        });

        Schema::table('listings', function (Blueprint $table): void {
            $table->index(['user_id', 'created_at'], 'listings_user_created_idx');
            $table->index(['type', 'status'], 'listings_type_status_idx');
        });

        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->index(['user_id', 'created_at'], 'deliveries_user_created_idx');
            $table->index(['status', 'created_at'], 'deliveries_status_created_idx');
        });

        Schema::table('ride_requests', function (Blueprint $table): void {
            $table->index(['user_id', 'created_at'], 'rides_user_created_idx');
            $table->index(['status', 'created_at'], 'rides_status_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropIndex('products_user_created_idx');
            $table->dropIndex('products_town_area_idx');
            $table->dropIndex('products_category_status_idx');
        });

        Schema::table('accommodations', function (Blueprint $table): void {
            $table->dropIndex('accommodations_user_created_idx');
            $table->dropIndex('accommodations_town_area_idx');
            $table->dropIndex('accommodations_type_status_idx');
        });

        Schema::table('organizations', function (Blueprint $table): void {
            $table->dropIndex('organizations_owner_created_idx');
            $table->dropIndex('organizations_town_area_idx');
            $table->dropIndex('organizations_category_status_idx');
        });

        Schema::table('service_providers', function (Blueprint $table): void {
            $table->dropIndex('service_providers_user_created_idx');
            $table->dropIndex('service_providers_town_area_idx');
            $table->dropIndex('service_providers_category_status_idx');
        });

        Schema::table('job_posts', function (Blueprint $table): void {
            $table->dropIndex('job_posts_user_created_idx');
            $table->dropIndex('job_posts_status_created_idx');
        });

        Schema::table('events', function (Blueprint $table): void {
            $table->dropIndex('events_creator_starts_idx');
            $table->dropIndex('events_town_area_idx');
            $table->dropIndex('events_category_status_idx');
        });

        Schema::table('news_items', function (Blueprint $table): void {
            $table->dropIndex('news_items_town_area_idx');
            $table->dropIndex('news_items_category_published_idx');
        });

        Schema::table('announcements', function (Blueprint $table): void {
            $table->dropIndex('announcements_org_published_idx');
            $table->dropIndex('announcements_status_published_idx');
        });

        Schema::table('listings', function (Blueprint $table): void {
            $table->dropIndex('listings_user_created_idx');
            $table->dropIndex('listings_type_status_idx');
        });

        Schema::table('delivery_requests', function (Blueprint $table): void {
            $table->dropIndex('deliveries_user_created_idx');
            $table->dropIndex('deliveries_status_created_idx');
        });

        Schema::table('ride_requests', function (Blueprint $table): void {
            $table->dropIndex('rides_user_created_idx');
            $table->dropIndex('rides_status_created_idx');
        });
    }
};
