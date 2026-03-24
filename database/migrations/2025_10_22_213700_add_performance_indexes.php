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
        // Add indexes to properties table for faster queries
        Schema::table('properties', function (Blueprint $table) {
            $table->index('status');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('governorate_id');
            $table->index('city_id');
            $table->index('category');
            $table->index('rent_or_buy');
            $table->index('user_id');
            $table->index('created_at');
            $table->index(['status', 'is_active']);
            $table->index(['governorate_id', 'city_id']);
        });

        // Add indexes to users table
        Schema::table('users', function (Blueprint $table) {
            $table->index('is_admin');
            $table->index('is_seller');
            $table->index('is_founder');
            $table->index('banned');
            $table->index('username');
            $table->index('created_at');
        });

        // Add indexes to chats table
        Schema::table('chats', function (Blueprint $table) {
            $table->index('sender_id');
            $table->index('receiver_id');
            $table->index('is_read');
            $table->index('created_at');
            $table->index(['sender_id', 'receiver_id']);
        });

        // Add indexes to governorates table
        Schema::table('governorates', function (Blueprint $table) {
            $table->index('is_active');
        });

        // Add indexes to cities table
        Schema::table('cities', function (Blueprint $table) {
            $table->index('governorate_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove indexes from properties table
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['governorate_id']);
            $table->dropIndex(['city_id']);
            $table->dropIndex(['category']);
            $table->dropIndex(['rent_or_buy']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status', 'is_active']);
            $table->dropIndex(['governorate_id', 'city_id']);
        });

        // Remove indexes from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_admin']);
            $table->dropIndex(['is_seller']);
            $table->dropIndex(['is_founder']);
            $table->dropIndex(['banned']);
            $table->dropIndex(['username']);
            $table->dropIndex(['created_at']);
        });

        // Remove indexes from chats table
        Schema::table('chats', function (Blueprint $table) {
            $table->dropIndex(['sender_id']);
            $table->dropIndex(['receiver_id']);
            $table->dropIndex(['is_read']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['sender_id', 'receiver_id']);
        });

        // Remove indexes from governorates table
        Schema::table('governorates', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        // Remove indexes from cities table
        Schema::table('cities', function (Blueprint $table) {
            $table->dropIndex(['governorate_id']);
            $table->dropIndex(['is_active']);
        });
    }
};
