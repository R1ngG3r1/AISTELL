<?php

namespace Database\Factories;

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Service\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            // Jika tidak ditentukan, factory otomatis membuat user & layanan baru.
            'user_id' => User::factory(),
            'service_id' => Service::factory(),
            'date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'time' => fake()->randomElement(['08:00', '09:00', '13:00', '15:00']),
            'location' => fake()->address(),
            'contact_name' => fake()->name(),
            'contact_phone' => fake()->numerify('08##########'),
            'notes' => fake()->optional()->sentence(),
            'status' => OrderStatus::Menunggu,
        ];
    }

    /** Harga pesanan disamakan dengan harga layanannya (seperti OrderService::createFor). */
    public function configure(): static
    {
        return $this->afterMaking(function (Order $order) {
            $order->price ??= Service::query()->find($order->service_id)?->price;
        });
    }

    /** Contoh: Order::factory()->status(OrderStatus::Diproses)->create() */
    public function status(OrderStatus $status): static
    {
        return $this->state(fn () => ['status' => $status]);
    }
}
