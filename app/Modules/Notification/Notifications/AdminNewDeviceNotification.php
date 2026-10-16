<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Support\Carbon;

/** Untuk admin: akunnya baru masuk dari browser/perangkat yang belum dikenal. */
class AdminNewDeviceNotification extends AppNotification
{
    protected string $kind = 'security';

    protected bool $mail = true;

    public function __construct(private string $device, private string $ip, private Carbon $at) {}

    public function title(): string
    {
        return 'Login baru ke akun admin';
    }

    public function body(): string
    {
        return "Akun Anda masuk dari {$this->device} (IP {$this->ip}) pada {$this->at->translatedFormat('j M Y, H:i')} WIB. "
            .'Jika ini bukan Anda, segera ganti password.';
    }

    public function url(): string
    {
        return route('profile.edit', [], false);
    }

    protected function actionText(): string
    {
        return 'Ganti Password';
    }
}
