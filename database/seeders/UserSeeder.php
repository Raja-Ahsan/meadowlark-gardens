<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@meadowlarkgardens.com'],
            [
                'name' => 'Admin',
                'business_name' => 'Meadowlark Gardens TN',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'approved' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'wholesale@demo.com'],
            [
                'name' => 'Patricia Lee',
                'business_name' => 'Valley Garden Center',
                'password' => Hash::make('password123'),
                'role' => 'wholesale',
                'approved' => true,
            ]
        );
    }
}
