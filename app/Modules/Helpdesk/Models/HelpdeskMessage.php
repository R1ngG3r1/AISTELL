<?php

namespace App\Modules\Helpdesk\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class HelpdeskMessage extends Model
{
    /** Batas waktu mengedit pesan (menit) dan menghapusnya untuk semua orang (jam), seperti WhatsApp. */
    public const EDIT_WINDOW_MINUTES = 15;

    public const DELETE_WINDOW_HOURS = 48;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'from_admin' => 'boolean',
            'edited_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(HelpdeskThread::class, 'thread_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /** Lampiran lengkap (termasuk isi file) - hanya untuk diunduh. */
    public function attachment(): HasOne
    {
        return $this->hasOne(HelpdeskAttachment::class, 'message_id');
    }

    /** Lampiran tanpa isi file, aman dimuat bersama daftar pesan. */
    public function attachmentMeta(): HasOne
    {
        return $this->hasOne(HelpdeskAttachment::class, 'message_id')->select(HelpdeskAttachment::META);
    }

    public function isDeleted(): bool
    {
        return $this->deleted_at !== null;
    }

    public function editableUntil()
    {
        return $this->created_at->copy()->addMinutes(self::EDIT_WINDOW_MINUTES);
    }

    public function deletableUntil()
    {
        return $this->created_at->copy()->addHours(self::DELETE_WINDOW_HOURS);
    }

    public function canEdit(): bool
    {
        return ! $this->isDeleted() && now()->lte($this->editableUntil());
    }

    public function canDelete(): bool
    {
        return ! $this->isDeleted() && now()->lte($this->deletableUntil());
    }

    /** Teks singkat untuk daftar percakapan. */
    public function preview(): string
    {
        if ($this->isDeleted()) {
            return 'Pesan ini telah dihapus';
        }
        if (filled($this->body)) {
            return $this->body;
        }

        return $this->attachmentMeta?->isImage() ? '📷 Foto' : '📎 Dokumen';
    }

    /** Bentuk ringkas yang dikirim ke frontend (pakai attachmentMeta, jangan memuat isi file). */
    public function toChat(): array
    {
        $attachment = $this->isDeleted() ? null : $this->attachmentMeta;

        return [
            'id' => $this->id,
            'body' => $this->isDeleted() ? null : $this->body,
            'from_admin' => $this->from_admin,
            'created_at' => $this->created_at->toIso8601String(),
            'edited' => $this->edited_at !== null && ! $this->isDeleted(),
            'deleted' => $this->isDeleted(),
            'editable_until' => $this->isDeleted() ? null : $this->editableUntil()->toIso8601String(),
            'deletable_until' => $this->isDeleted() ? null : $this->deletableUntil()->toIso8601String(),
            'attachment' => $attachment ? [
                'name' => $attachment->name,
                'mime' => $attachment->mime,
                'size' => $attachment->size,
                'image' => $attachment->isImage(),
                'url' => route('helpdesk.attachments.show', $attachment->id),
            ] : null,
        ];
    }
}
