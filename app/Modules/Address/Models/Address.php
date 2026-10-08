<?php

namespace App\Modules\Address\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    /**
     * `user_id` diisi lewat relasi $user->addresses()->create(...).
     * `is_primary` hanya diubah lewat AddressService agar selalu ada tepat satu alamat utama.
     */
    protected $fillable = [
        'label',
        'address',
        'detail',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            // float agar di React langsung berupa angka, bukan string "-5.3971000"
            'latitude' => 'float',
            'longitude' => 'float',
            'is_primary' => 'boolean',
        ];
    }

    /** Relasi N:1 — setiap alamat dimiliki satu user. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
