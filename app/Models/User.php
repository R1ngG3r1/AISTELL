<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Modules\Order\Models\Order;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // Nilai kolom `role` (PRD 16.1). Pakai konstanta agar tidak salah ketik.
    public const ROLE_USER = 'user';

    public const ROLE_ADMIN = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * `role` sengaja TIDAK ada di sini: kalau ada, orang iseng bisa mengirim
     * role=admin lewat form register/profil dan menjadi admin.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'avatar_path', // lokasi file internal; frontend cukup memakai avatar_url
    ];

    /**
     * Ikut dikirim ke frontend: URL foto profil (null jika belum ada foto).
     *
     * @var array<int, string>
     */
    protected $appends = ['avatar_url'];

    /** Disk penyimpanan foto profil (private, disajikan lewat route avatars.show). */
    public const AVATAR_DISK = 'local';

    /**
     * Default untuk objek baru, disamakan dengan default kolom di database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => self::ROLE_USER,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * URL foto profil. Nama file selalu acak & berubah setiap upload, jadi
     * dipakai sebagai ?v= agar browser tidak menampilkan foto lama dari cache.
     */
    protected function avatarUrl(): Attribute
    {
        return Attribute::get(fn () => $this->avatar_path
            ? route('avatars.show', ['user' => $this->id, 'v' => pathinfo($this->avatar_path, PATHINFO_FILENAME)])
            : null);
    }

    /** Hapus file foto dari storage saat akun dihapus, agar tidak menjadi file yatim. */
    protected static function booted(): void
    {
        static::deleted(function (User $user) {
            if ($user->avatar_path) {
                Storage::disk(self::AVATAR_DISK)->delete($user->avatar_path);
            }
        });
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /** Relasi 1:N — satu user bisa memiliki banyak pesanan (PRD 16.4). */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
