<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_project_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('community_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->constrained('community_project_categories');
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('reference_code')->unique();
            $table->string('summary', 280);
            $table->longText('description');
            $table->json('support_needed')->nullable();
            $table->decimal('target_amount', 12, 2)->nullable();
            $table->json('target_items')->nullable();
            $table->unsignedInteger('target_volunteers')->nullable();
            $table->decimal('current_amount', 12, 2)->default(0);
            $table->json('current_items')->nullable();
            $table->unsignedInteger('current_volunteers')->default(0);
            $table->string('location_text');
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('contact_name');
            $table->string('contact_phone')->nullable();
            $table->string('contact_whatsapp')->nullable();
            $table->string('contact_email')->nullable();
            $table->enum('status', ['draft', 'submitted', 'active', 'in_progress', 'needs_support', 'fully_funded', 'completed', 'archived'])->default('draft');
            $table->enum('verification_status', ['pending', 'approved', 'rejected', 'changes_requested'])->default('pending');
            $table->text('verification_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['verification_status', 'status']);
            $table->index(['town', 'area']);
        });

        Schema::create('community_project_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('file_path');
            $table->string('file_url')->nullable();
            $table->string('mime_type')->nullable();
            $table->enum('file_type', ['image', 'video', 'audio', 'document'])->default('image');
            $table->string('original_name')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->string('caption')->nullable();
            $table->timestamps();
        });

        Schema::create('community_project_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('status_after_update')->nullable();
            $table->unsignedTinyInteger('progress_percent')->nullable();
            $table->json('attachments')->nullable();
            $table->boolean('approved_by_town_manager')->default(true);
            $table->timestamps();
        });

        Schema::create('community_project_pledges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('pledge_type', ['money', 'item', 'volunteer', 'service', 'other']);
            $table->text('pledge_description');
            $table->decimal('amount', 12, 2)->nullable();
            $table->unsignedInteger('quantity')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->enum('status', ['pledged', 'contacted', 'accepted', 'fulfilled', 'cancelled'])->default('pledged');
            $table->timestamps();
        });

        Schema::create('community_project_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewed_by')->constrained('users')->cascadeOnDelete();
            $table->enum('action', ['submitted', 'approved', 'rejected', 'changes_requested', 'featured', 'archived', 'status_updated', 'verified']);
            $table->text('notes')->nullable();
            $table->string('status_after')->nullable();
            $table->string('verification_status_after')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_project_verifications');
        Schema::dropIfExists('community_project_pledges');
        Schema::dropIfExists('community_project_updates');
        Schema::dropIfExists('community_project_attachments');
        Schema::dropIfExists('community_projects');
        Schema::dropIfExists('community_project_categories');
    }
};
