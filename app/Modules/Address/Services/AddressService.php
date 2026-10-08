<?php

namespace App\Modules\Address\Services;

use App\Models\User;
use App\Modules\Address\Models\Address;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Business logic buku alamat. Aturan utamanya: selama user punya alamat,
 * selalu ada TEPAT SATU alamat utama.
 */
class AddressService
{
    /** Batas jumlah alamat per akun, mencegah spam data. */
    public const MAX_PER_USER = 10;

    /** @return Collection<int, Address> alamat utama di atas, lalu yang terbaru */
    public function listFor(User $user): Collection
    {
        return $user->addresses()->orderByDesc('is_primary')->latest('id')->get();
    }

    /**
     * Alamat pertama otomatis menjadi alamat utama.
     *
     * @throws ValidationException jika sudah mencapai batas
     */
    public function create(User $user, array $data, bool $makePrimary = false): Address
    {
        if ($user->addresses()->count() >= self::MAX_PER_USER) {
            throw ValidationException::withMessages([
                'address' => 'Maksimal '.self::MAX_PER_USER.' alamat. Hapus alamat lama terlebih dahulu.',
            ]);
        }

        return DB::transaction(function () use ($user, $data, $makePrimary) {
            $address = $user->addresses()->create($data);

            if ($makePrimary || $user->addresses()->count() === 1) {
                $this->setPrimary($address);
            }

            return $address;
        });
    }

    public function update(Address $address, array $data, bool $makePrimary = false): Address
    {
        return DB::transaction(function () use ($address, $data, $makePrimary) {
            $address->update($data);

            if ($makePrimary) {
                $this->setPrimary($address);
            }

            return $address;
        });
    }

    public function setPrimary(Address $address): Address
    {
        DB::transaction(function () use ($address) {
            Address::query()
                ->where('user_id', $address->user_id)
                ->whereKeyNot($address->id)
                ->update(['is_primary' => false]);

            $address->is_primary = true;
            $address->save();
        });

        return $address;
    }

    /** Jika alamat utama dihapus, alamat terbaru yang tersisa menjadi alamat utama. */
    public function delete(Address $address): void
    {
        DB::transaction(function () use ($address) {
            $address->delete();

            if ($address->is_primary) {
                $next = Address::query()->where('user_id', $address->user_id)->latest('id')->first();
                $next && $this->setPrimary($next);
            }
        });
    }
}
