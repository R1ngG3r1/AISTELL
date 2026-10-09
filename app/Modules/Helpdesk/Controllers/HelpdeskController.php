<?php

namespace App\Modules\Helpdesk\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Helpdesk\Requests\SendMessageRequest;
use App\Modules\Helpdesk\Services\HelpdeskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Helpdesk sisi user: satu percakapan dengan admin. */
class HelpdeskController extends Controller
{
    public function __construct(protected HelpdeskService $helpdesk) {}

    // GET /helpdesk
    public function index(Request $request): Response
    {
        $thread = $this->helpdesk->threadFor($request->user());
        $messages = $this->helpdesk->messages($thread);
        $this->helpdesk->markRead($thread, false);

        return Inertia::render('Helpdesk/Index', [
            'messages' => $messages,
            'synced_at' => now()->toIso8601String(),
        ]);
    }

    // GET /helpdesk/messages?after=ID&since=ISO  → JSON, dipanggil berkala oleh halaman chat
    public function messages(Request $request): JsonResponse
    {
        $thread = $this->helpdesk->threadFor($request->user());
        $payload = $this->helpdesk->poll($thread, (int) $request->query('after', 0), $request->query('since'));
        $this->helpdesk->markRead($thread, false);

        return response()->json($payload);
    }

    // POST /helpdesk/messages   body: { body?: "...", file?: File }
    public function store(SendMessageRequest $request): JsonResponse
    {
        $message = $this->helpdesk->send(
            $this->helpdesk->threadFor($request->user()),
            $request->user(),
            $request->input('body'),
            $request->file('file'),
        );

        return response()->json(['message' => $message->toChat()], 201);
    }
}
