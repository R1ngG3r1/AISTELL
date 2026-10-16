<?php

namespace App\Modules\Review\Services;

use App\Modules\Order\Models\Order;
use App\Modules\Review\Models\Review;
use App\Modules\Service\Models\Service;
use Illuminate\Database\Eloquent\Collection;

class ReviewService
{
    /** Jumlah ulasan terbaru di halaman detail layanan. */
    private const PER_SERVICE = 10;

    /** Ulasan dibuat dari pesanan: user, layanan, dan pesanan ditentukan backend. */
    public function create(Order $order, array $data): Review
    {
        $review = new Review($data);
        $review->order()->associate($order);
        $review->user()->associate($order->user_id);
        $review->service()->associate($order->service_id);
        $review->save();

        return $review;
    }

    public function update(Review $review, array $data): Review
    {
        $review->fill($data)->save();

        return $review;
    }

    public function delete(Review $review): void
    {
        $review->delete();
    }

    /** @return array<int, array<string, mixed>> */
    public function forService(Service $service): array
    {
        /** @var Collection<int, Review> $reviews */
        $reviews = $service->reviews()->with('user:id,name')->latest()->limit(self::PER_SERVICE)->get();

        return $reviews->map->toPublic()->all();
    }
}
