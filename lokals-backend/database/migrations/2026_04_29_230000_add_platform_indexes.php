<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->createIndexIfPossible('products', ['user_id', 'created_at'], 'products_user_created_idx');
        $this->createIndexIfPossible('products', ['town', 'area'], 'products_town_area_idx');
        $this->createIndexIfPossible('products', ['category', 'status'], 'products_category_status_idx');

        $this->createIndexIfPossible('accommodations', ['user_id', 'created_at'], 'accommodations_user_created_idx');
        $this->createIndexIfPossible('accommodations', ['town', 'area'], 'accommodations_town_area_idx');
        $this->createIndexIfPossible('accommodations', ['type', 'status'], 'accommodations_type_status_idx');

        $this->createIndexIfPossible('organizations', ['owner_user_id', 'created_at'], 'organizations_owner_created_idx');
        $this->createIndexIfPossible('organizations', ['town', 'area'], 'organizations_town_area_idx');
        $this->createIndexIfPossible('organizations', ['category', 'status'], 'organizations_category_status_idx');

        $this->createIndexIfPossible('service_providers', ['user_id', 'created_at'], 'service_providers_user_created_idx');
        $this->createIndexIfPossible('service_providers', ['town', 'area'], 'service_providers_town_area_idx');
        $this->createIndexIfPossible('service_providers', ['category', 'status'], 'service_providers_category_status_idx');

        $this->createIndexIfPossible('job_posts', ['user_id', 'created_at'], 'job_posts_user_created_idx');
        $this->createIndexIfPossible('job_posts', ['status', 'created_at'], 'job_posts_status_created_idx');

        $this->createIndexIfPossible('events', ['created_by', 'starts_at'], 'events_creator_starts_idx');
        $this->createIndexIfPossible('events', ['town', 'area'], 'events_town_area_idx');
        $this->createIndexIfPossible('events', ['category', 'status'], 'events_category_status_idx');

        $this->createIndexIfPossible('news_items', ['town', 'area'], 'news_items_town_area_idx');
        $this->createIndexIfPossible('news_items', ['category', 'published_at'], 'news_items_category_published_idx');

        $this->createIndexIfPossible('announcements', ['organization_id', 'published_at'], 'announcements_org_published_idx');
        $this->createIndexIfPossible('announcements', ['status', 'published_at'], 'announcements_status_published_idx');

        $this->createIndexIfPossible('listings', ['user_id', 'created_at'], 'listings_user_created_idx');
        $this->createIndexIfPossible('listings', ['type', 'status'], 'listings_type_status_idx');

        $this->createIndexIfPossible('delivery_requests', ['user_id', 'created_at'], 'deliveries_user_created_idx');
        $this->createIndexIfPossible('delivery_requests', ['status', 'created_at'], 'deliveries_status_created_idx');

        $this->createIndexIfPossible('ride_requests', ['user_id', 'created_at'], 'rides_user_created_idx');
        $this->createIndexIfPossible('ride_requests', ['status', 'created_at'], 'rides_status_created_idx');
    }

    public function down(): void
    {
        $this->dropIndexIfExists('products', 'products_user_created_idx');
        $this->dropIndexIfExists('products', 'products_town_area_idx');
        $this->dropIndexIfExists('products', 'products_category_status_idx');

        $this->dropIndexIfExists('accommodations', 'accommodations_user_created_idx');
        $this->dropIndexIfExists('accommodations', 'accommodations_town_area_idx');
        $this->dropIndexIfExists('accommodations', 'accommodations_type_status_idx');

        $this->dropIndexIfExists('organizations', 'organizations_owner_created_idx');
        $this->dropIndexIfExists('organizations', 'organizations_town_area_idx');
        $this->dropIndexIfExists('organizations', 'organizations_category_status_idx');

        $this->dropIndexIfExists('service_providers', 'service_providers_user_created_idx');
        $this->dropIndexIfExists('service_providers', 'service_providers_town_area_idx');
        $this->dropIndexIfExists('service_providers', 'service_providers_category_status_idx');

        $this->dropIndexIfExists('job_posts', 'job_posts_user_created_idx');
        $this->dropIndexIfExists('job_posts', 'job_posts_status_created_idx');

        $this->dropIndexIfExists('events', 'events_creator_starts_idx');
        $this->dropIndexIfExists('events', 'events_town_area_idx');
        $this->dropIndexIfExists('events', 'events_category_status_idx');

        $this->dropIndexIfExists('news_items', 'news_items_town_area_idx');
        $this->dropIndexIfExists('news_items', 'news_items_category_published_idx');

        $this->dropIndexIfExists('announcements', 'announcements_org_published_idx');
        $this->dropIndexIfExists('announcements', 'announcements_status_published_idx');

        $this->dropIndexIfExists('listings', 'listings_user_created_idx');
        $this->dropIndexIfExists('listings', 'listings_type_status_idx');

        $this->dropIndexIfExists('delivery_requests', 'deliveries_user_created_idx');
        $this->dropIndexIfExists('delivery_requests', 'deliveries_status_created_idx');

        $this->dropIndexIfExists('ride_requests', 'rides_user_created_idx');
        $this->dropIndexIfExists('ride_requests', 'rides_status_created_idx');
    }

    private function createIndexIfPossible(string $table, array $columns, string $index): void
    {
        foreach ($columns as $column) {
            if (! Schema::hasColumn($table, $column)) {
                return;
            }
        }

        if ($this->indexExists($table, $index)) {
            return;
        }

        $wrappedColumns = implode(', ', array_map(
            static fn (string $column): string => sprintf('"%s"', $column),
            $columns
        ));

        DB::statement(sprintf(
            'create index "%s" on "%s" (%s)',
            $index,
            $table,
            $wrappedColumns
        ));
    }

    private function dropIndexIfExists(string $table, string $index): void
    {
        if (! $this->indexExists($table, $index)) {
            return;
        }

        DB::statement(sprintf(
            'drop index "%s"',
            $index
        ));
    }

    private function indexExists(string $table, string $index): bool
    {
        $driver = DB::getDriverName();

        return match ($driver) {
            'pgsql' => DB::table('pg_indexes')
                ->where('schemaname', DB::raw('current_schema()'))
                ->where('tablename', $table)
                ->where('indexname', $index)
                ->exists(),
            'mysql', 'mariadb' => DB::table('information_schema.statistics')
                ->where('table_schema', DB::raw('database()'))
                ->where('table_name', $table)
                ->where('index_name', $index)
                ->exists(),
            'sqlite' => collect(DB::select(sprintf('pragma index_list("%s")', $table)))
                ->contains(static fn (object $row): bool => ($row->name ?? null) === $index),
            default => false,
        };
    }
};
