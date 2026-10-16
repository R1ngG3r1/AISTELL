<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Models\Order;
use App\Modules\Review\Requests\StoreReviewRequest;
use App\Modules\Review\Services\ReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ReviewController extends Controller
{
    public function __construct(private ReviewService $reviews) {}

    // POST /orders/{order}/review
    public function store(StoreReviewRequest $request, Order $order): RedirectResponse
    {
        // Cek OrderPolicy::review → pemilik, pesanan selesai, belum pernah diulas.
        Gate::authorize('review', $order);

        $this->reviews->create($order, $request->validated());

        return back()->with('success', 'Terima kasih! Ulasan Anda sudah tersimpan.');
    }

    // PUT /orders/{order}/review
    public function update(StoreReviewRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('manageReview', $order);

        $this->reviews->update($order->review, $request->validated());

        return back()->with('success', 'Ulasan Anda diperbarui.');
    }

    // DELETE /orders/{order}/review
    public function destroy(Order $order): RedirectResponse
    {
        Gate::authorize('manageReview', $order);

        $this->reviews->delete($order->review);

        return back()->with('success', 'Ulasan Anda dihapus.');
    }
}
