<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Founder User
        User::updateOrCreate(
            ['username' => 'founder'],
            [
                'name' => 'Founder User',
                'email' => 'founder@realestate.com',
                'phone' => '+201000000001',
                'password' => Hash::make('Founder@123'),
                'is_founder' => true,
                'is_admin' => true,
                'is_seller' => true,
                'banned' => false,
                'email_verified_at' => now(),
            ]
        );

        // Create Admin User
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin User',
                'email' => 'admin@realestate.com',
                'phone' => '+201000000002',
                'password' => Hash::make('Admin@123'),
                'is_founder' => false,
                'is_admin' => true,
                'is_seller' => true,
                'banned' => false,
                'email_verified_at' => now(),
            ]
        );

        // Create Sample Seller
        User::updateOrCreate(
            ['username' => 'johnseller'],
            [
                'name' => 'John Seller',
                'email' => 'seller@realestate.com',
                'phone' => '+201000000003',
                'password' => Hash::make('Seller@123'),
                'is_founder' => false,
                'is_admin' => false,
                'is_seller' => true,
                'banned' => false,
                'email_verified_at' => now(),
            ]
        );

        // Create Sample Regular User
        User::updateOrCreate(
            ['username' => 'janedoe'],
            [
                'name' => 'Jane Doe',
                'email' => 'user@realestate.com',
                'phone' => '+201000000004',
                'password' => Hash::make('User@123'),
                'is_founder' => false,
                'is_admin' => false,
                'is_seller' => false,
                'banned' => false,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Users seeded successfully!');
        $this->command->info('Founder: founder / Founder@123');
        $this->command->info('Admin: admin / Admin@123');
        $this->command->info('Seller: johnseller / Seller@123');
        $this->command->info('User: janedoe / User@123');
    }
}
