<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'default_town')) {
                $table->string('default_town')->nullable()->after('business_name');
            }

            if (! Schema::hasColumn('users', 'default_area')) {
                $table->string('default_area')->nullable()->after('default_town');
            }

            if (! Schema::hasColumn('users', 'service_radius')) {
                $table->unsignedInteger('service_radius')->default(10)->after('default_area');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $columns = [];

            if (Schema::hasColumn('users', 'service_radius')) {
                $columns[] = 'service_radius';
            }

            if (Schema::hasColumn('users', 'default_area')) {
                $columns[] = 'default_area';
            }

            if (Schema::hasColumn('users', 'default_town')) {
                $columns[] = 'default_town';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
