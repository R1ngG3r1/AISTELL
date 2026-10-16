<?php

return [

    /*
    | Kuota pesanan aktif (menunggu/diproses) per tanggal layanan.
    | Pesanan baru untuk tanggal yang sudah penuh ditolak. 0 = tanpa batas.
    | Atur lewat ORDER_DAILY_QUOTA di .env, mis. sebanyak petugas yang tersedia.
    */
    'daily_quota' => (int) env('ORDER_DAILY_QUOTA', 0),

];
