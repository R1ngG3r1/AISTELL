<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Dasar semua notifikasi AISTEL. Setiap notifikasi selalu masuk ke lonceng di aplikasi
 * (channel database); yang menandai $mail = true juga dikirim lewat email.
 * Tidak memakai queue karena hosting tidak menjalankan worker (lihat docs/DEPLOY.md).
 */
abstract class AppNotification extends Notification
{
    /** Jenis notifikasi, dipakai FE untuk memilih ikon: order | payment | helpdesk. */
    protected string $kind = 'order';

    /** Kirim juga lewat email. */
    protected bool $mail = false;

    abstract public function title(): string;

    abstract public function body(): string;

    /** Tujuan saat notifikasi diklik (path relatif, mis. /orders/5). */
    abstract public function url(): string;

    public function via(object $notifiable): array
    {
        return $this->mail ? ['database', 'mail'] : ['database'];
    }

    /** @return array{kind: string, title: string, body: string, url: string} */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => $this->kind,
            'title' => $this->title(),
            'body' => $this->body(),
            'url' => $this->url(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title().' — AISTEL')
            ->greeting("Halo, {$notifiable->name}!")
            ->line($this->body())
            ->action('Lihat Detail', url($this->url()))
            ->salutation('Salam, Tim AISTEL');
    }
}
