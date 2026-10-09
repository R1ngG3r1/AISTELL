<?php

namespace App\Modules\Helpdesk\Services;

use App\Models\User;
use App\Modules\Helpdesk\Models\HelpdeskMessage;
use App\Modules\Helpdesk\Models\HelpdeskThread;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HelpdeskService
{
    /** Jumlah pesan terakhir yang dimuat saat halaman dibuka. */
    private const INITIAL_LIMIT = 100;

    /** Ukuran maksimal lampiran (KB). Disimpan di database, jadi sengaja kecil. */
    public const MAX_ATTACHMENT_KB = 2048;

    /** Tipe lampiran yang diizinkan (ekstensi). Isi file dicek ulang lewat MIME asli. */
    public const ATTACHMENT_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx'];

    /** Percakapan milik user (dibuat saat pertama kali dibuka). */
    public function threadFor(User $user): HelpdeskThread
    {
        return HelpdeskThread::query()->firstOrCreate(['user_id' => $user->id]);
    }

    /**
     * Pesan terakhir saat halaman dibuka.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function messages(HelpdeskThread $thread): Collection
    {
        return $thread->messages()->with('attachmentMeta')
            ->orderByDesc('id')->limit(self::INITIAL_LIMIT)->get()
            ->reverse()->values()->map->toChat();
    }

    /**
     * Data untuk polling: pesan baru (id > $afterId) + pesan lama yang berubah (diedit / dihapus)
     * sejak $since. `synced_at` dipakai klien sebagai $since pada polling berikutnya.
     *
     * @return array{messages: Collection, updated: Collection, synced_at: string}
     */
    public function poll(HelpdeskThread $thread, int $afterId, ?string $since): array
    {
        $new = $thread->messages()->with('attachmentMeta')->where('id', '>', $afterId)->orderBy('id')->get();

        $updated = collect();
        if ($since && ($sinceAt = rescue(fn () => Carbon::parse($since), null, false))) {
            // Mundur 2 detik: updated_at hanya presisi detik, dan penggabungan di klien aman diulang.
            $updated = $thread->messages()->with('attachmentMeta')
                ->where('id', '<=', $afterId)
                ->where('updated_at', '>=', $sinceAt->copy()->subSeconds(2))
                ->orderBy('id')->get();
        }

        return [
            'messages' => $new->map->toChat(),
            'updated' => $updated->map->toChat(),
            'synced_at' => now()->toIso8601String(),
        ];
    }

    public function send(HelpdeskThread $thread, User $sender, ?string $body, ?UploadedFile $file = null): HelpdeskMessage
    {
        $body = filled($body) ? trim($body) : null;

        return DB::transaction(function () use ($thread, $sender, $body, $file) {
            $message = $thread->messages()->create([
                'sender_id' => $sender->id,
                'from_admin' => $sender->isAdmin(),
                'body' => $body,
            ]);

            if ($file) {
                $message->attachment()->create([
                    'name' => mb_substr($file->getClientOriginalName(), 0, 255),
                    'mime' => $file->getMimeType() ?: 'application/octet-stream',
                    'size' => $file->getSize(),
                    'data' => base64_encode($file->get()),
                ]);
            }

            $thread->forceFill(['last_message_at' => $message->created_at])->save();
            // Pengirim jelas sudah membaca percakapan sampai pesannya sendiri.
            $this->markRead($thread, $sender->isAdmin());

            return $message->load('attachmentMeta');
        });
    }

    /**
     * Edit teks pesan sendiri (maks. 15 menit setelah dikirim).
     *
     * @throws ValidationException
     */
    public function edit(HelpdeskMessage $message, string $body): HelpdeskMessage
    {
        if (! $message->canEdit()) {
            throw ValidationException::withMessages(['body' => 'Pesan hanya bisa diedit '.HelpdeskMessage::EDIT_WINDOW_MINUTES.' menit setelah dikirim.']);
        }

        $body = trim($body);
        if ($body === '' && ! $message->attachmentMeta) {
            throw ValidationException::withMessages(['body' => 'Pesan tidak boleh kosong.']);
        }

        if ($body !== (string) $message->body) {
            $message->forceFill(['body' => $body === '' ? null : $body, 'edited_at' => now()])->save();
        }

        return $message->load('attachmentMeta');
    }

    /**
     * Hapus pesan untuk semua orang: baris tetap ada sebagai "Pesan ini telah dihapus",
     * isi teks dan lampiran dibuang.
     *
     * @throws ValidationException
     */
    public function delete(HelpdeskMessage $message): HelpdeskMessage
    {
        if (! $message->canDelete()) {
            throw ValidationException::withMessages(['message' => 'Pesan ini sudah terlalu lama untuk dihapus.']);
        }

        DB::transaction(function () use ($message) {
            $message->attachment()->delete();
            $message->forceFill(['body' => null, 'deleted_at' => now()])->save();
        });

        return $message->refresh()->load('attachmentMeta');
    }

    /** Tandai semua pesan dari lawan bicara sebagai sudah dibaca. */
    public function markRead(HelpdeskThread $thread, bool $asAdmin): void
    {
        $latest = (int) $thread->messages()->max('id');
        $column = $asAdmin ? 'admin_read_message_id' : 'user_read_message_id';

        if ($latest > $thread->{$column}) {
            $thread->forceFill([$column => $latest])->save();
        }
    }

    /** Daftar percakapan untuk admin: terbaru di atas, lengkap dengan pesan terakhir & jumlah belum dibaca. */
    public function adminThreads(): array
    {
        return HelpdeskThread::query()
            ->whereNotNull('last_message_at')
            ->with(['user:id,name,email,avatar_path', 'latestMessage.attachmentMeta'])
            ->withCount(['messages as unread_count' => fn ($q) => $q
                ->where('from_admin', false)
                ->whereNull('deleted_at')
                ->whereColumn('helpdesk_messages.id', '>', 'helpdesk_threads.admin_read_message_id')])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn (HelpdeskThread $t) => [
                'id' => $t->id,
                'user' => $t->user->only(['id', 'name', 'email', 'avatar_url']),
                'last_message' => $t->latestMessage ? [
                    'body' => $t->latestMessage->preview(),
                    'from_admin' => $t->latestMessage->from_admin,
                    'created_at' => $t->latestMessage->created_at->toIso8601String(),
                ] : null,
                'unread_count' => (int) $t->unread_count,
            ])
            ->all();
    }

    /** Jumlah pesan belum dibaca untuk badge sidebar. */
    public function unreadCount(User $user): int
    {
        if ($user->isAdmin()) {
            return (int) HelpdeskMessage::query()
                ->where('from_admin', false)
                ->whereNull('deleted_at')
                ->whereHas('thread', fn ($q) => $q->whereColumn('helpdesk_messages.id', '>', 'helpdesk_threads.admin_read_message_id'))
                ->count();
        }

        $thread = HelpdeskThread::query()->where('user_id', $user->id)->first();

        return $thread
            ? $thread->messages()->where('from_admin', true)->whereNull('deleted_at')->where('id', '>', $thread->user_read_message_id)->count()
            : 0;
    }
}
