<?php

namespace App\Modules\Notification\Services;

use App\Models\User;
use App\Modules\Notification\Notifications\AppNotification;
use App\Modules\Notification\Notifications\HelpdeskMessageNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;
use Throwable;

class NotificationService
{
    /** Jumlah notifikasi yang ditampilkan di lonceng. */
    private const LIMIT = 20;

    /**
     * Kirim notifikasi. Kegagalan (mis. SMTP mati) hanya dicatat di log supaya
     * tidak menggagalkan aksi utama seperti membuat pesanan atau mengirim chat.
     */
    public function send(User|Collection $to, AppNotification $notification): void
    {
        try {
            Notification::send($to, $notification);
        } catch (Throwable $e) {
            report($e);
        }
    }

    /** @return Collection<int, User> */
    public function admins(): Collection
    {
        return User::query()->where('role', User::ROLE_ADMIN)->get();
    }

    /**
     * Pesan helpdesk beruntun dalam satu percakapan cukup jadi satu notifikasi:
     * yang lama dan belum dibaca diganti oleh yang terbaru.
     */
    public function sendHelpdesk(User|Collection $to, HelpdeskMessageNotification $notification): void
    {
        foreach ($to instanceof User ? [$to] : $to as $user) {
            $user->unreadNotifications()
                ->where('type', HelpdeskMessageNotification::class)
                ->where('data', 'like', '%"thread_id":'.$notification->threadId().'}%')
                ->delete();
        }

        $this->send($to, $notification);
    }

    /** @return array{items: array<int, array<string, mixed>>, unread: int} */
    public function listFor(User $user): array
    {
        return [
            'items' => $user->notifications()->limit(self::LIMIT)->get()->map(fn ($n) => [
                'id' => $n->id,
                'kind' => $n->data['kind'] ?? 'order',
                'title' => $n->data['title'] ?? '',
                'body' => $n->data['body'] ?? '',
                'url' => $n->data['url'] ?? '/',
                'read' => $n->read_at !== null,
                'created_at' => $n->created_at->toIso8601String(),
            ])->all(),
            'unread' => $this->unreadCount($user),
        ];
    }

    public function unreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }
}
