@php
    use App\Modules\Report\Support\ReportFormat as F;

    $s = $report['summary'];
    $g = $granularity;
    $unit = $g === 'day' ? 'hari' : 'bulan';
    $completionRate = $s['orders']['value'] ? F::number($s['completed']['value'] / $s['orders']['value'] * 100) : 0;
    $deltaClass = fn ($d) => $d === null || $d == 0 ? 'flat' : ($d > 0 ? 'up' : 'down');

    // Lebar batang (persen) relatif terhadap nilai terbesar pada daftar itu.
    $bar = fn ($value, $max) => $max > 0 ? max($value > 0 ? 2 : 0, round($value / $max * 100)) : 0;
    $maxService = collect($report['byService'])->max('revenue');
    $maxMethod = collect($report['byMethod'])->max('revenue');
    $maxStatus = collect($report['byStatus'])->max('value');
@endphp
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan AISTEL {{ F::day($period->from) }} – {{ F::day($period->to) }}</title>
    <style>
        @page { margin: 34px 38px 46px; }
        * { box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #0c2b20; line-height: 1.45; }
        table { width: 100%; border-collapse: collapse; }
        .muted { color: #5f7467; }
        .right { text-align: right; }
        .brand { font-size: 20px; font-weight: bold; color: #07271e; }
        .title { font-size: 22px; font-weight: bold; color: #07271e; text-align: right; }
        .rule { height: 3px; background: #328e67; margin: 10px 0 16px; }

        h2 { font-size: 12px; margin: 0 0 6px; color: #07271e; }
        .section { margin-top: 16px; page-break-inside: avoid; }
        .note { font-size: 8.5px; color: #5f7467; }

        /* Tile ringkasan */
        .tiles td { width: 25%; padding: 0 4px; vertical-align: top; }
        .tiles td:first-child { padding-left: 0; } .tiles td:last-child { padding-right: 0; }
        .tile { background: #f3f5ee; padding: 9px 10px; border-top: 3px solid #328e67; }
        .tile .label { font-size: 8.5px; color: #5f7467; text-transform: uppercase; letter-spacing: .6px; }
        .tile .value { font-size: 16px; font-weight: bold; color: #07271e; margin: 3px 0 2px; }
        .tile .hint { font-size: 8px; color: #5f7467; }
        .up { color: #006300; font-weight: bold; } .down { color: #c05f35; font-weight: bold; } .flat { color: #5f7467; }

        .chart { border: 1px solid #e1e0d9; padding: 8px 8px 4px; }
        .chart img { width: 100%; }

        /* Tabel data */
        .data th { background: #07271e; color: #fff; text-align: left; padding: 5px 7px; font-size: 8.5px; }
        .data td { padding: 5px 7px; border-bottom: 1px solid #e8ece3; vertical-align: middle; }
        .data th.right, .data td.right { text-align: right; }
        .data tr.total td { background: #f3f5ee; font-weight: bold; border-bottom: 0; }
        .track { background: #eef2ea; height: 7px; width: 100%; }
        .fill { background: #328e67; height: 7px; }

        .footer { position: fixed; bottom: -30px; left: 0; right: 0; font-size: 8px; color: #5f7467; border-top: 1px solid #e1e0d9; padding-top: 5px; }
        .page:after { content: counter(page); }
    </style>
</head>
<body>
    <div class="footer">
        <table><tr>
            <td>AISTEL · Laporan {{ F::day($period->from) }} – {{ F::day($period->to) }}</td>
            <td class="right">Halaman <span class="page"></span></td>
        </tr></table>
    </div>

    {{-- Kop --}}
    <table>
        <tr>
            <td style="width: 55%; vertical-align: middle;">
                <table style="width: auto;"><tr>
                    <td style="padding-right: 8px;"><img src="{{ public_path('landingpage/LOGO.png') }}" alt="" style="height: 32px;"></td>
                    <td>
                        <div class="brand">AISTEL</div>
                        <div class="muted" style="font-size: 8.5px;">Clean Space · Better Living</div>
                    </td>
                </tr></table>
            </td>
            <td style="vertical-align: middle;">
                <div class="title">Rekap Laporan</div>
                <div class="right muted">{{ F::day($period->from) }} – {{ F::day($period->to) }} ({{ $period->days() }} hari)</div>
            </td>
        </tr>
    </table>
    <div class="rule"></div>

    {{-- Ringkasan --}}
    <table class="tiles">
        <tr>
            <td>
                <div class="tile">
                    <div class="label">Pendapatan</div>
                    <div class="value">{{ F::rupiah($s['revenue']['value']) }}</div>
                    <div class="{{ $deltaClass($s['revenue']['delta']) }}">{{ F::delta($s['revenue']['delta']) }}</div>
                    <div class="hint">pembayaran lunas pada periode</div>
                </div>
            </td>
            <td>
                <div class="tile">
                    <div class="label">Pesanan masuk</div>
                    <div class="value">{{ F::number($s['orders']['value']) }}</div>
                    <div class="{{ $deltaClass($s['orders']['delta']) }}">{{ F::delta($s['orders']['delta']) }}</div>
                    <div class="hint">pesanan dibuat pada periode</div>
                </div>
            </td>
            <td>
                <div class="tile">
                    <div class="label">Pesanan selesai</div>
                    <div class="value">{{ F::number($s['completed']['value']) }}</div>
                    <div class="{{ $deltaClass($s['completed']['delta']) }}">{{ F::delta($s['completed']['delta']) }}</div>
                    <div class="hint">{{ $completionRate }}% dari pesanan masuk</div>
                </div>
            </td>
            <td>
                <div class="tile">
                    <div class="label">Rating pelanggan</div>
                    <div class="value">{{ $s['rating']['value'] === null ? '-' : F::number($s['rating']['value'], 1).' / 5' }}</div>
                    @if ($s['rating']['value'] !== null && $s['rating']['previous'] !== null)
                        @php $diff = round($s['rating']['value'] - $s['rating']['previous'], 1); @endphp
                        <div class="{{ $deltaClass($diff) }}">{{ $diff > 0 ? '▲ +' : ($diff < 0 ? '▼ ' : '– ') }}{{ F::number($diff, 1) }}</div>
                    @else
                        <div class="flat">Belum ada pembanding</div>
                    @endif
                    <div class="hint">{{ $s['rating']['count'] ? 'dari '.F::number($s['rating']['count']).' ulasan' : 'belum ada ulasan' }}</div>
                </div>
            </td>
        </tr>
    </table>
    <p class="note" style="margin: 6px 0 0;">Pembanding: periode sebelumnya dengan panjang sama ({{ F::day($report['previousPeriod']['from']) }} – {{ F::day($report['previousPeriod']['to']) }}).</p>

    {{-- Tren --}}
    <div class="section">
        <h2>Pendapatan per {{ $unit }}</h2>
        <div class="chart"><img src="{{ $revenueChart }}" alt="Grafik pendapatan per {{ $unit }}"></div>
    </div>
    <div class="section">
        <h2>Pesanan masuk per {{ $unit }}</h2>
        <div class="chart"><img src="{{ $ordersChart }}" alt="Grafik pesanan per {{ $unit }}"></div>
    </div>

    {{-- Per layanan --}}
    <div class="section">
        <h2>Pendapatan per layanan</h2>
        <table class="data">
            <thead><tr><th style="width: 34%;">Layanan</th><th class="right" style="width: 12%;">Pesanan</th><th style="width: 30%;">Porsi</th><th class="right" style="width: 24%;">Pendapatan</th></tr></thead>
            <tbody>
                @forelse ($report['byService'] as $row)
                    <tr>
                        <td>{{ $row['name'] }}</td>
                        <td class="right">{{ F::number($row['orders']) }}</td>
                        <td><div class="track"><div class="fill" style="width: {{ $bar($row['revenue'], $maxService) }}%;"></div></div></td>
                        <td class="right">{{ F::rupiah($row['revenue']) }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="muted" style="text-align: center; padding: 12px;">Belum ada data pada periode ini</td></tr>
                @endforelse
                @if (count($report['byService']))
                    <tr class="total"><td>Total</td><td class="right">{{ F::number(collect($report['byService'])->sum('orders')) }}</td><td></td><td class="right">{{ F::rupiah(collect($report['byService'])->sum('revenue')) }}</td></tr>
                @endif
            </tbody>
        </table>
    </div>

    {{-- Per metode bayar --}}
    <div class="section">
        <h2>Pendapatan per metode pembayaran</h2>
        <table class="data">
            <thead><tr><th style="width: 34%;">Metode</th><th class="right" style="width: 12%;">Transaksi</th><th style="width: 30%;">Porsi</th><th class="right" style="width: 24%;">Pendapatan</th></tr></thead>
            <tbody>
                @forelse ($report['byMethod'] as $row)
                    <tr>
                        <td>{{ $row['name'] }}</td>
                        <td class="right">{{ F::number($row['count']) }}</td>
                        <td><div class="track"><div class="fill" style="width: {{ $bar($row['revenue'], $maxMethod) }}%;"></div></div></td>
                        <td class="right">{{ F::rupiah($row['revenue']) }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="muted" style="text-align: center; padding: 12px;">Belum ada pembayaran pada periode ini</td></tr>
                @endforelse
                @if (count($report['byMethod']))
                    <tr class="total"><td>Total</td><td class="right">{{ F::number(collect($report['byMethod'])->sum('count')) }}</td><td></td><td class="right">{{ F::rupiah(collect($report['byMethod'])->sum('revenue')) }}</td></tr>
                @endif
            </tbody>
        </table>
    </div>

    {{-- Status pesanan --}}
    <div class="section">
        <h2>Status pesanan</h2>
        <table class="data">
            <thead><tr><th style="width: 34%;">Status</th><th class="right" style="width: 12%;">Pesanan</th><th style="width: 30%;">Porsi</th><th class="right" style="width: 24%;">Persentase</th></tr></thead>
            <tbody>
                @foreach ($report['byStatus'] as $row)
                    <tr>
                        <td>{{ $row['name'] }}</td>
                        <td class="right">{{ F::number($row['value']) }}</td>
                        <td><div class="track"><div class="fill" style="width: {{ $bar($row['value'], $maxStatus) }}%;"></div></div></td>
                        <td class="right">{{ $s['orders']['value'] ? F::number($row['value'] / $s['orders']['value'] * 100, 1) : '0' }}%</td>
                    </tr>
                @endforeach
                <tr class="total"><td>Total</td><td class="right">{{ F::number($s['orders']['value']) }}</td><td></td><td class="right">100%</td></tr>
            </tbody>
        </table>
    </div>

    {{-- Rincian per hari / bulan (hanya yang ada aktivitas) --}}
    <div class="section" style="page-break-inside: auto;">
        <h2>Rincian per {{ $unit }}</h2>
        <table class="data">
            <thead><tr><th>{{ $g === 'day' ? 'Tanggal' : 'Bulan' }}</th><th class="right">Pesanan masuk</th><th class="right">Transaksi lunas</th><th class="right">Pendapatan</th></tr></thead>
            <tbody>
                @forelse ($breakdown as $row)
                    <tr style="page-break-inside: avoid;">
                        <td>{{ F::bucket($row['key'], $g) }}</td>
                        <td class="right">{{ F::number($row['orders']) }}</td>
                        <td class="right">{{ F::number($row['transactions']) }}</td>
                        <td class="right">{{ F::rupiah($row['revenue']) }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="muted" style="text-align: center; padding: 12px;">Tidak ada aktivitas pada periode ini</td></tr>
                @endforelse
                @if (count($breakdown))
                    <tr class="total"><td>Total</td><td class="right">{{ F::number(collect($breakdown)->sum('orders')) }}</td><td class="right">{{ F::number(collect($breakdown)->sum('transactions')) }}</td><td class="right">{{ F::rupiah(collect($breakdown)->sum('revenue')) }}</td></tr>
                @endif
            </tbody>
        </table>
        <p class="note" style="margin-top: 5px;">Hanya {{ $unit }} yang memiliki pesanan atau pembayaran yang ditampilkan.</p>
    </div>

    <p class="note" style="margin-top: 14px;">
        Pendapatan dihitung dari pembayaran berstatus lunas yang dibayar pada periode (dana yang dikembalikan tidak ikut). Pesanan dihitung dari tanggal pesanan dibuat, dengan status saat ini.
        Dicetak {{ $generatedAt->translatedFormat('j F Y, H:i') }} WIB oleh sistem AISTEL.
    </p>
</body>
</html>
