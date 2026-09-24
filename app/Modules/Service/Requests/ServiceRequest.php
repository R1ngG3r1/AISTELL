<?php

namespace App\Modules\Service\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest = tempat aturan validasi. Laravel menjalankannya OTOMATIS sebelum
 * method controller dipanggil. Jika gagal, user dikembalikan ke form beserta
 * pesan error (di React tersedia di `errors` dari useForm()).
 *
 * Dipakai bersama oleh tambah (store) dan ubah (update) layanan.
 */
class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Pengecekan admin sudah dilakukan middleware 'role:admin' di route.
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999999'],
        ];
    }

    /** Nama field dalam bahasa Indonesia untuk pesan error. */
    public function attributes(): array
    {
        return [
            'name' => 'nama layanan',
            'description' => 'deskripsi',
            'price' => 'harga',
        ];
    }
}
