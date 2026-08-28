@php
    /** @var array $order */
@endphp
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;border:1px solid #e2ddd0;border-radius:10px;overflow:hidden;">
    <tr>
        <td style="background-color:#f7f3ea;padding:14px 16px;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                    <td style="font-size:13px;color:#5c6b5a;">Order</td>
                    <td align="right" style="font-size:14px;font-weight:700;color:#244526;">{{ $order['number'] }}</td>
                </tr>
                @if(!empty($order['date']))
                <tr>
                    <td style="padding-top:6px;font-size:13px;color:#5c6b5a;">Date</td>
                    <td align="right" style="padding-top:6px;font-size:13px;color:#244526;">{{ $order['date'] }}</td>
                </tr>
                @endif
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding:0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr style="background-color:#ffffff;">
                    <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5c6b5a;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #e2ddd0;">Item</td>
                    <td align="center" style="padding:12px 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5c6b5a;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #e2ddd0;">Qty</td>
                    <td align="right" style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5c6b5a;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #e2ddd0;">Total</td>
                </tr>
                @foreach($order['items'] as $item)
                <tr>
                    <td style="padding:14px 16px;border-bottom:1px solid #f0ebe1;font-family:Arial,Helvetica,sans-serif;vertical-align:top;">
                        <div style="font-size:14px;font-weight:600;color:#244526;">{{ $item['name'] }}</div>
                        @if(!empty($item['variant']))
                            <div style="font-size:12px;color:#5c6b5a;margin-top:3px;">{{ $item['variant'] }}</div>
                        @endif
                        <div style="font-size:12px;color:#8a9486;margin-top:3px;">${{ $item['unit_price'] }} each</div>
                    </td>
                    <td align="center" style="padding:14px 8px;border-bottom:1px solid #f0ebe1;font-size:14px;color:#244526;font-family:Arial,Helvetica,sans-serif;vertical-align:top;">{{ $item['quantity'] }}</td>
                    <td align="right" style="padding:14px 16px;border-bottom:1px solid #f0ebe1;font-size:14px;font-weight:600;color:#244526;font-family:Arial,Helvetica,sans-serif;vertical-align:top;">${{ $item['line_total'] }}</td>
                </tr>
                @endforeach
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding:16px;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                    <td style="padding:4px 0;font-size:13px;color:#5c6b5a;">Subtotal</td>
                    <td align="right" style="padding:4px 0;font-size:13px;color:#244526;">${{ $order['subtotal'] }}</td>
                </tr>
                @if(!empty($order['discount']))
                <tr>
                    <td style="padding:4px 0;font-size:13px;color:#5c6b5a;">Discount</td>
                    <td align="right" style="padding:4px 0;font-size:13px;color:#244526;">-${{ $order['discount'] }}</td>
                </tr>
                @endif
                <tr>
                    <td style="padding:4px 0;font-size:13px;color:#5c6b5a;">Shipping{{ !empty($order['shipping_method']) ? ' ('.$order['shipping_method'].')' : '' }}</td>
                    <td align="right" style="padding:4px 0;font-size:13px;color:#244526;">${{ $order['shipping'] }}</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;font-size:13px;color:#5c6b5a;">Tax</td>
                    <td align="right" style="padding:4px 0;font-size:13px;color:#244526;">${{ $order['tax'] }}</td>
                </tr>
                <tr>
                    <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#244526;border-top:1px solid #e2ddd0;">Total</td>
                    <td align="right" style="padding:12px 0 0;font-size:16px;font-weight:700;color:#244526;border-top:1px solid #e2ddd0;">${{ $order['total'] }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

@if(!empty($order['shipping_address']) || !empty($order['payment_method']) || !empty($order['tracking_number']))
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 8px;">
    <tr>
        @if(!empty($order['shipping_address']))
        <td width="50%" valign="top" style="padding:0 8px 16px 0;font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5c6b5a;margin-bottom:8px;">Ship to</div>
            @foreach($order['shipping_address'] as $line)
                <div style="font-size:14px;line-height:1.5;color:#244526;">{{ $line }}</div>
            @endforeach
        </td>
        @endif
        <td width="50%" valign="top" style="padding:0 0 16px 8px;font-family:Arial,Helvetica,sans-serif;">
            @if(!empty($order['payment_method']))
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5c6b5a;margin-bottom:8px;">Payment</div>
                <div style="font-size:14px;line-height:1.5;color:#244526;margin-bottom:14px;">{{ $order['payment_method'] }}</div>
            @endif
            @if(!empty($order['tracking_number']))
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5c6b5a;margin-bottom:8px;">Tracking</div>
                <div style="font-size:14px;line-height:1.5;color:#244526;font-family:Consolas,Monaco,monospace;">{{ $order['tracking_number'] }}</div>
            @endif
            @if(!empty($order['billing_address']))
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5c6b5a;margin:14px 0 8px;">Bill to</div>
                @foreach($order['billing_address'] as $line)
                    <div style="font-size:14px;line-height:1.5;color:#244526;">{{ $line }}</div>
                @endforeach
            @endif
        </td>
    </tr>
</table>
@endif
