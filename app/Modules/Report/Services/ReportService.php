<?php

namespace App\Modules\Report\Services;

use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Report\Support\ReportPeriod;
use App\Modules\Review\Models\Review;
use App\Modules\Service\Models\Service;
use Illuminate\Database\Eloquent\Builder;

/**
 * Angka dan data grafik untuk halaman Laporan admin.
 *
 * Aturan hitung (ditampilkan juga di halaman):
 *  - Pendapatan  = total pembayaran berstatus Lunas yang DIBAYAR pada rentang tanggal.
 *                  Pembayaran yang dikembalikan (refund) otomatis tidak ikut.
 *  - Pesanan     = pesanan yang DIBUAT pada rentang tanggal, per statusnya saat ini.
 */
class ReportService
{
    /** Layanan terbanyak yang ditampilkan di grafik; sisanya digabung jadi "Lainnya". */
    private const TOP_SERVICES = 8;

    /** @return array<string, mixed> */
    public function build(ReportPeriod $period): array
    {
        $previous = $period->previous();

        $now = $this->totals($period);
        $before = $this->totals($previous);

        return [
            'summary' => [
                'revenue' => $this->metric($now['revenue'], $before['revenue']),
                'orders' => $this->metric($now['orders'], $before['orders']),
                'completed' => $this->metric($now['completed'], $before['completed']),
                'rating' => [
                    'value' => $now['rating'],
                    'count' => $now['rating_count'],
                    'previous' => $before['rating'],
                ],
            ],
            'granularity' => $period->granularity(),
            'revenueSeries' => $this->revenueSeries($period),
            'ordersSeries' => $this->ordersSeries($period),
            'byService' => $this->byService($period),
            'byMethod' => $this->byMethod($period),
            'byStatus' => $this->byStatus($period),
            'previousPeriod' => ['from' => $previous->from->toDateString(), 'to' => $previous->to->toDateString()],
        ];
    }

    /** @return array{revenue: float, orders: int, completed: int, rating: ?float, rating_count: int} */
    private function totals(ReportPeriod $period): array
    {
        $orders = $this->ordersIn($period);
        $rating = Review::query()->whereBetween('created_at', [$period->from, $period->to]);

        return [
            'revenue' => (float) $this->paidIn($period)->sum('amount'),
            'orders' => (clone $orders)->count(),
            'completed' => (clone $orders)->where('status', OrderStatus::Selesai)->count(),
            'rating' => ($avg = (clone $rating)->avg('rating')) === null ? null : round((float) $avg, 2),
            'rating_count' => (clone $rating)->count(),
        ];
    }

    /** @return array{value: float|int, previous: float|int, delta: ?float} delta dalam persen; null jika sebelumnya 0 */
    private function metric(float|int $value, float|int $previous): array
    {
        return [
            'value' => $value,
            'previous' => $previous,
            'delta' => $previous > 0 ? round(($value - $previous) / $previous * 100, 1) : null,
        ];
    }

    /** @return array<int, array{key: string, value: float, count: int}> */
    private function revenueSeries(ReportPeriod $period): array
    {
        $daily = $this->paidIn($period)
            ->selectRaw('DATE(paid_at) as d, SUM(amount) as total, COUNT(*) as n')
            ->groupBy('d')->toBase()->get();

        $totals = array_fill_keys($period->buckets(), ['value' => 0.0, 'count' => 0]);
        foreach ($daily as $row) {
            $key = $period->bucketOf(substr((string) $row->d, 0, 10));
            $totals[$key]['value'] += (float) $row->total;
            $totals[$key]['count'] += (int) $row->n;
        }

        return collect($totals)->map(fn ($t, $key) => ['key' => $key, ...$t])->values()->all();
    }

    /** @return array<int, array{key: string, value: int}> */
    private function ordersSeries(ReportPeriod $period): array
    {
        $daily = $this->ordersIn($period)
            ->selectRaw('DATE(created_at) as d, COUNT(*) as n')
            ->groupBy('d')->toBase()->get();

        $totals = array_fill_keys($period->buckets(), 0);
        foreach ($daily as $row) {
            $totals[$period->bucketOf(substr((string) $row->d, 0, 10))] += (int) $row->n;
        }

        return collect($totals)->map(fn ($n, $key) => ['key' => $key, 'value' => $n])->values()->all();
    }

    /**
     * Per layanan: jumlah pesanan dan pendapatan, diurutkan dari pendapatan terbesar.
     *
     * @return array<int, array{name: string, orders: int, revenue: float}>
     */
    private function byService(ReportPeriod $period): array
    {
        $orders = $this->ordersIn($period)->selectRaw('service_id, COUNT(*) as n')->groupBy('service_id')->toBase()->pluck('n', 'service_id');

        $revenue = $this->paidIn($period)
            ->join('orders', 'orders.id', '=', 'payments.order_id')
            ->selectRaw('orders.service_id as service_id, SUM(payments.amount) as total')
            ->groupBy('orders.service_id')->toBase()->pluck('total', 'service_id');

        $names = Service::query()->whereIn('id', $orders->keys()->merge($revenue->keys())->unique())->pluck('name', 'id');

        $rows = $names->map(fn ($name, $id) => [
            'name' => $name,
            'orders' => (int) ($orders[$id] ?? 0),
            'revenue' => (float) ($revenue[$id] ?? 0),
        ])->sortByDesc(fn ($r) => [$r['revenue'], $r['orders']])->values();

        if ($rows->count() <= self::TOP_SERVICES) {
            return $rows->all();
        }

        $rest = $rows->slice(self::TOP_SERVICES - 1);

        return $rows->take(self::TOP_SERVICES - 1)->push([
            'name' => 'Lainnya',
            'orders' => $rest->sum('orders'),
            'revenue' => (float) $rest->sum('revenue'),
        ])->all();
    }

    /** @return array<int, array{name: string, count: int, revenue: float}> */
    private function byMethod(ReportPeriod $period): array
    {
        return $this->paidIn($period)
            ->selectRaw('method, COUNT(*) as n, SUM(amount) as total')
            ->groupBy('method')->orderByDesc('total')->toBase()->get()
            ->map(fn ($r) => [
                'name' => PaymentMethod::tryFrom($r->method)?->label() ?? $r->method,
                'count' => (int) $r->n,
                'revenue' => (float) $r->total,
            ])->all();
    }

    /** Semua status selalu muncul, walau 0. @return array<int, array{name: string, value: int}> */
    private function byStatus(ReportPeriod $period): array
    {
        $counts = $this->ordersIn($period)->selectRaw('status, COUNT(*) as n')->groupBy('status')->toBase()->pluck('n', 'status');

        return collect(OrderStatus::cases())
            ->map(fn (OrderStatus $s) => ['name' => $s->label(), 'value' => (int) ($counts[$s->value] ?? 0)])
            ->all();
    }

    /** Pesanan yang dibuat pada rentang. @return Builder<Order> */
    public function ordersIn(ReportPeriod $period): Builder
    {
        return Order::query()->whereBetween('orders.created_at', [$period->from, $period->to]);
    }

    /** Pembayaran Lunas yang dibayar pada rentang. @return Builder<Payment> */
    public function paidIn(ReportPeriod $period): Builder
    {
        return Payment::query()
            ->where('payments.status', PaymentStatus::Lunas)
            ->whereBetween('payments.paid_at', [$period->from, $period->to]);
    }
}
