<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pesan validasi (Bahasa Indonesia)
    |--------------------------------------------------------------------------
    |
    | Dipakai otomatis karena APP_LOCALE=id. Nama field yang tampil (:attribute)
    | bisa diganti per FormRequest lewat method attributes(), atau secara global
    | di bagian 'attributes' paling bawah file ini.
    |
    */

    'accepted' => ':Attribute harus disetujui.',
    'accepted_if' => ':Attribute harus disetujui jika :other bernilai :value.',
    'active_url' => ':Attribute bukan URL yang valid.',
    'after' => ':Attribute harus tanggal setelah :date.',
    'after_or_equal' => ':Attribute harus tanggal setelah atau sama dengan :date.',
    'alpha' => ':Attribute hanya boleh berisi huruf.',
    'alpha_dash' => ':Attribute hanya boleh berisi huruf, angka, strip, dan garis bawah.',
    'alpha_num' => ':Attribute hanya boleh berisi huruf dan angka.',
    'array' => ':Attribute harus berupa daftar.',
    'ascii' => ':Attribute hanya boleh berisi karakter alfanumerik.',
    'before' => ':Attribute harus tanggal sebelum :date.',
    'before_or_equal' => ':Attribute harus tanggal sebelum atau sama dengan :date.',
    'between' => [
        'array' => ':Attribute harus memiliki :min sampai :max item.',
        'file' => ':Attribute harus berukuran :min sampai :max kilobyte.',
        'numeric' => ':Attribute harus bernilai :min sampai :max.',
        'string' => ':Attribute harus berisi :min sampai :max karakter.',
    ],
    'boolean' => ':Attribute harus bernilai benar atau salah.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'current_password' => 'Password saat ini salah.',
    'date' => ':Attribute bukan tanggal yang valid.',
    'date_equals' => ':Attribute harus tanggal yang sama dengan :date.',
    'date_format' => ':Attribute tidak sesuai format :format.',
    'decimal' => ':Attribute harus memiliki :decimal angka desimal.',
    'declined' => ':Attribute harus ditolak.',
    'different' => ':Attribute dan :other harus berbeda.',
    'digits' => ':Attribute harus terdiri dari :digits angka.',
    'digits_between' => ':Attribute harus terdiri dari :min sampai :max angka.',
    'distinct' => ':Attribute memiliki nilai yang duplikat.',
    'doesnt_end_with' => ':Attribute tidak boleh diakhiri dengan: :values.',
    'doesnt_start_with' => ':Attribute tidak boleh diawali dengan: :values.',
    'email' => ':Attribute harus berupa alamat email yang valid.',
    'ends_with' => ':Attribute harus diakhiri dengan: :values.',
    'enum' => ':Attribute yang dipilih tidak valid.',
    'exists' => ':Attribute yang dipilih tidak ditemukan.',
    'file' => ':Attribute harus berupa file.',
    'filled' => ':Attribute wajib diisi.',
    'gt' => [
        'array' => ':Attribute harus memiliki lebih dari :value item.',
        'file' => ':Attribute harus lebih besar dari :value kilobyte.',
        'numeric' => ':Attribute harus lebih besar dari :value.',
        'string' => ':Attribute harus lebih dari :value karakter.',
    ],
    'gte' => [
        'array' => ':Attribute harus memiliki :value item atau lebih.',
        'file' => ':Attribute harus lebih besar atau sama dengan :value kilobyte.',
        'numeric' => ':Attribute harus lebih besar atau sama dengan :value.',
        'string' => ':Attribute harus berisi :value karakter atau lebih.',
    ],
    'image' => ':Attribute harus berupa gambar.',
    'in' => ':Attribute yang dipilih tidak valid.',
    'integer' => ':Attribute harus berupa bilangan bulat.',
    'ip' => ':Attribute harus berupa alamat IP yang valid.',
    'json' => ':Attribute harus berupa JSON yang valid.',
    'lowercase' => ':Attribute harus menggunakan huruf kecil.',
    'lt' => [
        'array' => ':Attribute harus memiliki kurang dari :value item.',
        'file' => ':Attribute harus lebih kecil dari :value kilobyte.',
        'numeric' => ':Attribute harus lebih kecil dari :value.',
        'string' => ':Attribute harus kurang dari :value karakter.',
    ],
    'lte' => [
        'array' => ':Attribute tidak boleh memiliki lebih dari :value item.',
        'file' => ':Attribute harus lebih kecil atau sama dengan :value kilobyte.',
        'numeric' => ':Attribute harus lebih kecil atau sama dengan :value.',
        'string' => ':Attribute harus berisi :value karakter atau kurang.',
    ],
    'max' => [
        'array' => ':Attribute tidak boleh memiliki lebih dari :max item.',
        'file' => ':Attribute tidak boleh lebih besar dari :max kilobyte.',
        'numeric' => ':Attribute tidak boleh lebih besar dari :max.',
        'string' => ':Attribute tidak boleh lebih dari :max karakter.',
    ],
    'max_digits' => ':Attribute tidak boleh lebih dari :max angka.',
    'mimes' => ':Attribute harus berupa file bertipe: :values.',
    'mimetypes' => ':Attribute harus berupa file bertipe: :values.',
    'min' => [
        'array' => ':Attribute harus memiliki minimal :min item.',
        'file' => ':Attribute minimal berukuran :min kilobyte.',
        'numeric' => ':Attribute minimal bernilai :min.',
        'string' => ':Attribute minimal berisi :min karakter.',
    ],
    'min_digits' => ':Attribute minimal terdiri dari :min angka.',
    'missing' => ':Attribute tidak boleh ada.',
    'multiple_of' => ':Attribute harus kelipatan dari :value.',
    'not_in' => ':Attribute yang dipilih tidak valid.',
    'not_regex' => 'Format :attribute tidak valid.',
    'numeric' => ':Attribute harus berupa angka.',
    'password' => [
        'letters' => ':Attribute harus mengandung minimal satu huruf.',
        'mixed' => ':Attribute harus mengandung minimal satu huruf besar dan satu huruf kecil.',
        'numbers' => ':Attribute harus mengandung minimal satu angka.',
        'symbols' => ':Attribute harus mengandung minimal satu simbol.',
        'uncompromised' => ':Attribute ini pernah bocor di internet. Silakan gunakan :attribute lain.',
    ],
    'present' => ':Attribute wajib ada.',
    'prohibited' => ':Attribute tidak diizinkan.',
    'regex' => 'Format :attribute tidak valid.',
    'required' => ':Attribute wajib diisi.',
    'required_if' => ':Attribute wajib diisi jika :other bernilai :value.',
    'required_unless' => ':Attribute wajib diisi kecuali :other bernilai :values.',
    'required_with' => ':Attribute wajib diisi jika :values diisi.',
    'required_with_all' => ':Attribute wajib diisi jika :values diisi.',
    'required_without' => ':Attribute wajib diisi jika :values tidak diisi.',
    'required_without_all' => ':Attribute wajib diisi jika :values tidak diisi.',
    'same' => ':Attribute dan :other harus sama.',
    'size' => [
        'array' => ':Attribute harus berisi :size item.',
        'file' => ':Attribute harus berukuran :size kilobyte.',
        'numeric' => ':Attribute harus bernilai :size.',
        'string' => ':Attribute harus berisi :size karakter.',
    ],
    'starts_with' => ':Attribute harus diawali dengan: :values.',
    'string' => ':Attribute harus berupa teks.',
    'timezone' => ':Attribute harus berupa zona waktu yang valid.',
    'unique' => ':Attribute sudah digunakan.',
    'uploaded' => ':Attribute gagal diunggah.',
    'uppercase' => ':Attribute harus menggunakan huruf besar.',
    'url' => ':Attribute harus berupa URL yang valid.',
    'ulid' => ':Attribute harus berupa ULID yang valid.',
    'uuid' => ':Attribute harus berupa UUID yang valid.',

    'custom' => [],

    /*
    | Nama field yang tampil di pesan error, mis. "Password wajib diisi."
    */
    'attributes' => [
        'name' => 'nama',
        'email' => 'email',
        'phone' => 'nomor telepon',
        'password' => 'password',
        'password_confirmation' => 'konfirmasi password',
        'current_password' => 'password saat ini',
        'terms' => 'syarat dan ketentuan',
        'status' => 'status',
    ],

];
