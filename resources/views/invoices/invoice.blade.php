@php
    $rp = fn ($n) => 'Rp'.number_format($n, 0, ',', '.');
    $date = fn ($d) => \Illuminate\Support\Carbon::parse($d)->translatedFormat('j F Y');
@endphp
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $payment->reference }}</title>
    <style>
        @page { margin: 36px 42px; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #0c2b20; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; }
        .muted { color: #5f7467; }
        .brand { font-size: 22px; font-weight: bold; color: #07271e; }
        .title { font-size: 26px; font-weight: bold; text-align: right; color: #07271e; }
        .paid { display: inline-block; border: 2px solid #287e59; color: #287e59; font-weight: bold; padding: 2px 10px; letter-spacing: 2px; }
        .box { background: #f3f5ee; padding: 12px 14px; }
        .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #5f7467; margin-bottom: 3px; }
        .items th { background: #07271e; color: #fff; text-align: left; padding: 8px 10px; font-size: 10px; }
        .items td { padding: 9px 10px; border-bottom: 1px solid #dfe7d9; }
        .right { text-align: right; }
        .total td { font-size: 13px; font-weight: bold; border-bottom: 0; background: #f3f5ee; }
        .foot { margin-top: 34px; text-align: center; font-size: 9px; color: #5f7467; border-top: 1px solid #dfe7d9; padding-top: 10px; }
    </style>
</head>
<body>
    <table>
        <tr>
            <td style="width: 55%; vertical-align: top;">
                <table style="width: auto;">
                    <tr>
                        <td style="padding-right: 8px;"><img src="{{ public_path('landingpage/LOGO.png') }}" alt="" style="height: 34px;"></td>
                        <td>
                            <div class="brand">AISTEL</div>
                            <div class="muted" style="font-size: 9px;">Clean Space · Better Living</div>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="vertical-align: top;">
                <div class="title">INVOICE</div>
                <div class="right muted">{{ $payment->reference }}</div>
            </td>
        </tr>
    </table>

    <table style="margin-top: 22px;">
        <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                <div class="box">
                    <div class="label">Ditagihkan kepada</div>
                    <strong>{{ $order->contact_name }}</strong><br>
                    {{ $order->contact_phone }}<br>
                    <span class="muted">{{ $order->user?->email }}</span>
                </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                <div class="box">
                    <div class="label">Rincian pembayaran</div>
                    Tanggal bayar: <strong>{{ $payment->paid_at ? $date($payment->paid_at) : '-' }}</strong><br>
                    Metode: <strong>{{ $payment->method_label }}</strong><br>
                    No. pesanan: <strong>#{{ $order->id }}</strong>
                </div>
            </td>
        </tr>
    </table>

    <table class="items" style="margin-top: 22px;">
        <thead>
            <tr><th>Deskripsi</th><th class="right" style="width: 28%;">Jumlah</th></tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ $order->service?->name }}</strong><br>
                    <span class="muted">Jadwal {{ $date($order->date) }}, {{ substr($order->time, 0, 5) }}</span><br>
                    <span class="muted">{{ $order->location }}</span>
                </td>
                <td class="right">{{ $rp($price) }}</td>
            </tr>
            @if ($fee > 0)
                <tr>
                    <td>Biaya layanan pembayaran ({{ $payment->method_label }})</td>
                    <td class="right">{{ $rp($fee) }}</td>
                </tr>
            @endif
            <tr class="total">
                <td class="right">Total dibayar</td>
                <td class="right">{{ $rp($total) }}</td>
            </tr>
        </tbody>
    </table>

    <p style="margin-top: 18px;"><span class="paid">LUNAS</span></p>

    <div class="foot">
        Invoice ini dibuat otomatis oleh sistem AISTEL dan sah tanpa tanda tangan.<br>
        Terima kasih telah menjaga lingkungan bersama kami.
    </div>
</body>
</html>
