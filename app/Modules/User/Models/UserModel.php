<?php

namespace App\Modules\User\Models;

use App\Models\User;

class UserModel extends User
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';
}
