<?php

namespace App\Modules\Helpdesk\Requests;

use App\Modules\Helpdesk\Services\HelpdeskService;
use Illuminate\Foundation\Http\FormRequest;

/** Kirim pesan: teks dan/atau satu lampiran (foto / dokumen kecil). */
class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // akses dijaga middleware role + policy di controller
    }

    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:2000', 'required_without:file'],
            'file' => [
                'nullable', 'file',
                'max:'.HelpdeskService::MAX_ATTACHMENT_KB,
                'extensions:'.implode(',', HelpdeskService::ATTACHMENT_EXTENSIONS),
                // MIME asli dicek dari isi file, bukan dari nama / ekstensinya
                'mimetypes:image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/octet-stream,application/x-ole-storage,application/CDFV2',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'body.required_without' => 'Tulis pesan atau lampirkan file.',
            'body.max' => 'Pesan maksimal 2000 karakter.',
            'file.max' => 'Ukuran lampiran maksimal 2 MB.',
            'file.extensions' => 'Jenis file tidak didukung. Gunakan foto, PDF, TXT, Word, atau Excel.',
            'file.mimetypes' => 'Isi file tidak sesuai dengan jenis yang didukung.',
            'file.uploaded' => 'Lampiran gagal diunggah. Pastikan ukurannya maksimal 2 MB.',
        ];
    }
}
