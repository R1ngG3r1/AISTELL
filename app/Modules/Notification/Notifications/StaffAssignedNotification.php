<?php

namespace App\Modules\Notification\Notifications;

use App\Modules\Order\Models\Order;

/** Untuk user: petugas sudah ditugaskan pada pesanannya. */
class StaffAssignedNotification extends AppNotification
{
    public function __construct(private Order $order) {}

    public function title(): string
    {
        return 'Petugas ditugaskan';
    }

    public function body(): string
    {
        $o = $this->order;
        // Tim: nama yang dicantumkan adalah penanggung jawab, anggota lain tidak dicatat.
        $who = $o->staff->isTeam() ? "Tim {$o->staff->name} (penanggung jawab)" : $o->staff->name;

        return "{$who} akan mengerjakan {$o->service?->name} pada {$o->date->translatedFormat('j M Y')}, pukul ".substr($o->time, 0, 5).'.';
    }

    public function url(): string
    {
        return route('orders.show', $this->order, false);
    }
}
