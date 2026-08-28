@if(!empty($cta['url']) && !empty($cta['label']))
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 28px;">
    <tr>
        <td style="background-color:#244526;border-radius:8px;">
            <a href="{{ $cta['url'] }}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                {{ $cta['label'] }}
            </a>
        </td>
    </tr>
</table>
@endif
