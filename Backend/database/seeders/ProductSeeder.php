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
        // ── Categories ────────────────────────────────────────────────────
        $women = Category::firstOrCreate(['slug' => 'women'], ['name' => 'Women']);
        $men   = Category::firstOrCreate(['slug' => 'men'],   ['name' => 'Men']);
        $acc   = Category::firstOrCreate(['slug' => 'accessories'], ['name' => 'Accessories']);

        $products = [

            // ══════════════════════════════════════════════════════════════
            //  WOMEN  (12 produits)
            // ══════════════════════════════════════════════════════════════
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
                'category' => $women,
                'name' => 'Satin Slip Dress',
                'price' => 135.00,
                'stock' => 45,
                'description' => 'A fluid satin slip dress with a delicate cowl neckline and a subtle bias cut that drapes beautifully. Versatile enough for day or evening.',
                'image' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $women,
                'name' => 'Tailored Double-Breasted Blazer',
                'price' => 220.00,
                'stock' => 35,
                'description' => 'A sharp double-breasted blazer in a fine stretch-wool blend. Structured shoulders, flap pockets and a nipped waist deliver authority with elegance.',
                'image' => 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $women,
                'name' => 'Fine-Knit Ribbed Cardigan',
                'price' => 95.00,
                'stock' => 70,
                'description' => 'An essential open-front cardigan in a super-fine viscose-blend rib. Relaxed and long-line with a gentle drape — the ideal layering piece.',
                'image' => 'https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L', 'XL'],
            ],
            [
                'category' => $women,
                'name' => 'Pleated Midi Skirt',
                'price' => 115.00,
                'stock' => 55,
                'description' => 'A fluid midi skirt with fine knife pleats all around. Cut in a lightweight crêpe that moves beautifully — pairs effortlessly with a tucked shirt or knit.',
                'image' => 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $women,
                'name' => 'Wrap Midi Dress',
                'price' => 149.00,
                'stock' => 40,
                'description' => 'A classic wrap construction in a silk-touch fabric. The adjustable tie waist flatters every silhouette, while the midi length adds effortless sophistication.',
                'image' => 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $women,
                'name' => 'Classic Trench Coat',
                'price' => 345.00,
                'stock' => 20,
                'description' => 'The definitive trench in a water-resistant gabardine cotton. Storm flap, epaulettes, gun flap and D-ring belt — a wardrobe investment for decades.',
                'image' => 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $women,
                'name' => 'Silk Charmeuse Blouse',
                'price' => 175.00,
                'stock' => 30,
                'description' => 'A draped blouse in pure silk charmeuse. The fluid neckline falls in a soft cowl, with a relaxed body that tucks neatly or flows over the waistband.',
                'image' => 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'category' => $women,
                'name' => 'High-Rise Straight Jeans',
                'price' => 130.00,
                'stock' => 65,
                'description' => 'A clean straight-leg cut in rigid Japanese selvedge denim. High-rise with a neat, slightly cropped ankle — the modern essential to pair with everything.',
                'image' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L', 'XL'],
            ],
            [
                'category' => $women,
                'name' => 'Ribbed Bodysuit',
                'price' => 65.00,
                'stock' => 90,
                'description' => 'A clean, form-fitting bodysuit in a cotton-modal rib. Scoop neckline, long sleeves and a secure snap closure — the ultimate layering foundation.',
                'image' => 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],

            // ══════════════════════════════════════════════════════════════
            //  MEN  (6 produits)
            // ══════════════════════════════════════════════════════════════
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
                'category' => $men,
                'name' => 'Merino V-Neck Sweater',
                'price' => 110.00,
                'stock' => 55,
                'description' => 'Knitted in extra-fine merino wool for all-day comfort. A classic V-neck profile with ribbed trims and a neat, confident fit.',
                'image' => 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category' => $men,
                'name' => 'Slim Tailored Trousers',
                'price' => 145.00,
                'stock' => 45,
                'description' => 'Precision-cut trousers in a mid-weight Italian wool. A slim silhouette with a clean front pleat and a tapered ankle — the backbone of a modern suit wardrobe.',
                'image' => 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category' => $men,
                'name' => 'Oxford Button-Down Shirt',
                'price' => 95.00,
                'stock' => 75,
                'description' => 'A crisp button-down in a classic Oxford weave cotton. The relaxed fit and button-down collar make this the most versatile shirt in the collection.',
                'image' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            ],
            [
                'category' => $men,
                'name' => 'Raw Selvedge Denim Jacket',
                'price' => 210.00,
                'stock' => 30,
                'description' => 'A workwear-inspired chore jacket reimagined in Japanese selvedge denim. Clean lines, minimal hardware and a structured silhouette that softens beautifully with wear.',
                'image' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category' => $men,
                'name' => 'Linen Relaxed Shirt',
                'price' => 85.00,
                'stock' => 60,
                'description' => 'A breezy summer shirt in washed linen with a relaxed, unfussy fit. The slightly rumpled texture is part of its natural character — made for warm evenings.',
                'image' => 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],

            // ══════════════════════════════════════════════════════════════
            //  ACCESSORIES  (6 produits)
            // ══════════════════════════════════════════════════════════════
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
                'category' => $acc,
                'name' => 'Lambskin Leather Gloves',
                'price' => 85.00,
                'stock' => 40,
                'description' => 'Butter-soft lambskin leather gloves with a clean, unlined construction. An elegant cold-weather accessory with a timeless silhouette.',
                'image' => 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L'],
            ],
            [
                'category' => $acc,
                'name' => 'Fine Wool Scarf',
                'price' => 75.00,
                'stock' => 50,
                'description' => 'A generously sized scarf in fine Scottish wool. A neutral palette and clean fringe finish make it the ideal companion for any coat.',
                'image' => 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=85&auto=format&fit=crop',
                'sizes' => [],
            ],
            [
                'category' => $acc,
                'name' => 'Minimalist Leather Belt',
                'price' => 65.00,
                'stock' => 60,
                'description' => 'A clean, pin-buckle belt in smooth full-grain leather. 3cm width, polished brass hardware — a finishing detail that elevates any outfit.',
                'image' => 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=85&auto=format&fit=crop',
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category' => $acc,
                'name' => 'Canvas Weekender Bag',
                'price' => 185.00,
                'stock' => 20,
                'description' => 'A spacious overnight bag in waxed canvas with full-grain leather handles and trim. A utilitarian silhouette that ages beautifully with every journey.',
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85&auto=format&fit=crop',
                'sizes' => [],
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
