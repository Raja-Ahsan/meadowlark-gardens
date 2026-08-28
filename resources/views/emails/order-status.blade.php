@extends('emails.layout')

@section('content')
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5c6b5a;">Hi {{ $name }},</p>
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700;color:#244526;">{{ $headline }}</h1>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3d5340;">{{ $intro }}</p>

    @include('emails.partials.order-summary', ['order' => $order])
    @include('emails.partials.cta-button', ['cta' => $cta ?? null])
@endsection
