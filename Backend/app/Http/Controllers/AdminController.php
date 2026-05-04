<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    // Dashboard stats
    public function getDashboardStats()
    {
        return response()->json([
            'total_users'    => User::count(),
            'total_orders'   => Order::count(),
            'total_revenue'  => Order::where('status', 'delivered')->sum('total_amount'),
            'total_products' => Product::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
        ]);
    }

    // All orders with pagination
    public function getOrders(Request $request)
    {
        $orders = Order::with('user', 'items.product')
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    // Update order status + tracking
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status'          => 'required|in:pending,processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;

        if ($request->filled('tracking_number')) {
            $order->tracking_number = $request->tracking_number;
        }

        $order->save();

        return response()->json($order);
    }

    // Create product
    public function storeProduct(Request $request)
    {
        // Fallback translation if frontend sends 'category' slug instead of 'category_id'
        if (!$request->has('category_id') && $request->filled('category')) {
            $cat = Category::where('name', $request->category)->orWhere('slug', $request->category)->first();
            if ($cat) {
                $request->merge(['category_id' => $cat->id]);
            }
        }
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'is_active'   => 'boolean',
            'image_url'   => 'nullable|url',
            'image'       => 'nullable|image|max:5120',
        ]);

        $product = Product::create([
            'category_id' => $request->category_id,
            'name'        => $request->name,
            'slug'        => Str::slug($request->name) . '-' . Str::random(4),
            'description' => $request->description,
            'price'       => $request->price,
            'stock'       => $request->stock,
            'is_active'   => $request->boolean('is_active', true),
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imageUrl = asset('storage/' . $path);
        } else if ($request->filled('image_url')) {
            $imageUrl = $request->image_url;
        }

        if ($imageUrl) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_url'  => $imageUrl,
                'is_primary' => true,
            ]);
        }

        return response()->json($product->load('images'), 201);
    }

    // Update product
    public function updateProduct(Request $request, $id)
    {
        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'is_active'   => 'sometimes|boolean',
            'category_id' => 'sometimes|exists:categories,id',
        ]);

        $product = Product::findOrFail($id);
        $product->update($request->only(['name', 'description', 'price', 'stock', 'is_active', 'category_id']));

        return response()->json($product->load('images', 'variants', 'category'));
    }

    // Delete product
    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    // All users
    public function getUsers(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json($users);
    }

    // All categories
    public function getCategories()
    {
        return response()->json(Category::withCount('products')->get());
    }

    // Create category
    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return response()->json($category, 201);
    }
}
