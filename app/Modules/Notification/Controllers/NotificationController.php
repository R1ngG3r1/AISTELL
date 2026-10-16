<?php

namespace App\Modules\Notification\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Endpoint JSON untuk lonceng notifikasi (dipanggil dari AuthenticatedLayout). */
class NotificationController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    // GET /notifications
    public function index(Request $request): JsonResponse
    {
        return response()->json($this->notifications->listFor($request->user()));
    }

    // POST /notifications/{id}/read — hanya milik user yang login (404 jika bukan miliknya)
    public function read(Request $request, string $id): JsonResponse
    {
        $request->user()->notifications()->findOrFail($id)->markAsRead();

        return response()->json(['unread' => $this->notifications->unreadCount($request->user())]);
    }

    // POST /notifications/read-all
    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['unread' => 0]);
    }
}
