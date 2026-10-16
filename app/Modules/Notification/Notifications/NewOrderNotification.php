<?php

namespace App\Modules\Notification\Notifications;

use App\Modules\Order\Models\Order;

/** Untuk admin: ada pesanan baru yang menunggu konfirmasi. */
class NewOrderNotification extends AppNotification
{
    public function __construct(private Order $order) {}

    public function title(): string
    {
        return 'Pesanan baru';
    }

    public function body(): string
    {
        $o = $this->order;

        return "{$o->contact_name} memesan {$o->service?->name} untuk {$o->date->translatedFormat('j M Y')}.";
    }

    public function url(): string
    {
        return route('admin.orders.show', $this->order, false);
    }
}
