@if(!empty($account['email']) && !empty($account['password']))
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 24px;background-color:#f0f5ef;border:1px solid #c8d5c0;border-radius:10px;">
    <tr>
        <td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:14px;font-weight:700;color:#244526;margin-bottom:6px;">
                {{ !empty($account['is_new']) ? 'Your account is ready' : 'Your account login' }}
            </div>
            <div style="font-size:13px;line-height:1.5;color:#3d5340;margin-bottom:12px;">
                {{ !empty($account['is_new'])
                    ? 'We created a customer account so you can track this order anytime.'
                    : 'Use these one-time credentials to access My Account and track your order.' }}
            </div>
            <div style="font-size:13px;color:#244526;margin-bottom:4px;"><strong>Email:</strong> {{ $account['email'] }}</div>
            <div style="font-size:13px;color:#244526;margin-bottom:10px;"><strong>Password:</strong> {{ $account['password'] }}</div>
            <div style="font-size:12px;color:#5c6b5a;">Please sign in and change your password under Profile.</div>
        </td>
    </tr>
</table>
@endif
