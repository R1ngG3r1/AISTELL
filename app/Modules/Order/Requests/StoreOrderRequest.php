<?php

namespace App\Modules\Order\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * PRD 12 — Informasi pemesanan.
 *
 * Perhatikan: TIDAK ada 'user_id' dan 'status' di sini. Keduanya ditentukan
 * backend (PRD 17), sehingga nilai kiriman dari frontend untuk dua field itu diabaikan.
 */
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'contact_name' => ['required', 'string', 'max:100'],
            'contact_phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]{8,20}$/'],
            'location' => ['required', 'string', 'max:1000'],
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time' => ['required', 'date_format:H:i'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'service_id' => 'layanan',
            'contact_name' => 'nama pemesan',
            'contact_phone' => 'nomor kontak',
            'location' => 'lokasi layanan',
            'date' => 'tanggal layanan',
            'time' => 'waktu layanan',
            'notes' => 'catatan',
        ];
    }

    public function messages(): array
    {
        return [
            'contact_phone.regex' => 'Nomor kontak hanya boleh berisi angka, spasi, + atau - (8–20 karakter).',
            'date.after_or_equal' => 'Tanggal layanan tidak boleh sebelum hari ini.',
        ];
    }
}
