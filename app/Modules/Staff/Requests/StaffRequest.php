<?php

namespace App\Modules\Staff\Requests;

use App\Modules\Staff\Enums\StaffType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Tambah dan ubah petugas (dipakai bersama). */
class StaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:admin sudah dicek di route
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
            // Opsional: kosong = solo (create) / tidak berubah (update).
            'type' => ['sometimes', Rule::enum(StaffType::class)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return ['phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, + atau - (8–20 karakter).'];
    }

    public function attributes(): array
    {
        return ['name' => 'nama petugas', 'phone' => 'nomor telepon', 'type' => 'jenis petugas', 'is_active' => 'status aktif'];
    }
}
