<?php

namespace App\Modules\Service\Services;

use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Service\Models\Service;
use Illuminate\Database\Eloquent\Collection;

/**
 * Service layer = tempat business logic. Controller hanya menerima request
 * lalu memanggil class ini, sehingga logika mudah dipakai ulang dan dites.
 *
 * (Nama class "ServiceCatalog" dan bukan "ServiceService" supaya tidak membingungkan:
 *  "Service" di sini = layanan kebersihan, bukan service layer.)
 */
class ServiceCatalog
{
    /** @return Collection<int, Service> */
    public function all(): Collection
    {
        return Service::query()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Service
    {
        return Service::create($data);
    }

    public function update(Service $service, array $data): Service
    {
        $service->update($data);

        return $service;
    }

    /**
     * Menghapus layanan. Mengembalikan false jika layanan masih memiliki pesanan yang sedang
     * berjalan (berstatus aktif: menunggu / diproses). Layanan boleh dihapus jika pesanan
     * terkait sudah selesai, dibatalkan, ditolak, atau belum pernah dipesan sama sekali.
     */
    public function delete(Service $service): bool
    {
        if ($service->orders()->whereIn('status', OrderStatus::active())->exists()) {
            return false;
        }

        return (bool) $service->delete();
    }
}
