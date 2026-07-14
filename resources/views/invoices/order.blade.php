<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #244526; }
        h1 { color: #244526; border-bottom: 2px solid #c8d5c0; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e8ede6; }
        th { background: #f5f0e8; }
        .totals { text-align: right; margin-top: 20px; }
        .totals p { margin: 5px 0; }
        .grand { font-size: 1.3em; font-weight: bold; }
        @media print { body { margin: 20px; } button { display: none; } }
    </style>
</head>
<body>
    <button onclick="window.print()" style="padding:8px 16px;background:#244526;color:white;border:none;border-radius:6px;cursor:pointer;margin-bottom:20px;">Print Invoice</button>
    <h1>Meadowlark Gardens</h1>
    <p><strong>Invoice:</strong> {{ $order->order_number }}</p>
    <p><strong>Date:</strong> {{ $order->created_at->format('F j, Y') }}</p>
    <p><strong>Customer:</strong> {{ $order->customer_name }} ({{ $order->customer_email }})</p>
    <p><strong>Status:</strong> {{ ucfirst($order->status) }}</p>

    <table>
        <thead>
            <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ $item->quantity }}</td>
                <td>${{ number_format($item->unit_price, 2) }}</td>
                <td>${{ number_format($item->unit_price * $item->quantity, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        @if($order->subtotal)<p>Subtotal: ${{ number_format($order->subtotal, 2) }}</p>@endif
        @if($order->discount > 0)<p>Discount: -${{ number_format($order->discount, 2) }}</p>@endif
        @if($order->tax > 0)<p>Tax: ${{ number_format($order->tax, 2) }}</p>@endif
        @if($order->shipping_cost > 0)<p>Shipping: ${{ number_format($order->shipping_cost, 2) }}</p>@endif
        <p class="grand">Total: ${{ number_format($order->total, 2) }}</p>
    </div>
</body>
</html>
