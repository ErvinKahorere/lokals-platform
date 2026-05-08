<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoProductSeeder extends Seeder
{
    public function run(): void
    {
        $marketOwner = User::query()->where('email', 'market@lokals.app')->first();
        $pharmacyOwner = User::query()->where('email', 'pharmacy@lokals.app')->first();
        $hardwareOwner = User::query()->where('email', 'hardware@lokals.app')->first();

        $market = Organization::query()->where('name', 'Okahandja Fresh Market')->first();
        $pharmacy = Organization::query()->where('name', 'Nau-Aib Pharmacy')->first();
        $hardware = Organization::query()->where('name', 'Five Rand Hardware')->first();

        $products = [
            [
                'title' => 'Fresh spinach family pack',
                'user_id' => $marketOwner?->id,
                'business_id' => $market?->id,
                'description' => 'A weekly produce bundle prepared for households and small food stalls.',
                'price' => 85,
                'sale_price' => 70,
                'category' => 'groceries',
                'town' => 'Okahandja',
                'area' => 'Town Centre',
                'stock_status' => 'in_stock',
                'status' => 'published',
            ],
            [
                'title' => 'Winter wellness medicine kit',
                'user_id' => $pharmacyOwner?->id,
                'business_id' => $pharmacy?->id,
                'description' => 'A practical medicine and first-aid bundle for seasonal colds and home care.',
                'price' => 240,
                'sale_price' => null,
                'category' => 'healthcare',
                'town' => 'Okahandja',
                'area' => 'Nau-Aib',
                'stock_status' => 'in_stock',
                'status' => 'published',
            ],
            [
                'title' => 'Home repair starter toolbox',
                'user_id' => $hardwareOwner?->id,
                'business_id' => $hardware?->id,
                'description' => 'Basic repair tools for taps, fittings, and small weekend maintenance jobs.',
                'price' => 399,
                'sale_price' => 349,
                'category' => 'hardware',
                'town' => 'Okahandja',
                'area' => 'Five Rand',
                'stock_status' => 'limited',
                'status' => 'published',
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['title' => $product['title']],
                $product,
            );
        }
    }
}
