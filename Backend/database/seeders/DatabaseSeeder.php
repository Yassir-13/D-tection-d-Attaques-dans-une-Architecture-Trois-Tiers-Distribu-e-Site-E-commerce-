<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Regular test user
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => 'password', 'role' => 'user']
        );

        // Admin user — accessible at /admin
        User::firstOrCreate(
            ['email' => 'admin@luxe.com'],
            ['name' => 'Admin', 'password' => 'password', 'role' => 'admin']
        );

        $this->call(ProductSeeder::class);
    }
}
