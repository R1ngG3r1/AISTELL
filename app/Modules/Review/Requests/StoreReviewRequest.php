<?php

namespace App\Modules\Review\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // hak ulasan dicek lewat OrderPolicy::review di controller
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function attributes(): array
    {
        return ['rating' => 'rating', 'comment' => 'ulasan'];
    }

    public function messages(): array
    {
        return ['rating.required' => 'Pilih rating bintang 1–5.', 'rating.between' => 'Rating harus antara 1 sampai 5.'];
    }
}
