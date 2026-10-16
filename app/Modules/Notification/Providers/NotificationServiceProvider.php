<?php

namespace App\Modules\Notification\Providers;

use App\Modules\Helpdesk\Models\HelpdeskMessage;
use App\Modules\Notification\Notifications\HelpdeskMessageNotification;
use App\Modules\Notification\Notifications\NewOrderNotification;
use App\Modules\Notification\Notifications\NewReviewNotification;
use App\Modules\Notification\Notifications\OrderStatusNotification;
use App\Modules\Notification\Notifications\PaymentPaidNotification;
use App\Modules\Notification\Services\NotificationService;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Review\Models\Review;
use Illuminate\Support\ServiceProvider;

/**
 * Otomatis didaftarkan oleh ModuleServiceProvider. Notifikasi dipicu dari event model,
 * seperti PaymentServiceProvider, sehingga OrderService/HelpdeskService tidak perlu diubah.
 */
class NotificationServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $notifications = fn () => app(NotificationService::class);

        // Pesanan baru → semua admin.
        Order::created(function (Order $order) use ($notifications) {
            $order->loadMissing('service');
            $notifications()->send($notifications()->admins(), new NewOrderNotification($order));
        });

        // Status berubah → user pemilik. Kalau pemilik sendiri yang membatalkan,
        // adminlah yang diberi tahu.
        Order::updated(function (Order $order) use ($notifications) {
            if (! $order->wasChanged('status')) {
                return;
            }

            $order->loadMissing('service', 'user');

            if (auth()->id() === $order->user_id) {
                $notifications()->send($notifications()->admins(), new OrderStatusNotification($order, forAdmin: true));
            } else {
                $notifications()->send($order->user, new OrderStatusNotification($order));
            }
        });

        // Pembayaran lunas → user. Tunai tidak ikut: lunasnya hanya efek pesanan selesai.
        Payment::updated(function (Payment $payment) use ($notifications) {
            if ($payment->wasChanged('status') && $payment->status === PaymentStatus::Lunas && $payment->method !== PaymentMethod::Cod) {
                $notifications()->send($payment->order->user, new PaymentPaidNotification($payment));
            }
        });

        // Ulasan baru → semua admin.
        Review::created(function (Review $review) use ($notifications) {
            $review->loadMissing('user', 'service');
            $notifications()->send($notifications()->admins(), new NewReviewNotification($review));
        });

        // Chat helpdesk → lawan bicara.
        HelpdeskMessage::created(function (HelpdeskMessage $message) use ($notifications) {
            $message->loadMissing('thread.user');

            if ($message->from_admin) {
                $notifications()->sendHelpdesk($message->thread->user, new HelpdeskMessageNotification($message, forAdmin: false));
            } else {
                $notifications()->sendHelpdesk($notifications()->admins(), new HelpdeskMessageNotification($message, forAdmin: true));
            }
        });
    }
}
