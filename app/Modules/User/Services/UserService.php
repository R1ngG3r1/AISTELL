<?php

namespace App\Modules\User\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    /**
     * Get paginated list of users.
     */
    public function getPaginatedUsers(int $perPage = 10): LengthAwarePaginator
    {
        return User::query()
            ->select(['id', 'name', 'email', 'created_at'])
            ->latest()
            ->paginate($perPage);
    }
}
