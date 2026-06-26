<?php

namespace App\Support;

use App\Models\Setting;

class PublicSiteSettings
{
    /** @return array<string, mixed> */
    public static function toArray(): array
    {
        return [
            'siteName' => Setting::get('site_name', 'Meadowlark Gardens'),
            'siteEmail' => Setting::get('site_email', ''),
            'sitePhone' => Setting::get('site_phone', ''),
            'headerLogo' => ($v = MediaUrl::normalize(Setting::get('header_logo'))) ? $v : null,
            'footerLogo' => ($v = MediaUrl::normalize(Setting::get('footer_logo'))) ? $v : null,
            'favicon' => ($v = MediaUrl::normalize(Setting::get('favicon'))) ? $v : null,
            'contactPageSubtitle' => Setting::get('contact_page_subtitle', "We'd love to hear from you. Our team usually responds within one business day."),
            'contactAddress' => Setting::get('contact_address', "1247 Meadowlark Lane\nFranklin, TN 37064"),
            'contactPhoneNote' => Setting::get('contact_phone_note', 'Mon–Sat 8am – 5pm'),
            'contactEmailNote' => Setting::get('contact_email_note', 'We reply within 24 hours'),
            'businessHoursWeekday' => Setting::get('business_hours_weekday', 'Mon–Sat: 8:00am – 5:30pm'),
            'businessHoursSunday' => Setting::get('business_hours_sunday', 'Sunday: 10:00am – 3:00pm'),
            'footerDescription' => Setting::get('footer_description', 'Rooted in Tennessee, growing since 1998. We cultivate native plants that thrive in our unique climate and support local ecosystems.'),
            'social' => [
                'facebook' => Setting::get('social_facebook', ''),
                'instagram' => Setting::get('social_instagram', ''),
                'twitter' => Setting::get('social_twitter', ''),
                'youtube' => Setting::get('social_youtube', ''),
                'pinterest' => Setting::get('social_pinterest', ''),
            ],
        ];
    }
}
