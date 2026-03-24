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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('governorate_id')->constrained('governorates');
            $table->foreignId('city_id')->constrained('cities');
            
            // Basic property information
            $table->string('title');
            $table->text('description');
            $table->decimal('price', 15, 2);
            $table->enum('rent_or_buy', ['rent', 'buy']);
            $table->enum('category', ['villa', 'apartment', 'townhouse', 'land', 'building', 'commercial']);
            
            // Property details
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->decimal('area', 10, 2)->nullable(); // in square meters
            $table->integer('floor_number')->nullable();
            $table->integer('total_floors')->nullable();
            $table->year('built_year')->nullable();
            $table->boolean('furnished')->default(false);
            $table->boolean('has_parking')->default(false);
            $table->boolean('has_garden')->default(false);
            $table->boolean('has_pool')->default(false);
            $table->boolean('has_elevator')->default(false);
            
            // Location details
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Status and approval
            $table->enum('status', ['pending', 'approved', 'rejected', 'sold', 'rented'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            
            // Images and media
            $table->json('images')->nullable(); // Array of image paths
            $table->string('video_url')->nullable();
            $table->json('documents')->nullable(); // Array of document paths
            
            // SEO and metadata
            $table->string('slug')->unique()->nullable();
            $table->json('features')->nullable(); // Additional features as JSON
            $table->integer('views_count')->default(0);
            $table->integer('inquiries_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('featured_until')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes(); // Add soft deletes support
            $table->timestamp('sold_at')->nullable();
            
            // Indexes for better performance
            $table->index(['status', 'rent_or_buy', 'category']);
            $table->index(['governorate_id', 'city_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['price', 'rent_or_buy']);
            $table->index(['is_featured', 'status']);
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
