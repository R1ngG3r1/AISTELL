<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PRD 6.2 & 6.3 — Dashboard User dan Dashboard Admin.
 */
class DashboardController extends Controller
{
    public function __construct(
        protected OrderService $orders
    ) {}

    // GET /dashboard — ringkasan pesanan milik user yang login
    public function user(Request $request): Response|RedirectResponse
    {
        // Admin yang membuka /dashboard diarahkan ke dashboard admin.
        if ($request->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Dashboard', [
            'stats' => $this->orders->statusCounts($request->user()),
            'latestOrders' => $this->orders->latest($request->user()),
        ]);
    }

    // GET /admin/dashboard — ringkasan seluruh pesanan
    public function admin(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => $this->orders->statusCounts(),
            'latestOrders' => $this->orders->latest(limit: 10),
        ]);
    }
}
