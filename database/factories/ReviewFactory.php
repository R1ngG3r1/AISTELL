<?php

namespace Database\Factories;

use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Review\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /** Ulasan selalu milik pesanan selesai; user & layanan mengikuti pesanan itu. */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory()->status(OrderStatus::Selesai),
            'user_id' => fn (array $attrs) => Order::find($attrs['order_id'])->user_id,
            'service_id' => fn (array $attrs) => Order::find($attrs['order_id'])->service_id,
            'rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->optional()->sentence(),
        ];
    }
}
