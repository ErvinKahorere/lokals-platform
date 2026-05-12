<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_impact_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedInteger('available_points')->default(0);
            $table->unsignedInteger('lifetime_points')->default(0);
            $table->unsignedInteger('redeemed_points')->default(0);
            $table->string('current_level')->default('Neighbor');
            $table->boolean('public_leaderboard_opt_in')->default(false);
            $table->string('public_display_name')->nullable();
            $table->string('privacy_mode')->default('private');
            $table->timestamp('last_awarded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('community_impact_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->unsignedInteger('points');
            $table->string('type');
            $table->string('reason');
            $table->string('category');
            $table->string('verification_status')->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('internal_notes')->nullable();
            $table->string('public_summary')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'verification_status']);
            $table->index(['source_type', 'source_id']);
        });

        Schema::create('community_impact_rewards', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('reward_type');
            $table->unsignedInteger('points_required');
            $table->unsignedInteger('quantity_available')->nullable();
            $table->string('sponsor_name')->nullable();
            $table->string('sponsor_logo')->nullable();
            $table->text('terms')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('community_impact_redemptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reward_id')->constrained('community_impact_rewards')->cascadeOnDelete();
            $table->unsignedInteger('points_spent');
            $table->string('status')->default('requested');
            $table->text('fulfillment_notes')->nullable();
            $table->foreignId('fulfilled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('community_impact_badges', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('category')->nullable();
            $table->unsignedInteger('points_threshold')->nullable();
            $table->string('rule_key')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('community_impact_leaderboard_snapshots', function (Blueprint $table): void {
            $table->id();
            $table->string('period_key');
            $table->timestamp('captured_at');
            $table->json('rows');
            $table->timestamps();

            $table->index(['period_key', 'captured_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_impact_leaderboard_snapshots');
        Schema::dropIfExists('community_impact_badges');
        Schema::dropIfExists('community_impact_redemptions');
        Schema::dropIfExists('community_impact_rewards');
        Schema::dropIfExists('community_impact_transactions');
        Schema::dropIfExists('community_impact_accounts');
    }
};
