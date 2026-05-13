<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_badges', function (Blueprint $table): void {
            $table->id();
            $table->string('key')->unique();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('scope')->default('entity');
            $table->string('icon')->nullable();
            $table->string('tone')->default('neutral');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_trust_metrics', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('trustable');
            $table->unsignedInteger('score')->default(0);
            $table->unsignedInteger('completed_requests')->default(0);
            $table->unsignedInteger('successful_transactions')->default(0);
            $table->unsignedInteger('contribution_count')->default(0);
            $table->unsignedInteger('reports_resolved')->default(0);
            $table->unsignedInteger('volunteer_activity')->default(0);
            $table->unsignedInteger('avg_response_minutes')->nullable();
            $table->json('badges')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();
            $table->unique(['trustable_type', 'trustable_id']);
        });

        Schema::create('verification_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->nullableMorphs('verifiable');
            $table->string('request_type')->default('general');
            $table->enum('status', ['pending', 'approved', 'rejected', 'changes_requested'])->default('pending');
            $table->text('notes')->nullable();
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->json('submitted_data')->nullable();
            $table->timestamps();
        });

        Schema::create('user_engagement_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('event_type');
            $table->string('category')->nullable();
            $table->nullableMorphs('target');
            $table->string('route')->nullable();
            $table->unsignedInteger('count')->default(1);
            $table->decimal('score', 8, 2)->default(1);
            $table->json('metadata')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'event_type', 'target_type', 'target_id', 'route'], 'user_engagement_unique');
        });

        Schema::create('user_interest_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('interest_key');
            $table->string('interest_type')->default('category');
            $table->decimal('weight', 8, 2)->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'interest_key', 'interest_type']);
        });

        Schema::create('recommendation_scores', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->nullableMorphs('recommendable');
            $table->string('category')->nullable();
            $table->decimal('score', 8, 2)->default(0);
            $table->json('signals')->nullable();
            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'recommendable_type', 'recommendable_id'], 'recommendation_score_unique');
        });

        Schema::create('search_suggestions', function (Blueprint $table): void {
            $table->id();
            $table->string('query')->unique();
            $table->string('category')->nullable();
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->unsignedInteger('hits')->default(0);
            $table->unsignedInteger('popularity')->default(0);
            $table->boolean('is_trending')->default(false);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_suggestions');
        Schema::dropIfExists('recommendation_scores');
        Schema::dropIfExists('user_interest_profiles');
        Schema::dropIfExists('user_engagement_events');
        Schema::dropIfExists('verification_requests');
        Schema::dropIfExists('user_trust_metrics');
        Schema::dropIfExists('verification_badges');
    }
};
