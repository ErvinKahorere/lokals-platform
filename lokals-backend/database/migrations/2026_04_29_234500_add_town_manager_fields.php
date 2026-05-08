<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('city_reports', function (Blueprint $table): void {
            $table->string('town')->nullable()->after('location');
            $table->string('area')->nullable()->after('town');
            $table->foreignId('assigned_to')->nullable()->after('priority')->constrained('users')->nullOnDelete();
            $table->text('resolution_notes')->nullable()->after('assigned_to');
        });

        Schema::table('alerts', function (Blueprint $table): void {
            $table->string('town')->nullable()->after('location');
            $table->string('area')->nullable()->after('town');
            $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->nullOnDelete();
            $table->boolean('is_public')->default(true)->after('created_by');
            $table->json('channels')->nullable()->after('is_public');
            $table->nullableMorphs('alertable');
        });
    }

    public function down(): void
    {
        Schema::table('alerts', function (Blueprint $table): void {
            $table->dropMorphs('alertable');
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn(['town', 'area', 'is_public', 'channels']);
        });

        Schema::table('city_reports', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('assigned_to');
            $table->dropColumn(['town', 'area', 'resolution_notes']);
        });
    }
};
