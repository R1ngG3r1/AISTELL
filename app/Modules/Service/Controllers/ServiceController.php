<?php

namespace App\Modules\Service\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Service\Models\Service;
use App\Modules\Service\Services\ServiceCatalog;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PRD 17 "Services — User": melihat daftar & detail layanan.
 */
class ServiceController extends Controller
{
    // Dependency injection: Laravel otomatis membuatkan objek ServiceCatalog.
    public function __construct(
        protected ServiceCatalog $catalog
    ) {}

    // GET /services
    public function index(): Response
    {
        return Inertia::render('Services/Index', [
            'services' => $this->catalog->all(),
        ]);
    }

    // GET /services/{service}
    // Route model binding: Laravel otomatis mencari Service dengan id dari URL,
    // dan mengembalikan 404 jika tidak ditemukan.
    public function show(Service $service): Response
    {
        return Inertia::render('Services/Show', [
            'service' => $service,
        ]);
    }
}
