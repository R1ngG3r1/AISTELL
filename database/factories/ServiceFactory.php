<?php

namespace Database\Factories;

use App\Modules\Service\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Bersih Rumah', 'Potong Rumput', 'Angkut Sampah', 'Bersih Selokan']).' '.fake()->unique()->numberBetween(1, 9999),
            'description' => fake()->sentence(12),
            'price' => fake()->randomElement([50000, 75000, 100000, 150000, 250000]),
        ];
    }
}
