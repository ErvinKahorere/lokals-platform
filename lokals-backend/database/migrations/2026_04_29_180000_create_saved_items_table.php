<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('saveable');
            $table->timestamps();

            $table->unique(['user_id', 'saveable_type', 'saveable_id'], 'saved_items_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_items');
    }
};
