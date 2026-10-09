<?php

namespace App\Modules\Helpdesk\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Helpdesk\Models\HelpdeskThread;
use App\Modules\Helpdesk\Requests\SendMessageRequest;
use App\Modules\Helpdesk\Services\HelpdeskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Helpdesk sisi admin: daftar percakapan semua user dan balasan. */
class AdminHelpdeskController extends Controller
{
    public function __construct(protected HelpdeskService $helpdesk) {}

    // GET /admin/helpdesk?thread=ID
    public function index(Request $request): Response
    {
        $selected = $request->filled('thread')
            ? HelpdeskThread::query()->with('user:id,name,email,avatar_path')->find($request->integer('thread'))
            : null;

        if ($selected) {
            $this->helpdesk->markRead($selected, true);
        }

        return Inertia::render('Admin/Helpdesk/Index', [
            // fn() → ikut diperbarui saat polling daftar percakapan
            'threads' => fn () => $this->helpdesk->adminThreads(),
            'selected' => $selected ? [
                'id' => $selected->id,
                'user' => $selected->user->only(['id', 'name', 'email', 'avatar_url']),
            ] : null,
            'messages' => $selected ? $this->helpdesk->messages($selected) : [],
            'synced_at' => now()->toIso8601String(),
        ]);
    }

    // GET /admin/helpdesk/{thread}/messages?after=ID&since=ISO
    public function messages(Request $request, HelpdeskThread $thread): JsonResponse
    {
        $payload = $this->helpdesk->poll($thread, (int) $request->query('after', 0), $request->query('since'));
        $this->helpdesk->markRead($thread, true);

        return response()->json($payload);
    }

    // POST /admin/helpdesk/{thread}/messages
    public function store(SendMessageRequest $request, HelpdeskThread $thread): JsonResponse
    {
        $message = $this->helpdesk->send($thread, $request->user(), $request->input('body'), $request->file('file'));

        return response()->json(['message' => $message->toChat()], 201);
    }
}
