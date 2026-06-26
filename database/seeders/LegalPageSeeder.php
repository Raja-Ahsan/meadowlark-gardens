<?php

namespace Database\Seeders;

use App\Models\LegalPage;
use Illuminate\Database\Seeder;

class LegalPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'privacy-policy',
                'title' => 'Privacy Policy',
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'Learn how Meadowlark Gardens collects, uses, and protects your personal information.',
                'content' => '<h2>Introduction</h2><p>At Meadowlark Gardens, we respect your privacy and are committed to protecting your personal data. This policy explains what information we collect, how we use it, and your rights.</p><h2>Information We Collect</h2><p>We may collect your name, email address, phone number, billing and shipping addresses, and order history when you shop with us or create an account.</p><h2>How We Use Your Information</h2><p>We use your information to process orders, provide customer support, send order updates, and improve our services. We do not sell your personal information to third parties.</p><h2>Contact Us</h2><p>If you have questions about this privacy policy, please contact us through our contact page.</p>',
            ],
            [
                'slug' => 'terms-of-service',
                'title' => 'Terms of Service',
                'meta_title' => 'Terms of Service',
                'meta_description' => 'Terms and conditions for using the Meadowlark Gardens website and purchasing our products.',
                'content' => '<h2>Agreement to Terms</h2><p>By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our site.</p><h2>Orders &amp; Payment</h2><p>All orders are subject to acceptance and availability. Prices are listed in USD and may change without notice. Payment must be received before orders are processed.</p><h2>Shipping &amp; Returns</h2><p>We ship plants and garden products with care. Please review our shipping policies at checkout. Contact us within 48 hours of delivery if there is an issue with your order.</p><h2>Limitation of Liability</h2><p>Meadowlark Gardens is not liable for indirect or consequential damages arising from the use of our products or website.</p>',
            ],
            [
                'slug' => 'cookies',
                'title' => 'Cookie Policy',
                'meta_title' => 'Cookie Policy',
                'meta_description' => 'How Meadowlark Gardens uses cookies and similar technologies on our website.',
                'content' => '<h2>What Are Cookies?</h2><p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your browsing experience.</p><h2>How We Use Cookies</h2><p>We use essential cookies for site functionality, such as keeping you signed in and remembering items in your cart. We may also use analytics cookies to understand how visitors use our site.</p><h2>Managing Cookies</h2><p>You can control or delete cookies through your browser settings. Disabling cookies may affect some features of our website.</p><h2>Updates</h2><p>We may update this cookie policy from time to time. Please check this page periodically for changes.</p>',
            ],
        ];

        foreach ($pages as $page) {
            LegalPage::updateOrCreate(
                ['slug' => $page['slug']],
                array_merge($page, ['is_published' => true])
            );
        }
    }
}
