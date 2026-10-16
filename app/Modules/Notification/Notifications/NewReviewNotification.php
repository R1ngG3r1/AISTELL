<?php

namespace App\Modules\Notification\Notifications;

use App\Modules\Review\Models\Review;
use Illuminate\Support\Str;

/** Untuk admin: ada ulasan baru dari pelanggan. */
class NewReviewNotification extends AppNotification
{
    public function __construct(private Review $review) {}

    public function title(): string
    {
        return "Ulasan baru: {$this->review->rating}/5";
    }

    public function body(): string
    {
        $name = $this->review->user->name;
        $service = $this->review->service->name;
        $comment = filled($this->review->comment) ? ' - "'.Str::limit($this->review->comment, 80).'"' : '';

        return "{$name} menilai {$service}{$comment}";
    }

    public function url(): string
    {
        return route('admin.orders.show', $this->review->order_id, false);
    }
}
