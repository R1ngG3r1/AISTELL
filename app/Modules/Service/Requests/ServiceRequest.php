<?php

namespace App\Modules\Service\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            // Nama layanan unik di antara layanan aktif (saat mengubah, abaikan layanan itu sendiri).
            'name' => ['required', 'string', 'max:100', Rule::unique('services', 'name')->whereNull('deleted_at')->ignore($this->route('service'))],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999999'],
            // Opsional: kosong = default 120 menit (create) / tidak berubah (update). Dipakai mendeteksi jadwal petugas bentrok.
            'duration_minutes' => ['sometimes', 'integer', 'min:15', 'max:720'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Layanan dengan nama ini sudah ada.',
        ];
    }

    /** Nama field dalam bahasa Indonesia untuk pesan error. */
    public function attributes(): array
    {
        return [
            'name' => 'nama layanan',
            'description' => 'deskripsi',
            'price' => 'harga',
            'duration_minutes' => 'durasi pengerjaan',
        ];
    }
}
