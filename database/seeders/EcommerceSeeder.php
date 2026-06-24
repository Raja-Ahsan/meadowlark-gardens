<?php

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\EmailTemplate;
use App\Models\Setting;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class EcommerceSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::create([
            'code' => 'WELCOME10',
            'description' => '10% off first order',
            'type' => 'percentage',
            'value' => 10,
            'min_cart_value' => 25,
            'max_discount' => 50,
            'usage_limit' => 1000,
            'retail_only' => true,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'WHOLESALE15',
            'description' => '15% wholesale discount',
            'type' => 'percentage',
            'value' => 15,
            'min_cart_value' => 100,
            'wholesale_only' => true,
            'is_active' => true,
        ]);

        $zone = ShippingZone::create([
            'name' => 'Tennessee & Surrounding',
            'countries' => ['US'],
            'states' => ['TN', 'KY', 'GA', 'AL', 'NC', 'VA'],
            'is_active' => true,
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $zone->id,
            'name' => 'Standard Shipping',
            'type' => 'flat_rate',
            'cost' => 9.99,
            'estimated_days' => '3-5 business days',
            'is_active' => true,
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $zone->id,
            'name' => 'Free Shipping',
            'type' => 'free_shipping',
            'cost' => 0,
            'min_order_amount' => 75,
            'estimated_days' => '5-7 business days',
            'is_active' => true,
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $zone->id,
            'name' => 'Wholesale Delivery',
            'type' => 'flat_rate',
            'cost' => 19.99,
            'estimated_days' => '2-4 business days',
            'wholesale_only' => true,
            'is_active' => true,
        ]);

        $settings = [
            'site_name' => 'Meadowlark Gardens',
            'site_email' => 'info@meadowlarkgardens.com',
            'site_phone' => '(615) 555-0100',
            'shop_name' => 'MeadowlarkGardensTN',
            'shop_owner' => 'John Moser',
            'shop_location' => 'Tennessee, United States',
            'shop_members' => 'Tracy,John',
            'shop_years_active' => '6',
            'shop_response_time' => 'Typically responds within a few hours',
            'header_logo' => '',
            'footer_logo' => '',
            'favicon' => '',
            'contact_page_subtitle' => "We'd love to hear from you. Our team usually responds within one business day.",
            'contact_address' => "1247 Meadowlark Lane\nFranklin, TN 37064",
            'contact_phone_note' => 'Mon–Sat 8am – 5pm',
            'contact_email_note' => 'We reply within 24 hours',
            'business_hours_weekday' => 'Mon–Sat: 8:00am – 5:30pm',
            'business_hours_sunday' => 'Sunday: 10:00am – 3:00pm',
            'footer_description' => 'Rooted in Tennessee, growing since 1998. We cultivate native plants that thrive in our unique climate and support local ecosystems.',
            'social_facebook' => '',
            'social_instagram' => '',
            'social_twitter' => '',
            'social_youtube' => '',
            'social_pinterest' => '',
            'tax_rate' => '9.25',
            'currency' => 'USD',
            'stripe_enabled' => 'false',
            'paypal_enabled' => 'false',
            'bank_transfer_enabled' => 'true',
            'cod_enabled' => 'true',
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, $value, 'general');
        }

        $smtp = [
            'smtp_host' => '',
            'smtp_port' => '587',
            'smtp_username' => '',
            'smtp_password' => '',
            'smtp_encryption' => 'tls',
            'smtp_from_name' => 'Meadowlark Gardens',
            'smtp_from_email' => 'noreply@meadowlarkgardens.com',
        ];

        foreach ($smtp as $key => $value) {
            Setting::set($key, $value, 'smtp');
        }

        $templates = [
            ['slug' => 'welcome', 'name' => 'Welcome Email', 'subject' => 'Welcome to Meadowlark Gardens!', 'body' => 'Hello {{name}}, welcome to Meadowlark Gardens!'],
            ['slug' => 'order_confirmation', 'name' => 'Order Confirmation', 'subject' => 'Order #{{order_number}} Confirmed', 'body' => 'Thank you for your order #{{order_number}}. Total: ${{total}}'],
            ['slug' => 'payment_confirmation', 'name' => 'Payment Confirmation', 'subject' => 'Payment Received - Order #{{order_number}}', 'body' => "Hello {{name}},\n\nWe have received your payment for order #{{order_number}}.\n\nOrder total: \${{total}}"],
            ['slug' => 'shipping_confirmation', 'name' => 'Shipping Confirmation', 'subject' => 'Your Order Has Shipped', 'body' => "Hello {{name}},\n\nOrder #{{order_number}} has shipped.\n\nTracking number: {{tracking_number}}\n\nOrder total: \${{total}}"],
            ['slug' => 'delivery_confirmation', 'name' => 'Delivery Confirmation', 'subject' => 'Order Delivered', 'body' => "Hello {{name}},\n\nYour order #{{order_number}} has been delivered. Thank you for shopping with us!\n\nOrder total: \${{total}}"],
            ['slug' => 'order_processing', 'name' => 'Order Processing', 'subject' => 'Order #{{order_number}} is being processed', 'body' => "Hello {{name}},\n\nYour order #{{order_number}} is now being processed.\n\nOrder total: \${{total}}"],
            ['slug' => 'order_packed', 'name' => 'Order Packed', 'subject' => 'Order #{{order_number}} has been packed', 'body' => "Hello {{name}},\n\nYour order #{{order_number}} has been packed and will ship soon.\n\nOrder total: \${{total}}"],
            ['slug' => 'order_completed', 'name' => 'Order Completed', 'subject' => 'Order #{{order_number}} is complete', 'body' => "Hello {{name}},\n\nYour order #{{order_number}} is now complete. Thank you!\n\nOrder total: \${{total}}"],
            ['slug' => 'order_cancelled', 'name' => 'Order Cancelled', 'subject' => 'Order #{{order_number}} has been cancelled', 'body' => "Hello {{name}},\n\nYour order #{{order_number}} has been cancelled. Contact us if you have questions.\n\nOrder total: \${{total}}"],
            ['slug' => 'order_refunded', 'name' => 'Order Refunded', 'subject' => 'Refund processed for order #{{order_number}}', 'body' => "Hello {{name}},\n\nA refund has been processed for order #{{order_number}}.\n\nOrder total: \${{total}}"],
            ['slug' => 'password_reset', 'name' => 'Password Reset', 'subject' => 'Reset Your Password', 'body' => 'Click here to reset your password: {{reset_link}}'],
            ['slug' => 'new_order_admin', 'name' => 'New Order (Admin)', 'subject' => 'New Order #{{order_number}}', 'body' => 'A new order has been placed. Total: ${{total}}'],
            ['slug' => 'wholesale_approved', 'name' => 'Wholesale Approved', 'subject' => 'Your Wholesale Account is Approved', 'body' => 'Congratulations! Your wholesale account has been approved.'],
        ];

        foreach ($templates as $t) {
            EmailTemplate::create([...$t, 'is_active' => true]);
        }
    }
}
