<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'lowercase', app()->environment('testing') ? 'email:rfc' : 'email:rfc,dns', 'max:255', 'unique:'.User::class],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s]{8,20}$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Checkbox "Saya menyetujui Syarat dan Ketentuan" juga dicek di backend,
            // bukan hanya dinonaktifkannya tombol di frontend.
            'terms' => ['accepted'],
        ], [
            'terms.accepted' => 'Anda harus menyetujui Syarat dan Ketentuan serta Kebijakan Privasi AISTEL.',
            'email.email' => 'Alamat email tidak valid atau domain emailnya tidak ditemukan.',
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, + atau - (8–20 karakter).',
        ]);

        // Role tidak diisi di sini → otomatis 'user' (default kolom).
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Email verifikasi sudah dikirim oleh event Registered di atas.
        return redirect(route('verification.notice', absolute: false));
    }
}
