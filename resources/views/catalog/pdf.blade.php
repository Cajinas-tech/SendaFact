<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Catálogo Digital de Productos - Senda Sistemas</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page-break { page-break-after: always; }
        }
    </style>
</head>
<body class="bg-slate-100 p-8 font-sans">
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-8">
        <!-- Print Header -->
        <div class="flex items-center justify-between border-b pb-6">
            <div class="flex items-center gap-3">
                <img src="/images/logo/senda-logo.svg" class="w-12 h-12 object-contain">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 uppercase">SENDA SISTEMAS</h1>
                    <p class="text-xs text-slate-500">Catálogo Oficial de Productos y Fichas Técnicas</p>
                </div>
            </div>
            <div class="text-right">
                <button onclick="window.print()" class="no-print px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs shadow">
                    Imprimir / Guardar PDF
                </button>
                <p class="text-xs text-slate-400 mt-2">Fecha: {{ date('d/m/Y') }}</p>
            </div>
        </div>

        <!-- Products Grid for PDF -->
        <div class="grid grid-cols-2 gap-6">
            @foreach($products as $p)
                <div class="border rounded-2xl p-5 space-y-3 bg-slate-50/50">
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold px-2 py-0.5 bg-slate-800 text-white rounded">{{ $p->category->name ?? 'GENERAL' }}</span>
                        <span class="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{{ $p->stock ?? 0 }} en Stock</span>
                    </div>
                    <div class="h-44 flex items-center justify-center bg-white rounded-xl p-2 border">
                        <img src="{{ $p->image_url ?? '/images/products/puerta-aluminio.svg' }}" class="max-h-full max-w-full object-contain">
                    </div>
                    <h3 class="font-black text-slate-900 text-sm uppercase">{{ $p->name }}</h3>
                    <p class="text-xs text-slate-500 font-mono">{{ $p->subtitle ?? '' }}</p>
                    <div class="flex justify-between items-center pt-2 border-t">
                        <span class="text-base font-black text-blue-600 font-mono">C$ {{ number_format($p->price_cordobas ?? 0, 2) }}</span>
                        <span class="text-xs font-bold text-slate-600 font-mono">≈ ${{ number_format($p->price_usd ?? 0, 2) }} USD</span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</body>
</html>