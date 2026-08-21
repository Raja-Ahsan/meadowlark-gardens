<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Packing Slip {{ $order->order_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #244526; }
        h1 { color: #244526; margin-bottom: 4px; }
        .subtitle { color: #5a6b5c; margin-bottom: 24px; font-size: 14px; }
        .meta { display: flex; gap: 40px; margin-bottom: 28px; flex-wrap: wrap; }
        .meta h3 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: #5a6b5c; }
        .meta p { margin: 2px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e8ede6; font-size: 14px; }
        th { background: #f5f0e8; }
        .check { width: 36px; text-align: center; }
        .box { width: 18px; height: 18px; border: 1.5px solid #244526; display: inline-block; vertical-align: middle; }
        .notes { margin-top: 28px; padding: 14px; border: 1px solid #c8d5c0; border-radius: 8px; background: #fafaf7; }
        .notes h3 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: #5a6b5c; }
        .footer { margin-top: 32px; font-size: 12px; color: #5a6b5c; border-top: 1px solid #e8ede6; padding-top: 12px; }
        @media print { body { margin: 20px; } button { display: none; } }
    </style>
</head>
<body>
    <button onclick="window.print()" style="padding:8px 16px;background:#244526;color:white;border:none;border-radius:6px;cursor:pointer;margin-bottom:20px;">Print Packing Slip</button>

    <h1>Packing Slip</h1>
    <p class="subtitle">Meadowlark Gardens · Order {{ $order->order_number }}</p>

    <div class="meta">
        <div>
            <h3>Ship to</h3>
            @php
                $ship = is_array($order->shipping_address) ? $order->shipping_address : [];
                $name = trim(($ship['firstName'] ?? '') . ' ' . ($ship['lastName'] ?? ''));
                if ($name === '') {
                    $name = $order->customer_name;
                }
            @endphp
            @if(!empty($ship))
                @if($name)<p><strong>{{ $name }}</strong></p>@endif
                @if(!empty($ship['company']))<p>{{ $ship['company'] }}</p>@endif
                @if(!empty($ship['addressLine1']))<p>{{ $ship['addressLine1'] }}</p>@endif
                @if(!empty($ship['addressLine2']))<p>{{ $ship['addressLine2'] }}</p>@endif
                <p>{{ collect([$ship['city'] ?? null, $ship['state'] ?? null, $ship['postalCode'] ?? null])->filter()->implode(', ') }}</p>
                @if(!empty($ship['country']))<p>{{ $ship['country'] }}</p>@endif
                @if(!empty($ship['phone']))<p>Phone: {{ $ship['phone'] }}</p>@endif
            @else
                <p><strong>{{ $order->customer_name }}</strong></p>
                <p>{{ $order->customer_email }}</p>
            @endif
        </div>
        <div>
            <h3>Order info</h3>
            <p><strong>Order:</strong> {{ $order->order_number }}</p>
            <p><strong>Date:</strong> {{ optional($order->created_at)->format('F j, Y') }}</p>
            <p><strong>Type:</strong> {{ ucfirst($order->type) }}</p>
            <p><strong>Status:</strong> {{ ucfirst($order->status) }}</p>
            @if($order->tracking_number)
                <p><strong>Tracking:</strong> {{ $order->tracking_number }}</p>
            @endif
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="check">Packed</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                @php
                    $product = $item->product;
                    $variation = $item->variation;
                    $sku = ($variation && $variation->sku) ? $variation->sku : (($product && $product->sku) ? $product->sku : '—');
                    $attrs = ($variation && is_array($variation->attribute_values)) ? $variation->attribute_values : [];
                    $attrParts = [];
                    foreach ($attrs as $key => $val) {
                        $attrParts[] = $key . ': ' . $val;
                    }
                    $attrLabel = implode(' · ', $attrParts);
                    $productName = $product ? $product->name : 'Product';
                @endphp
                <tr>
                    <td class="check"><span class="box"></span></td>
                    <td>
                        {{ $productName }}
                        @if($attrLabel !== '')
                            <br><span style="font-size:12px;color:#5a6b5c;">{{ $attrLabel }}</span>
                        @endif
                    </td>
                    <td>{{ $sku }}</td>
                    <td><strong>{{ $item->quantity }}</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @if($order->order_notes)
        <div class="notes">
            <h3>Customer notes</h3>
            <p style="margin:0;white-space:pre-wrap;">{{ $order->order_notes }}</p>
        </div>
    @endif

    <div class="footer">
        Packed by: ______________________ &nbsp;&nbsp; Date: ______________ &nbsp;&nbsp; Total items: {{ $order->items->sum('quantity') }}
    </div>
</body>
</html>
