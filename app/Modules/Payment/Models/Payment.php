<?php

namespace App\Modules\Payment\Models;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    /** Semua kolom diisi oleh PaymentService, tidak pernah langsung dari form. */
    protected $guarded = ['id'];

    protected $appends = ['method_label', 'method_group', 'status_label'];

    protected function casts(): array
    {
        return [
            'method' => PaymentMethod::class,
            'status' => PaymentStatus::class,
            'amount' => 'decimal:2',
            'fee' => 'decimal:2',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * Pembayaran yang lewat batas waktu otomatis menjadi Kedaluwarsa saat dibaca,
     * jadi tidak perlu menunggu cron/scheduler berjalan.
     */
    protected static function booted(): void
    {
        static::retrieved(function (Payment $payment) {
            if ($payment->status === PaymentStatus::Menunggu && $payment->expires_at?->isPast()) {
                $payment->status = PaymentStatus::Kedaluwarsa;
                $payment->saveQuietly();
            }
        });
    }

    protected function methodLabel(): Attribute
    {
        return Attribute::get(fn () => $this->method?->label());
    }

    protected function methodGroup(): Attribute
    {
        return Attribute::get(fn () => $this->method?->group());
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::get(fn () => $this->status?->label());
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
