<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $reviews = $product->reviews()
            ->with('user:id,name')
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    public function store(Request $request, $slug)
    {
        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $product = Product::where('slug', $slug)->firstOrFail();

        // Verify user has purchased and received this product
        $hasPurchased = OrderItem::whereHas('order', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id)
              ->where('status', 'delivered');
        })->where('product_id', $product->id)->exists();

        if (!$hasPurchased) {
            return response()->json(['message' => 'You must purchase and receive this product before reviewing it.'], 403);
        }

        // Prevent duplicate reviews from same user on same product
        $exists = Review::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already reviewed this product.'], 422);
        }

        $review = Review::create([
            'user_id'    => $request->user()->id,
            'product_id' => $product->id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
        ]);

        return response()->json($review->load('user:id,name'), 201);
    }
}
