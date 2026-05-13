<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('city_reports', function (Blueprint $table): void {
            $table->string('reference_code')->nullable()->after('id');
            $table->string('department_name')->nullable()->after('assigned_to');
            $table->text('internal_notes')->nullable()->after('resolution_notes');
        });

        Schema::create('city_report_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('city_report_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('file_path');
            $table->string('file_url');
            $table->string('mime_type')->nullable();
            $table->string('file_type', 24);
            $table->string('original_name')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();
        });

        Schema::create('city_report_updates', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('city_report_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('note');
            $table->string('visibility')->default('resident');
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->text('message');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        DB::table('city_reports')
            ->select('id')
            ->orderBy('id')
            ->chunkById(100, function ($reports): void {
                foreach ($reports as $report) {
                    DB::table('city_reports')
                        ->where('id', $report->id)
                        ->update([
                            'reference_code' => sprintf('REP-%06d', $report->id),
                        ]);
                }
            });

        Schema::table('city_reports', function (Blueprint $table): void {
            $table->unique('reference_code');
        });
    }

    public function down(): void
    {
        Schema::table('city_reports', function (Blueprint $table): void {
            $table->dropUnique(['reference_code']);
        });

        Schema::dropIfExists('city_report_updates');
        Schema::dropIfExists('city_report_attachments');

        Schema::table('city_reports', function (Blueprint $table): void {
            $table->dropColumn(['reference_code', 'department_name', 'internal_notes']);
        });
    }
};
