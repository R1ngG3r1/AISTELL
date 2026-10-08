<?php

namespace App\Modules\Address\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Tambah / ubah alamat di buku alamat (Profil Saya). */
class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:1000'],
            'detail' => ['nullable', 'string', 'max:255'],
            // Titik peta opsional, tetapi harus diisi berpasangan.
            'latitude' => ['nullable', 'required_with:longitude', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'required_with:latitude', 'numeric', 'between:-180,180'],
            'is_primary' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'label' => 'label alamat',
            'address' => 'alamat lengkap',
            'detail' => 'detail alamat',
            'latitude' => 'titik peta',
            'longitude' => 'titik peta',
        ];
    }
}
