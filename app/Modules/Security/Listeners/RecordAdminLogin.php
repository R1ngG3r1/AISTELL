<?php

namespace App\Modules\Security\Listeners;

use App\Modules\Notification\Notifications\AdminNewDeviceNotification;
use App\Modules\Notification\Services\NotificationService;
use App\Modules\Security\Models\AdminDevice;
use App\Modules\Security\Support\DeviceLabel;
use Illuminate\Auth\Events\Login;

/**
 * Setiap admin masuk, perangkatnya dicatat. Perangkat baru (selain yang pertama kali)
 * memicu email + notifikasi supaya pemilik akun tahu bila ada yang memakai passwordnya.
 */
class RecordAdminLogin
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(Login $event): void
    {
        $user = $event->user;

        if (! method_exists($user, 'isAdmin') || ! $user->isAdmin() || ! app()->bound('request')) {
            return;
        }

        $request = request();
        $agent = $request->userAgent();
        $fingerprint = DeviceLabel::fingerprint($agent);

        $device = AdminDevice::query()->where('user_id', $user->id)->where('fingerprint', $fingerprint)->first();

        if ($device) {
            $device->update(['last_seen_at' => now(), 'last_ip' => $request->ip()]);

            return;
        }

        $hadDevices = AdminDevice::query()->where('user_id', $user->id)->exists();
        $label = DeviceLabel::from($agent);

        AdminDevice::create([
            'user_id' => $user->id,
            'fingerprint' => $fingerprint,
            'label' => $label,
            'last_ip' => $request->ip(),
            'last_seen_at' => now(),
        ]);

        // Perangkat pertama adalah login awal, bukan sesuatu yang mencurigakan.
        if ($hadDevices && config('security.notify_new_admin_device')) {
            $this->notifications->send($user, new AdminNewDeviceNotification($label, (string) $request->ip(), now()));
        }
    }
}
