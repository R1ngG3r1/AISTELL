<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Foto profil: simpan, ganti, dan hapus.
 *
 * Foto dipotong persegi di bagian tengah lalu diperkecil ke 400×400 px
 * (pakai ekstensi GD bawaan PHP), sehingga ukurannya kecil dan tampil rapi
 * di lingkaran avatar. Jika GD tidak tersedia, file asli disimpan apa adanya.
 */
class AvatarService
{
    public const SIZE = 400;

    private const DIRECTORY = 'avatars';

    public function update(User $user, UploadedFile $file): User
    {
        $path = $this->store($file);

        // Simpan path baru dulu, baru hapus file lama → foto tidak pernah "hilang" di tengah proses.
        $old = $user->avatar_path;
        $user->forceFill(['avatar_path' => $path])->save();
        $this->deleteFile($old);

        return $user;
    }

    public function remove(User $user): User
    {
        $this->deleteFile($user->avatar_path);
        $user->forceFill(['avatar_path' => null])->save();

        return $user;
    }

    private function store(UploadedFile $file): string
    {
        $resized = $this->squareResize($file);

        if ($resized === null) {
            return $file->store(self::DIRECTORY, User::AVATAR_DISK);
        }

        [$contents, $extension] = $resized;
        $path = self::DIRECTORY.'/'.Str::random(40).'.'.$extension;
        Storage::disk(User::AVATAR_DISK)->put($path, $contents);

        return $path;
    }

    /**
     * @return array{0: string, 1: string}|null [isi file, ekstensi] atau null jika gagal diproses
     */
    private function squareResize(UploadedFile $file): ?array
    {
        if (! function_exists('imagecreatefromstring')) {
            return null;
        }

        $source = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));
        if ($source === false) {
            return null;
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $side = min($width, $height);

        $target = imagecreatetruecolor(self::SIZE, self::SIZE);
        // Pertahankan transparansi PNG/WebP.
        imagealphablending($target, false);
        imagesavealpha($target, true);
        imagefill($target, 0, 0, imagecolorallocatealpha($target, 0, 0, 0, 127));

        imagecopyresampled(
            $target, $source,
            0, 0,
            (int) (($width - $side) / 2), (int) (($height - $side) / 2),
            self::SIZE, self::SIZE,
            $side, $side,
        );

        ob_start();
        $useWebp = function_exists('imagewebp');
        $useWebp ? imagewebp($target, null, 85) : imagejpeg($target, null, 85);
        $contents = (string) ob_get_clean();

        imagedestroy($source);
        imagedestroy($target);

        return $contents === '' ? null : [$contents, $useWebp ? 'webp' : 'jpg'];
    }

    private function deleteFile(?string $path): void
    {
        if ($path) {
            Storage::disk(User::AVATAR_DISK)->delete($path);
        }
    }
}
