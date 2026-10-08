<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ];
    }

    public function attributes(): array
    {
        return [
            'email' => 'username atau email',
        ];
    }

    /** Batas percobaan login gagal sebelum dikunci sementara. */
    public const MAX_ATTEMPTS = 5;

    /**
     * Attempt to authenticate the request's credentials.
     *
     * Penyebab gagal dibedakan, dan setiap kunci error dipakai FE untuk aksi lanjutan:
     *   account  → akun belum terdaftar      (tombol "Buat akun")
     *   password → akun ada, password salah  (tautan "Lupa password?")
     *   login    → terlalu banyak percobaan  (banner hitung mundur)
     *   email    → nama dipakai >1 akun / kolom kosong
     *
     * Percobaan gagal untuk akun yang tidak terdaftar tetap dihitung oleh rate limiter,
     * sehingga pengecekan "email mana yang terdaftar" tidak bisa dilakukan beruntun.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Field "email" di form login menerima email ATAU username (nama akun).
        $email = $this->resolveEmail(trim($this->string('email')->toString()));

        // 1) Cek akun terlebih dahulu.
        if ($email === null || ! User::query()->where('email', $email)->exists()) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'account' => trans('auth.not_registered'),
            ]);
        }

        // 2) Akun ada → cek password.
        $credentials = ['email' => $email, 'password' => $this->string('password')->toString()];

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());
            $left = RateLimiter::remaining($this->throttleKey(), self::MAX_ATTEMPTS);

            // Peringatan hanya muncul saat percobaan hampir habis.
            $message = trans('auth.password');
            if ($left > 0 && $left <= 2) {
                $message .= ' '.trans('auth.attempts_left', ['count' => $left]);
            }

            throw ValidationException::withMessages(['password' => $message]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ubah input login menjadi email akun.
     *
     * Kolom `name` tidak unik, jadi login memakai nama hanya diizinkan jika
     * tepat satu akun memiliki nama tersebut. Tanpa aturan ini, dua akun
     * bernama "Budi" bisa saling tertukar (yang dicoba hanya akun pertama).
     *
     * @throws ValidationException jika nama dipakai lebih dari satu akun
     */
    private function resolveEmail(string $login): ?string
    {
        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            return Str::lower($login);
        }

        $emails = User::query()->where('name', $login)->limit(2)->pluck('email');

        if ($emails->count() > 1) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.ambiguous'),
            ]);
        }

        return $emails->first();
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), self::MAX_ATTEMPTS)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
