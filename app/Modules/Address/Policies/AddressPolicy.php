<?php

namespace App\Modules\Address\Policies;

use App\Models\User;
use App\Modules\Address\Models\Address;

/** Alamat hanya boleh diubah / dihapus oleh pemiliknya. */
class AddressPolicy
{
    public function manage(User $user, Address $address): bool
    {
        return $address->user_id === $user->id;
    }
}
