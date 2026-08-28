@extends('emails.layout')

@section('content')
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5c6b5a;">Hello,</p>
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700;color:#244526;">{{ $headline }}</h1>
    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3d5340;">{{ $intro }}</p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 8px;background-color:#f7f3ea;border-radius:10px;">
        <tr>
            <td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5c6b5a;margin-bottom:8px;">Customer</div>
                <div style="font-size:14px;color:#244526;font-weight:600;">{{ $order['customer_name'] ?: 'Customer' }}</div>
                @if(!empty($order['customer_email']))
                    <div style="font-size:13px;color:#3d5340;margin-top:2px;">{{ $order['customer_email'] }}</div>
                @endif
            </td>
        </tr>
    </table>

    @include('emails.partials.order-summary', ['order' => $order])
    @include('emails.partials.cta-button', ['cta' => $cta ?? null])
@endsection
