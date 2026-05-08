<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_sources', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('website_url');
            $table->string('feed_url')->nullable();
            $table->enum('source_type', ['publication', 'company', 'organization', 'municipality', 'media', 'rss', 'website']);
            $table->string('town')->nullable();
            $table->string('region')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_fetched_at')->nullable();
            $table->timestamps();
        });

        Schema::create('news_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('news_source_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('summary');
            $table->string('source_name');
            $table->string('source_url');
            $table->string('external_url')->unique();
            $table->string('image_url')->nullable();
            $table->string('category')->default('community');
            $table->string('town')->nullable();
            $table->string('area')->nullable();
            $table->string('region')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_hidden')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('fetched_at')->nullable();
            $table->enum('source_type', ['publication', 'company', 'organization', 'municipality', 'media', 'rss', 'website']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_items');
        Schema::dropIfExists('news_sources');
    }
};
