<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Categories
        $women = Category::firstOrCreate(['slug' => 'women'], ['name' => 'Women']);
        $men   = Category::firstOrCreate(['slug' => 'men'],   ['name' => 'Men']);
        $acc   = Category::firstOrCreate(['slug' => 'accessories'], ['name' => 'Accessories']);

        $products = [
            [
                'category' => $women,
                'name' => 'Oversized Wool Blend Coat',
                'price' => 299.00,
                'stock' => 50,
                'description' => 'A timeless oversized silhouette crafted in a luxurious wool blend. Featuring clean lines, a relaxed dropped shoulder, and a single-button fastening for an effortlessly polished finish.',
                'image' => 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $women,
                'name' => 'Relaxed Poplin Shirt',
                'price' => 89.00,
                'stock' => 80,
                'description' => 'A refined silhouette crafted in Egyptian-cotton poplin. The relaxed fit falls effortlessly, with clean seam lines and a minimal point collar that embodies understated precision.',
                'image' => 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L', 'XL'],
            ],
            [
                'category' => $women,
                'name' => 'Wide-Leg Linen Trousers',
                'price' => 120.00,
                'stock' => 60,
                'description' => 'Tailored in breathable linen with a high-rise waist and wide-leg cut. A versatile wardrobe essential that transitions effortlessly from day to evening.',
                'image' => 'https://images.unsplash.com/photo-1594614271360-0ed9a570ae15?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $men,
                'name' => 'Cashmere Turtleneck',
                'price' => 195.00,
                'stock' => 40,
                'description' => 'Pure cashmere ribbed turtleneck with a slim fit and refined finish. A definitive cold-weather essential for the modern wardrobe.',
                'image' => 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category' => $acc,
                'name' => 'Structured Leather Tote',
                'price' => 340.00,
                'stock' => 25,
                'description' => 'A sculptural tote in full-grain vegetable-tanned leather. Minimal hardware and clean edges for a refined everyday carry.',
                'image' => 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=85&auto=format&fit=crop',
                'sizes' => [],
            ],
            [
                'category' => $acc,
                'name' => 'Chelsea Boots',
                'price' => 245.00,
                'stock' => 35,
                'description' => 'Classic Chelsea construction in smooth calfskin leather with elastic side panels. A perfectly proportioned silhouette with a minimal stacked heel.',
                'image' => 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['38', '39', '40', '41', '42', '43'],
            ],
            [
                'category' => $women,
                'name' => 'Satin Slip Dress',
                'price' => 135.00,
                'stock' => 45,
                'description' => 'A fluid satin slip dress with a delicate cowl neckline and a subtle bias cut that drapes beautifully. Versatile enough for day or evening.',
                'image' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $men,
                'name' => 'Merino V-Neck Sweater',
                'price' => 110.00,
                'stock' => 55,
                'description' => 'Knitted in extra-fine merino wool for all-day comfort. A classic V-neck profile with ribbed trims and a neat, confident fit.',
                'image' => 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
        ];

        foreach ($products as $data) {
            $product = Product::create([
                'category_id' => $data['category']->id,
                'name'        => $data['name'],
                'slug'        => Str::slug($data['name']),
                'description' => $data['description'],
                'price'       => $data['price'],
                'stock'       => $data['stock'],
                'is_active'   => true,
            ]);

            ProductImage::create([
                'product_id' => $product->id,
                'image_url'  => $data['image'],
                'is_primary' => true,
            ]);

            foreach ($data['sizes'] as $size) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'size'       => $size,
                    'color'      => 'Default',
                    'stock'      => (int) ($data['stock'] / max(count($data['sizes']), 1)),
                ]);
            }
        }

        $this->command->info('✓ Seeded ' . count($products) . ' products with images and variants.');
    }
}
