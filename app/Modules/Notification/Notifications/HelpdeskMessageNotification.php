<?php

namespace App\Modules\Notification\Notifications;

use App\Modules\Helpdesk\Models\HelpdeskMessage;
use Illuminate\Support\Str;

/** Pesan helpdesk baru: balasan admin untuk user, atau pesan user untuk admin. */
class HelpdeskMessageNotification extends AppNotification
{
    protected string $kind = 'helpdesk';

    public function __construct(private HelpdeskMessage $message, private bool $forAdmin) {}

    public function threadId(): int
    {
        return $this->message->thread_id;
    }

    public function title(): string
    {
        return $this->forAdmin ? "Pesan baru dari {$this->message->thread->user->name}" : 'Balasan dari admin';
    }

    public function body(): string
    {
        return Str::limit($this->message->preview(), 120);
    }

    public function url(): string
    {
        return $this->forAdmin
            ? route('admin.helpdesk.index', ['thread' => $this->message->thread_id], false)
            : route('helpdesk.index', [], false);
    }

    public function toArray(object $notifiable): array
    {
        return [...parent::toArray($notifiable), 'thread_id' => $this->message->thread_id];
    }
}
