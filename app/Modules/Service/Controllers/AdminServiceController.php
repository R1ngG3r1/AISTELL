<?php

namespace App\Modules\Service\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Service\Models\Service;
use App\Modules\Service\Requests\ServiceRequest;
use App\Modules\Service\Services\ServiceCatalog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PRD 17 "Services — Admin": tambah, ubah, hapus layanan.
 *
 * Pola Inertia: aksi yang mengubah data (POST/PUT/DELETE) diakhiri redirect,
 * bukan return JSON. Halaman React lalu dimuat ulang dengan data terbaru.
 */
class AdminServiceController extends Controller
{
    public function __construct(
        protected ServiceCatalog $catalog
    ) {}

    // GET /admin/services
    public function index(): Response
    {
        return Inertia::render('Admin/Services/Index', [
            // withCount → setiap layanan punya field orders_count (jumlah pesanan).
            'services' => Service::query()->withCount('orders')->orderBy('name')->get(),
        ]);
    }

    // POST /admin/services
    public function store(ServiceRequest $request): RedirectResponse
    {
        // validated() hanya berisi field yang lolos validasi, aman untuk disimpan.
        $this->catalog->create($request->validated());

        return back()->with('success', 'Layanan berhasil ditambahkan.');
    }

    // PUT /admin/services/{service}
    public function update(ServiceRequest $request, Service $service): RedirectResponse
    {
        $this->catalog->update($service, $request->validated());

        return back()->with('success', 'Layanan berhasil diperbarui.');
    }

    // DELETE /admin/services/{service}
    public function destroy(Service $service): RedirectResponse
    {
        if (! $this->catalog->delete($service)) {
            return back()->with('error', 'Layanan tidak dapat dihapus karena sudah memiliki pesanan.');
        }

        return back()->with('success', 'Layanan berhasil dihapus.');
    }
}
