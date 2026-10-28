<?php

namespace App\Modules\Service\Models;

use App\Modules\Order\Models\Order;
use App\Modules\Review\Models\Review;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model = representasi satu baris tabel `services` dalam bentuk objek PHP.
 * Contoh: Service::all(), Service::find(1), $service->orders.
 */
class Service extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Kolom yang boleh diisi sekaligus lewat Service::create([...]) / ->update([...]).
     * Kolom di luar daftar ini diabaikan (perlindungan "mass assignment").
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_minutes',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_minutes' => 'integer',
        ];
    }

    /** Relasi 1:N - satu layanan bisa dipesan di banyak order. */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Model ini berada di dalam modul (bukan App\Models), jadi Laravel tidak bisa
     * menebak lokasi factory-nya secara otomatis. Di sini kita tunjukkan manual.
     */
    protected static function newFactory(): ServiceFactory
    {
        return ServiceFactory::new();
    }
}
