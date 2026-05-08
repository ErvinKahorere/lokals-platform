<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table): void {
            $table->string('organizer_type')->nullable()->after('id');
            $table->unsignedBigInteger('organizer_id')->nullable()->after('organizer_type');
            $table->foreignId('created_by')->nullable()->after('organizer_id')->constrained('users')->nullOnDelete();
            $table->string('venue_name')->nullable()->after('category');
            $table->string('town')->nullable()->after('location');
            $table->string('area')->nullable()->after('town');
            $table->decimal('lat', 10, 7)->nullable()->after('area');
            $table->decimal('lng', 10, 7)->nullable()->after('lat');
            $table->string('image_url')->nullable()->after('ends_at');
            $table->string('status')->default('draft')->after('image_url');
            $table->boolean('is_free')->default(true)->after('status');
            $table->boolean('ticketing_enabled')->default(false)->after('is_free');
            $table->unsignedInteger('capacity')->nullable()->after('ticketing_enabled');
            $table->json('metadata')->nullable()->after('capacity');
        });

        Schema::create('event_ticket_types', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->unsignedInteger('quantity_available')->nullable();
            $table->unsignedInteger('quantity_sold')->default(0);
            $table->timestamp('sales_start_at')->nullable();
            $table->timestamp('sales_end_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('event_tickets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ticket_type_id')->nullable()->constrained('event_ticket_types')->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('ticket_code')->unique();
            $table->string('status')->default('reserved');
            $table->decimal('price_paid', 10, 2)->nullable();
            $table->string('holder_name')->nullable();
            $table->string('holder_phone')->nullable();
            $table->text('qr_code_payload')->nullable();
            $table->timestamp('reserved_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });

        Schema::create('event_saves', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'event_id']);
        });

        Schema::create('event_reminders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->timestamp('remind_at');
            $table->timestamp('sent_at')->nullable();
            $table->string('channel')->default('in_app');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_reminders');
        Schema::dropIfExists('event_saves');
        Schema::dropIfExists('event_tickets');
        Schema::dropIfExists('event_ticket_types');

        Schema::table('events', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn([
                'organizer_type',
                'organizer_id',
                'venue_name',
                'town',
                'area',
                'lat',
                'lng',
                'image_url',
                'status',
                'is_free',
                'ticketing_enabled',
                'capacity',
                'metadata',
            ]);
        });
    }
};
