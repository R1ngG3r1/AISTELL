<?php

namespace App\Modules\Service\Services;

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
        return Service::query()->orderBy('name')->get();
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
     * Menghapus layanan. Mengembalikan false jika layanan sudah pernah dipesan,
     * karena riwayat pesanan harus tetap utuh (foreign key restrictOnDelete).
     */
    public function delete(Service $service): bool
    {
        if ($service->orders()->exists()) {
            return false;
        }

        return (bool) $service->delete();
    }
}
