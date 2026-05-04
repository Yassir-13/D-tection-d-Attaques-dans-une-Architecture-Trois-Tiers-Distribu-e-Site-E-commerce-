<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('items.product')->latest()->get();
        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = $request->user()->orders()->with('items.product.images')->findOrFail($id);
        return response()->json($order);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.variant_id' => 'nullable|integer',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $totalAmount = 0;
                $resolvedProducts = []; // cache products to avoid double SQL

                foreach ($request->items as $item) {
                    $product = Product::findOrFail($item['product_id']);

                    if (!$product->is_active) {
                        throw ValidationException::withMessages([
                            'items' => ["Product '{$product->name}' is no longer available."]
                        ]);
                    }

                    if ($product->stock < $item['quantity']) {
                        throw ValidationException::withMessages([
                            'items' => ["Product '{$product->name}' does not have enough stock."]
                        ]);
                    }

                    $totalAmount += $product->price * $item['quantity'];
                    $product->decrement('stock', $item['quantity']);
                    $resolvedProducts[$item['product_id']] = $product;
                }

                $order = Order::create([
                    'user_id'          => $request->user()->id,
                    'status'           => 'pending',
                    'total_amount'     => $totalAmount,
                    'shipping_address' => $request->shipping_address,
                ]);

                foreach ($request->items as $item) {
                    $product = $resolvedProducts[$item['product_id']];
                    OrderItem::create([
                        'order_id'   => $order->id,
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'] ?? null,
                        'quantity'   => $item['quantity'],
                        'price'      => $product->price
                    ]);
                }

                return response()->json($order->load('items.product'), 201);
            });
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'One or more products were not found. Please refresh your cart.'], 422);
        }
    }
}
