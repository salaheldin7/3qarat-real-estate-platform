<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('property_id')->nullable()->constrained('properties')->onDelete('cascade');
            
            $table->text('message');
            $table->enum('message_type', ['text', 'image', 'document'])->default('text');
            $table->string('attachment_path')->nullable();
            
            // Message status
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->boolean('deleted_by_sender')->default(false);
            $table->boolean('deleted_by_receiver')->default(false);
            
            // Admin features
            $table->boolean('is_admin_message')->default(false);
            $table->boolean('is_system_message')->default(false);
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['sender_id', 'receiver_id', 'created_at']);
            $table->index(['property_id', 'created_at']);
            $table->index(['is_read', 'receiver_id']);
            $table->index(['deleted_by_sender', 'deleted_by_receiver']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
