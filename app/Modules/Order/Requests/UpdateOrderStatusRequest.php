<?php

namespace App\Modules\Order\Requests;

use App\Modules\Order\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Rule::enum → nilai harus salah satu dari OrderStatus.
            // Apakah perubahannya boleh (mis. selesai → menunggu) dicek di OrderService.
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ];
    }

    /** Ambil status dalam bentuk Enum, bukan string. */
    public function status(): OrderStatus
    {
        return OrderStatus::from($this->validated('status'));
    }
}
