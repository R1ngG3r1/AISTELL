<?php

namespace App\Modules\Staff\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:admin sudah dicek di route
    }

    public function rules(): array
    {
        // null = lepas petugas dari pesanan
        return ['staff_id' => ['present', 'nullable', 'integer', 'exists:staff,id']];
    }

    public function messages(): array
    {
        return ['staff_id.exists' => 'Petugas tidak ditemukan.', 'staff_id.present' => 'Pilih petugas.'];
    }
}
