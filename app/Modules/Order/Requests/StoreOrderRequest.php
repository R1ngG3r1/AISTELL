<?php

namespace App\Modules\Order\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Validator;

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
            // Titik peta opsional (dari peta di formulir), harus berpasangan.
            'latitude' => ['nullable', 'required_with:longitude', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'required_with:latitude', 'numeric', 'between:-180,180'],
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time' => ['required', 'date_format:H:i'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Aturan lanjutan setelah aturan dasar lolos: jadwal tidak boleh di masa lalu.
     * "after_or_equal:today" hanya mengecek tanggal, sehingga pesanan hari ini
     * pukul 08:00 tetap lolos walaupun sekarang sudah pukul 15:00.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->hasAny(['date', 'time'])) {
                    return;
                }

                $schedule = Carbon::createFromFormat('Y-m-d H:i', $this->input('date').' '.$this->input('time'));

                if ($schedule->isPast()) {
                    $validator->errors()->add('time', 'Waktu layanan sudah lewat. Pilih jam yang belum terlewati.');
                }
            },
        ];
    }

    public function attributes(): array
    {
        return [
            'service_id' => 'layanan',
            'contact_name' => 'nama pemesan',
            'contact_phone' => 'nomor kontak',
            'location' => 'lokasi layanan',
            'latitude' => 'titik peta',
            'longitude' => 'titik peta',
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
