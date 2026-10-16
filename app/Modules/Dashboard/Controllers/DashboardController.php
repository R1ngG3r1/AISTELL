<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PRD 6.2 & 6.3 - Dashboard User dan Dashboard Admin.
 *
 * Setiap prop dibungkus fn() supaya polling realtime dari frontend
 * (router.reload({ only: [...] })) hanya menjalankan query yang diminta.
 */
class DashboardController extends Controller
{
    public function __construct(
        protected OrderService $orders
    ) {}

    // GET /dashboard - ringkasan pesanan milik user yang login
    public function user(Request $request): Response|RedirectResponse
    {
        // Admin yang membuka /dashboard diarahkan ke dashboard admin.
        if ($request->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $user = $request->user();

        return Inertia::render('Dashboard', [
            'stats' => fn () => $this->orders->statusCounts($user),
            'latestOrders' => fn () => $this->orders->latest($user),
            'upcomingOrders' => fn () => $this->orders->upcoming($user, 3),
            'schedule' => fn () => $this->orders->schedule($user),
        ]);
    }

    // GET /admin/dashboard - ringkasan seluruh pesanan
    public function admin(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => fn () => $this->orders->statusCounts(),
            'latestOrders' => fn () => $this->orders->latest(limit: 6),
            'pendingOrders' => fn () => $this->orders->pending(4),
            'schedule' => fn () => $this->orders->schedule(),
        ]);
    }
}
