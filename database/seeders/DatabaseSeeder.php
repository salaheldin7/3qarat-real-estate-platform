<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed locations first (governorates and cities)
        $this->call([
            GovernorateSeeder::class,
            CitySeeder::class,
            UserSeeder::class, // Add users (founder, admin, sellers)
        ]);
    }
}
