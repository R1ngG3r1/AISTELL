<?php

namespace Database\Factories;

use App\Modules\Staff\Enums\StaffType;
use App\Modules\Staff\Models\Staff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Staff>
 */
class StaffFactory extends Factory
{
    protected $model = Staff::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => fake()->numerify('08##########'),
            'type' => StaffType::Solo,
            'is_active' => true,
        ];
    }

    public function team(): static
    {
        return $this->state(fn () => ['type' => StaffType::Tim]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
