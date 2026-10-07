<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AvatarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Foto profil di halaman Profil Saya.
 *
 * File disimpan di storage private (bukan public/storage), lalu disajikan lewat
 * route avatars.show. Jadi tidak perlu `php artisan storage:link` dan foto hanya
 * bisa dilihat oleh akun yang sudah login.
 */
class ProfileAvatarController extends Controller
{
    public function __construct(
        protected AvatarService $avatars
    ) {}

    // GET /avatars/{user}?v=...
    public function show(User $user): StreamedResponse
    {
        $disk = Storage::disk(User::AVATAR_DISK);
        abort_unless($user->avatar_path && $disk->exists($user->avatar_path), 404);

        // URL selalu berubah saat foto diganti (?v=), jadi aman di-cache lama oleh browser.
        return $disk->response($user->avatar_path, headers: [
            'Cache-Control' => 'private, max-age=31536000, immutable',
        ]);
    }

    // POST /profile/avatar   (multipart: avatar)
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ], [
            'avatar.required' => 'Pilih foto terlebih dahulu.',
            'avatar.image' => 'File harus berupa gambar.',
            'avatar.mimes' => 'Format foto harus JPG, PNG, atau WebP.',
            'avatar.max' => 'Ukuran foto maksimal 2 MB.',
            'avatar.uploaded' => 'Foto gagal diunggah. Pastikan ukurannya tidak lebih dari 2 MB.',
        ]);

        $this->avatars->update($request->user(), $request->file('avatar'));

        return back()->with('success', 'Foto profil berhasil diperbarui.');
    }

    // DELETE /profile/avatar
    public function destroy(Request $request): RedirectResponse
    {
        $this->avatars->remove($request->user());

        return back()->with('success', 'Foto profil dihapus.');
    }
}
