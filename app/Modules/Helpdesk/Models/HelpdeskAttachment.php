<?php

namespace App\Modules\Helpdesk\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Lampiran pesan helpdesk. Isi file (`data`, base64) hanya dibaca saat diunduh. */
class HelpdeskAttachment extends Model
{
    protected $guarded = ['id'];

    /** Kolom tanpa `data`, dipakai saat memuat daftar pesan. */
    public const META = ['id', 'message_id', 'name', 'mime', 'size'];

    public function message(): BelongsTo
    {
        return $this->belongsTo(HelpdeskMessage::class, 'message_id');
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime, 'image/');
    }
}
