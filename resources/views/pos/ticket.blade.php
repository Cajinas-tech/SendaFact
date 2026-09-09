<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ticket #{{ $sale->ticket_number }}</title>
    <style>
        body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 10px; font-size: 12px; color: #000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body onload="window.print()">
    <div class="text-center">
        <h2 class="bold" style="margin: 0;">{{ $setting->name ?? 'SENDA SISTEMAS' }}</h2>
        <p style="margin: 2px 0;">RUC: {{ $setting->ruc ?? 'J0310000012345' }}</p>
        <p style="margin: 2px 0;">Tel: {{ $setting->phone ?? '+505 8888 8888' }}</p>
        <p style="margin: 2px 0;">{{ $setting->address ?? 'Managua, Nicaragua' }}</p>
    </div>

    <div class="divider"></div>

    <div>
        <p style="margin: 2px 0;"><strong>Ticket:</strong> {{ $sale->ticket_number }}</p>
        <p style="margin: 2px 0;"><strong>Fecha:</strong> {{ $sale->created_at->format('d/m/Y H:i') }}</p>
        <p style="margin: 2px 0;"><strong>Cajero:</strong> {{ $sale->user->name ?? 'Jairo' }}</p>
        <p style="margin: 2px 0;"><strong>Cliente:</strong> {{ $sale->customer->name ?? 'Público General' }}</p>
        <p style="margin: 2px 0;"><strong>Pago:</strong> {{ strtoupper($sale->payment_method) }}</p>
    </div>

    <div class="divider"></div>

    <table style="width: 100%; font-size: 11px;">
        <thead>
            <tr>
                <th style="text-align: left;">Cant</th>
                <th style="text-align: left;">Desc</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->items as $item)
                <tr>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ $item->product_name }}</td>
                    <td class="text-right">C${{ number_format($item->total_cordobas, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="divider"></div>

    <div class="text-right bold" style="font-size: 14px;">
        <p style="margin: 2px 0;">TOTAL: C$ {{ number_format($sale->total_cordobas, 2) }}</p>
        <p style="margin: 2px 0; font-size: 11px;">(≈ ${{ number_format($sale->total_usd, 2) }} USD)</p>
    </div>

    <div class="divider"></div>
    <div class="text-center" style="font-size: 10px; margin-top: 15px;">
        <p>¡Gracias por su compra!</p>
        <p>{{ $setting->tagline ?? 'SendaFact POS V3.0' }}</p>
    </div>
</body>
</html>