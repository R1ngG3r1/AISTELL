<?php

namespace App\Modules\Helpdesk\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Helpdesk\Models\HelpdeskAttachment;
use App\Modules\Helpdesk\Models\HelpdeskMessage;
use App\Modules\Helpdesk\Services\HelpdeskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Edit / hapus pesan sendiri dan unduh lampiran - dipakai bersama oleh user dan admin. */
class HelpdeskMessageController extends Controller
{
    public function __construct(protected HelpdeskService $helpdesk) {}

    // PATCH /helpdesk/messages/{message}   body: { body: "..." }
    public function update(Request $request, HelpdeskMessage $message): JsonResponse
    {
        $this->authorizeOwn($request, $message);

        $data = $request->validate(
            ['body' => ['nullable', 'string', 'max:2000']],
            ['body.max' => 'Pesan maksimal 2000 karakter.'],
        );

        return response()->json(['message' => $this->helpdesk->edit($message, (string) ($data['body'] ?? ''))->toChat()]);
    }

    // DELETE /helpdesk/messages/{message}
    public function destroy(Request $request, HelpdeskMessage $message): JsonResponse
    {
        $this->authorizeOwn($request, $message);

        return response()->json(['message' => $this->helpdesk->delete($message)->toChat()]);
    }

    // GET /helpdesk/attachments/{attachment}
    public function attachment(Request $request, HelpdeskAttachment $attachment): Response
    {
        $user = $request->user();
        $thread = $attachment->message->thread;
        abort_unless($user->isAdmin() || $thread->user_id === $user->id, 403);

        // Foto tampil langsung; jenis lain selalu diunduh agar tidak pernah dieksekusi browser.
        $disposition = $attachment->isImage() ? 'inline' : 'attachment';

        return response(base64_decode($attachment->data), 200, [
            'Content-Type' => $attachment->isImage() ? $attachment->mime : 'application/octet-stream',
            'Content-Disposition' => $disposition.'; filename="'.addcslashes($attachment->name, '"\\').'"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    /** Hanya pengirimnya sendiri yang boleh mengedit / menghapus pesan. */
    private function authorizeOwn(Request $request, HelpdeskMessage $message): void
    {
        abort_unless($message->sender_id === $request->user()->id, 403, 'Anda hanya bisa mengubah pesan Anda sendiri.');
    }
}
