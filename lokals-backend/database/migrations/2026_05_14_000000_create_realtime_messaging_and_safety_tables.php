<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table): void {
            $table->id();
            $table->string('context')->default('general');
            $table->string('subject')->nullable();
            $table->string('status')->default('active');
            $table->nullableMorphs('conversationable');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('last_message_id')->nullable()->nullOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('conversation_participants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('member');
            $table->string('status')->default('active');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();
            $table->unique(['conversation_id', 'user_id']);
        });

        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('message_type')->default('text');
            $table->longText('body')->nullable();
            $table->string('status')->default('sent');
            $table->boolean('is_system')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('message_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_url')->nullable();
            $table->string('file_type')->default('image');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('thumbnail_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('message_read_receipts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->unique(['message_id', 'user_id']);
        });

        Schema::create('analytics_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_name');
            $table->string('category')->nullable();
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->nullableMorphs('subject');
            $table->json('metadata')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->string('platform')->nullable();
            $table->timestamps();
        });

        Schema::create('user_engagement_metrics', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('metric_key');
            $table->decimal('metric_value', 10, 2)->default(0);
            $table->json('metadata')->nullable();
            $table->timestamp('last_recorded_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'metric_key']);
        });

        Schema::create('town_metric_snapshots', function (Blueprint $table): void {
            $table->id();
            $table->string('town');
            $table->string('area')->nullable();
            $table->date('snapshot_date');
            $table->json('metrics');
            $table->timestamps();
            $table->unique(['town', 'area', 'snapshot_date']);
        });

        Schema::create('moderation_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reporter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->nullableMorphs('reportable');
            $table->string('reason');
            $table->text('details')->nullable();
            $table->string('status')->default('open');
            $table->unsignedInteger('severity_score')->default(0);
            $table->timestamps();
        });

        Schema::create('moderation_actions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('moderation_report_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->nullableMorphs('actionable');
            $table->string('action');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('blocked_users', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('blocked_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'blocked_user_id']);
        });

        Schema::create('abuse_signals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('signalable');
            $table->string('signal_type');
            $table->unsignedInteger('score')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('emergency_broadcasts', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('emergency_type');
            $table->string('priority')->default('high');
            $table->string('town');
            $table->string('area')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('radius_km')->nullable();
            $table->string('status')->default('published');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_broadcasts');
        Schema::dropIfExists('abuse_signals');
        Schema::dropIfExists('blocked_users');
        Schema::dropIfExists('moderation_actions');
        Schema::dropIfExists('moderation_reports');
        Schema::dropIfExists('town_metric_snapshots');
        Schema::dropIfExists('user_engagement_metrics');
        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('message_read_receipts');
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};
