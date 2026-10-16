<?php

namespace App\Modules\Order\Models;

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Review\Models\Review;
use App\Modules\Service\Models\Service;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    /**
     * `user_id` dan `status` sengaja TIDAK dimasukkan ke sini.
     * - user_id diisi lewat relasi $user->orders()->create(...), jadi selalu
     *   akun yang sedang login (PRD 17: user_id ditentukan backend).
     * - status hanya boleh berubah lewat OrderService (aturan transisi).
     */
    protected $fillable = [
        'service_id',
        'date',
        'time',
        'location',
        'latitude',
        'longitude',
        'contact_name',
        'contact_phone',
        'notes',
    ];

    /** Nilai default untuk objek baru, sebelum disimpan ke database. */
    protected $attributes = [
        'status' => 'menunggu',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            // Harga saat pesanan dibuat (diisi OrderService, bukan dari form).
            'price' => 'decimal:2',
            // Titik peta lokasi (null jika user tidak memilih titik)
            'latitude' => 'float',
            'longitude' => 'float',
            // Kolom status otomatis diubah menjadi Enum OrderStatus saat dibaca,
            // dan kembali menjadi string saat disimpan.
            'status' => OrderStatus::class,
        ];
    }

    /**
     * Field tambahan yang ikut dikirim ke frontend walaupun tidak ada di tabel.
     * Hasilnya di React: order.status = "diproses", order.status_label = "Diproses".
     */
    protected $appends = ['status_label'];

    protected function statusLabel(): Attribute
    {
        return Attribute::get(fn () => $this->status?->label());
    }

    /** Relasi N:1 — setiap pesanan dimiliki satu user. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Relasi N:1 — setiap pesanan mengacu pada satu layanan. */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** Relasi 1:N — semua percobaan pembayaran (ganti metode, kedaluwarsa, …). */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /** Pembayaran terbaru, yang ditampilkan sebagai status bayar pesanan. */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    /**
     * Terapkan filter daftar pesanan (lihat OrderFilterRequest::filters()).
     * Kunci yang kosong/tidak ada diabaikan.
     *
     * @param  array<string, mixed>  $filters
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query
            ->when($filters['status'] ?? null, fn (Builder $q, $status) => $q->where('status', $status))
            ->when($filters['service'] ?? null, fn (Builder $q, $id) => $q->where('service_id', $id))
            ->when($filters['from'] ?? null, fn (Builder $q, $date) => $q->whereDate('date', '>=', $date))
            ->when($filters['to'] ?? null, fn (Builder $q, $date) => $q->whereDate('date', '<=', $date))
            ->when($filters['payment'] ?? null, fn (Builder $q, $payment) => $payment === 'lunas'
                ? $q->whereHas('payments', fn (Builder $p) => $p->where('status', PaymentStatus::Lunas))
                : $q->whereDoesntHave('payments', fn (Builder $p) => $p->where('status', PaymentStatus::Lunas)))
            ->when($filters['q'] ?? null, function (Builder $q, string $term) {
                // % dan _ dari pengguna dianggap huruf biasa, bukan wildcard LIKE.
                $like = '%'.addcslashes($term, '%_\\').'%';

                $q->where(function (Builder $w) use ($term, $like) {
                    // "12" atau "#12" → cari nomor pesanan
                    if (preg_match('/^#?(\d+)$/', $term, $m)) {
                        $w->orWhere('id', (int) $m[1]);
                    }

                    $w->orWhere('contact_name', 'like', $like)
                        ->orWhere('contact_phone', 'like', $like)
                        ->orWhereHas('user', fn (Builder $u) => $u->where('email', 'like', $like))
                        ->orWhereHas('service', fn (Builder $s) => $s->where('name', 'like', $like));
                });
            });
    }

    /** Ulasan user untuk pesanan ini (maks. satu). */
    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    protected static function newFactory(): OrderFactory
    {
        return OrderFactory::new();
    }
}
