<?php

namespace App\Modules\Notification\Notifications;

use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;

/**
 * Status pesanan berubah. Ke user (diproses/selesai/ditolak/dibatalkan admin) lewat
 * app + email; ke admin (user membatalkan pesanannya) hanya di aplikasi.
 */
class OrderStatusNotification extends AppNotification
{
    public function __construct(private Order $order, private bool $forAdmin = false)
    {
        $this->mail = ! $forAdmin;
    }

    public function title(): string
    {
        if ($this->forAdmin) {
            return 'Pesanan dibatalkan pelanggan';
        }

        return match ($this->order->status) {
            OrderStatus::Diproses => 'Pesanan diterima',
            OrderStatus::Selesai => 'Pesanan selesai',
            OrderStatus::Ditolak => 'Pesanan ditolak',
            default => 'Pesanan dibatalkan',
        };
    }

    public function body(): string
    {
        $o = $this->order;
        $service = $o->service?->name ?? 'Layanan';
        $date = $o->date->translatedFormat('j M Y');

        if ($this->forAdmin) {
            return "{$o->contact_name} membatalkan pesanan {$service} ({$date}).";
        }

        return match ($o->status) {
            OrderStatus::Diproses => "Pesanan {$service} untuk {$date} sedang diproses.",
            OrderStatus::Selesai => "Pesanan {$service} telah selesai. Terima kasih sudah memakai AISTEL!",
            OrderStatus::Ditolak => "Maaf, pesanan {$service} untuk {$date} ditolak.",
            default => "Pesanan {$service} untuk {$date} dibatalkan.",
        };
    }

    public function url(): string
    {
        return route($this->forAdmin ? 'admin.orders.show' : 'orders.show', $this->order, false);
    }
}
