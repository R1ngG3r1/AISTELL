<?php

namespace App\Modules\User\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    /**
     * Get paginated list of users (+ jumlah pesanan masing-masing).
     */
    public function getPaginatedUsers(int $perPage = 10): LengthAwarePaginator
    {
        return User::query()
            ->select(['id', 'name', 'email', 'phone', 'role', 'avatar_path', 'created_at'])
            ->withCount('orders')
            ->latest()
            ->paginate($perPage);
    }
}
