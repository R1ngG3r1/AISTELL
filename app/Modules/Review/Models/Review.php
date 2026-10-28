<?php

namespace App\Modules\Review\Models;

use App\Models\User;
use App\Modules\Order\Models\Order;
use App\Modules\Service\Models\Service;
use Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    /** order_id, user_id, dan service_id selalu diisi ReviewService, bukan dari form. */
    protected $fillable = ['rating', 'comment'];

    protected function casts(): array
    {
        return ['rating' => 'integer'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class)->withTrashed();
    }

    /** Nama pengulas disingkat ("Budi Santoso" → "Budi S.") agar identitas tetap terjaga di halaman publik. */
    public function reviewerName(): string
    {
        $parts = preg_split('/\s+/', trim($this->user->name)) ?: [];
        $last = count($parts) > 1 ? ' '.mb_strtoupper(mb_substr(end($parts), 0, 1)).'.' : '';

        return $parts[0].$last;
    }

    /** Bentuk ringkas untuk daftar ulasan di halaman layanan. */
    public function toPublic(): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'reviewer' => $this->reviewerName(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    protected static function newFactory(): ReviewFactory
    {
        return ReviewFactory::new();
    }
}
