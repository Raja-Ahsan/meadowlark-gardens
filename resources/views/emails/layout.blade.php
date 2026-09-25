<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>{{ $subject ?? $brand['site_name'] }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3efe6;font-family:Georgia,'Times New Roman',serif;">
@if(!empty($preheader))
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">{{ $preheader }}</div>
@endif
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3efe6;padding:32px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2ddd0;">
                <tr>
                    <td style="background-color:#244526;padding:28px 32px;text-align:center;">
                        <a href="{{ $brand['site_url'] }}" style="text-decoration:none;color:#f7f3ea;font-size:22px;font-weight:700;letter-spacing:0.02em;">
                            {{ $brand['site_name'] }}
                        </a>
                    </td>
                </tr>
                <tr>
                    <td style="padding:36px 32px 12px;color:#244526;">
                        @yield('content')
                    </td>
                </tr>
                <tr>
                    <td style="padding:8px 32px 36px;color:#244526;">
                        <p style="margin:0 0 4px;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;color:#3d5340;">
                            Thanks &amp; regards,
                        </p>
                        <p style="margin:0;font-size:16px;line-height:1.5;font-weight:700;color:#244526;">
                            {{ $brand['site_name'] }}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color:#f7f3ea;padding:24px 32px;border-top:1px solid #e2ddd0;text-align:center;">
                        <p style="margin:0 0 8px;font-size:13px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;color:#5c6b5a;">
                            @if($brand['site_email'])
                                <a href="mailto:{{ $brand['site_email'] }}" style="color:#244526;text-decoration:none;">{{ $brand['site_email'] }}</a>
                            @endif
                            @if($brand['site_email'] && $brand['site_phone'])
                                <span style="color:#c5bba8;"> &nbsp;|&nbsp; </span>
                            @endif
                            @if($brand['site_phone'])
                                <span style="color:#244526;">{{ $brand['site_phone'] }}</span>
                            @endif
                        </p>
                        <!-- <p style="margin:0;font-size:12px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;color:#8a9486;">
                            <a href="{{ $brand['site_url'] }}" style="color:#5c6b5a;text-decoration:underline;">{{ $brand['site_url'] }}</a>
                        </p> -->
                        <p style="margin:12px 0 0;font-size:11px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;color:#9aa394;">
                            &copy; {{ date('Y') }} {{ $brand['site_name'] }}. All rights reserved.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
