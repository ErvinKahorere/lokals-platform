<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feed_sources', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('source_type');
            $table->string('source_key')->unique();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('feed_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('priority')->default(0);
            $table->timestamps();
        });

        Schema::create('feed_posts', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->foreignId('feed_source_id')->nullable()->constrained('feed_sources')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('feed_categories')->nullOnDelete();
            $table->string('media_url')->nullable();
            $table->string('external_url')->nullable();
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'archived'])->default('pending');
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('priority')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['source_type', 'source_id'], 'feed_posts_source_unique');
        });

        Schema::create('feed_interactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('feed_post_id')->constrained('feed_posts')->cascadeOnDelete();
            $table->enum('type', ['saved', 'hidden', 'reported', 'clicked', 'viewed']);
            $table->json('details')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'feed_post_id', 'type'], 'feed_interactions_unique');
        });

        Schema::create('feed_moderation_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('feed_post_id')->constrained('feed_posts')->cascadeOnDelete();
            $table->string('action');
            $table->string('status');
            $table->text('notes')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('user_feed_preferences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('interests')->nullable();
            $table->json('hidden_category_ids')->nullable();
            $table->json('muted_source_ids')->nullable();
            $table->string('preferred_town')->nullable();
            $table->string('preferred_area')->nullable();
            $table->boolean('prioritize_followed_organizations')->default(true);
            $table->timestamps();
        });

        Schema::create('ai_assist_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('module');
            $table->string('provider_key');
            $table->string('status')->default('completed');
            $table->string('original_media_url')->nullable();
            $table->string('original_filename')->nullable();
            $table->json('payload')->nullable();
            $table->enum('safety_status', ['clear', 'flagged', 'blocked'])->default('clear');
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->boolean('needs_user_review')->default(true);
            $table->timestamps();
        });

        Schema::create('ai_assist_suggestions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ai_assist_request_id')->constrained('ai_assist_requests')->cascadeOnDelete();
            $table->string('suggestion_type');
            $table->json('content');
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
        });

        Schema::create('support_conversations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('channel', ['in_app', 'whatsapp', 'sms'])->default('in_app');
            $table->enum('status', ['open', 'pending_human', 'resolved', 'closed'])->default('open');
            $table->string('topic')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('support_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained('support_conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('sender_type', ['user', 'bot', 'agent', 'channel_system']);
            $table->longText('body');
            $table->string('intent_key')->nullable();
            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('support_intents', function (Blueprint $table): void {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('description')->nullable();
            $table->json('training_phrases')->nullable();
            $table->longText('response_template');
            $table->string('suggested_route')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('support_escalations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained('support_conversations')->cascadeOnDelete();
            $table->string('reason');
            $table->enum('status', ['pending', 'assigned', 'resolved', 'cancelled'])->default('pending');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('support_knowledge_base_articles', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->string('summary')->nullable();
            $table->longText('body');
            $table->string('route_hint')->nullable();
            $table->boolean('is_published')->default(true);
            $table->string('town')->nullable();
            $table->json('tags')->nullable();
            $table->unsignedInteger('priority')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_knowledge_base_articles');
        Schema::dropIfExists('support_escalations');
        Schema::dropIfExists('support_intents');
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_conversations');
        Schema::dropIfExists('ai_assist_suggestions');
        Schema::dropIfExists('ai_assist_requests');
        Schema::dropIfExists('user_feed_preferences');
        Schema::dropIfExists('feed_moderation_logs');
        Schema::dropIfExists('feed_interactions');
        Schema::dropIfExists('feed_posts');
        Schema::dropIfExists('feed_categories');
        Schema::dropIfExists('feed_sources');
    }
};
