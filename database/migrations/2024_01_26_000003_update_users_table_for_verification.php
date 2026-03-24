<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_seller')) {
                $table->boolean('is_seller')->default(true)->after('password');
            }
            
            if (!Schema::hasColumn('users', 'is_admin')) {
                $table->boolean('is_admin')->default(false)->after('is_seller');
            }
            
            if (!Schema::hasColumn('users', 'is_founder')) {
                $table->boolean('is_founder')->default(false)->after('is_admin');
            }
            
            if (!Schema::hasColumn('users', 'banned')) {
                $table->boolean('banned')->default(false)->after('is_founder');
            }
            
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('username');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['is_seller', 'is_admin', 'is_founder', 'banned', 'avatar'];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};