<?php

namespace App\Modules\Address\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Address\Models\Address;
use App\Modules\Address\Requests\AddressRequest;
use App\Modules\Address\Services\AddressService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

/**
 * Buku alamat di halaman Profil Saya. Daftar alamat dikirim lewat
 * ProfileController@edit & OrderController@create, jadi di sini hanya aksi tulis.
 */
class AddressController extends Controller
{
    public function __construct(
        protected AddressService $addresses
    ) {}

    // POST /addresses
    public function store(AddressRequest $request): RedirectResponse
    {
        $this->addresses->create($request->user(), $request->safe()->except('is_primary'), $request->boolean('is_primary'));

        return back()->with('success', 'Alamat berhasil ditambahkan.');
    }

    // PUT /addresses/{address}
    public function update(AddressRequest $request, Address $address): RedirectResponse
    {
        Gate::authorize('manage', $address);

        $this->addresses->update($address, $request->safe()->except('is_primary'), $request->boolean('is_primary'));

        return back()->with('success', 'Alamat berhasil diperbarui.');
    }

    // PATCH /addresses/{address}/primary
    public function primary(Address $address): RedirectResponse
    {
        Gate::authorize('manage', $address);

        $this->addresses->setPrimary($address);

        return back()->with('success', 'Alamat utama berhasil diganti.');
    }

    // DELETE /addresses/{address}
    public function destroy(Address $address): RedirectResponse
    {
        Gate::authorize('manage', $address);

        $this->addresses->delete($address);

        return back()->with('success', 'Alamat berhasil dihapus.');
    }
}
