<?php

namespace App\Modules\Staff\Models;

use App\Modules\Order\Models\Order;
use App\Modules\Staff\Enums\StaffType;
use Database\Factories\StaffFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Petugas lapangan (data saja, tanpa login). */
class Staff extends Model
{
    use HasFactory;

    /** Nama tabel tidak boleh ditebak Laravel ("staffs"). */
    protected $table = 'staff';

    protected $fillable = ['name', 'phone', 'type', 'is_active'];

    /** Nilai default untuk objek baru, sebelum disimpan ke database. */
    protected $attributes = ['type' => 'solo'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'type' => StaffType::class];
    }

    /** Tim: ke lapangan bersama anggota lain, dan petugas ini penanggung jawabnya. */
    public function isTeam(): bool
    {
        return $this->type === StaffType::Tim;
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    protected static function newFactory(): StaffFactory
    {
        return StaffFactory::new();
    }
}
