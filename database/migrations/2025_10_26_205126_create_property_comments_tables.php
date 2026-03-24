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
        // Create property_comments table
        Schema::create('property_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('property_id');
            $table->unsignedBigInteger('user_id');
            $table->integer('rating'); // 1-5
            $table->text('comment');
            $table->integer('likes')->default(0);
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // One comment per user per property
            $table->unique(['property_id', 'user_id']);
        });

        // Create property_comment_likes table
        Schema::create('property_comment_likes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comment_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('created_at');
            
            // Foreign keys
            $table->foreign('comment_id')->references('id')->on('property_comments')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // One like per user per comment
            $table->unique(['comment_id', 'user_id']);
        });
        
        // Add columns to properties table if they don't exist
        if (!Schema::hasColumn('properties', 'average_rating')) {
            Schema::table('properties', function (Blueprint $table) {
                $table->decimal('average_rating', 3, 2)->default(0)->after('status');
            });
        }
        
        if (!Schema::hasColumn('properties', 'total_comments')) {
            Schema::table('properties', function (Blueprint $table) {
                $table->integer('total_comments')->default(0)->after('average_rating');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_comment_likes');
        Schema::dropIfExists('property_comments');
        
        if (Schema::hasColumn('properties', 'average_rating')) {
            Schema::table('properties', function (Blueprint $table) {
                $table->dropColumn('average_rating');
            });
        }
        
        if (Schema::hasColumn('properties', 'total_comments')) {
            Schema::table('properties', function (Blueprint $table) {
                $table->dropColumn('total_comments');
            });
        }
    }
};