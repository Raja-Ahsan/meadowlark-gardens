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
            [
                'slug' => 'shipping-policy',
                'title' => 'Shipping Policy',
                'meta_title' => 'Shipping Policy',
                'meta_description' => 'Learn how Meadowlark Gardens ships plants and garden products to your door.',
                'content' => '<h2>Shipping Overview</h2><p>We carefully pack and ship live plants and garden products so they arrive healthy and ready to thrive. Shipping options and rates are calculated at checkout based on your location and order size.</p><h2>Processing Time</h2><p>Orders are typically processed within 2–5 business days. During peak planting seasons, processing may take slightly longer. You will receive a confirmation email when your order ships.</p><h2>Shipping Destinations</h2><p>We currently ship within the continental United States. Some plants may be restricted in certain states due to agricultural regulations; we will notify you if an item cannot be shipped to your area.</p><h2>Delivery &amp; Care</h2><p>Please unpack your plants as soon as they arrive and water them as needed. If your shipment arrives damaged, contact us within 48 hours with photos so we can make it right.</p>',
            ],
            [
                'slug' => 'refund-policy',
                'title' => 'Refund Policy',
                'meta_title' => 'Refund Policy',
                'meta_description' => 'Our refund and return policy for plants and products purchased from Meadowlark Gardens.',
                'content' => '<h2>Our Commitment</h2><p>We want every plant you receive to arrive healthy and ready to grow. If something is wrong with your order, we will work with you to resolve it.</p><h2>Live Plant Guarantee</h2><p>Please inspect your plants within 48 hours of delivery. If a plant arrives damaged or deceased, contact us with photos of the packaging and plant so we can arrange a replacement or refund.</p><h2>Returns</h2><p>Because we ship living plants, we generally cannot accept returns of plants once they have been delivered in good condition. Non-plant merchandise may be eligible for return within 14 days if unused and in original packaging.</p><h2>How to Request a Refund</h2><p>Email us through our contact page with your order number and details. Approved refunds are issued to the original payment method within 5–10 business days.</p>',
            ],
            [
                'slug' => 'plant-information',
                'title' => 'Plant Information',
                'meta_title' => 'Plant Information',
                'meta_description' => 'Growing tips and plant care information from Meadowlark Gardens TN.',
                'content' => '<h2>Growing With Meadowlark</h2><p>Every plant we grow is raised outdoors in Tennessee — no greenhouses. That means our plants are hardened for real backyard conditions. Our saying is simple: if it grows and is healthy in our backyard, it will do the same in yours.</p><h2>Choosing the Right Plant</h2><p>Consider your light, soil, and moisture conditions before planting. Native and regionally adapted plants generally need less water and care once established, and they support local pollinators and wildlife.</p><h2>Planting Tips</h2><p>Dig a hole roughly twice as wide as the root ball and just as deep. Gently loosen the roots, set the plant so the crown sits at soil level, backfill, and water thoroughly. Mulch around the base to help retain moisture — keep mulch clear of the stem.</p><h2>Aftercare</h2><p>Water regularly for the first few weeks while roots establish. Avoid overwatering; most plants prefer soil that drains well. Check individual product pages for sun, water, and hardiness recommendations specific to each variety.</p><h2>Questions?</h2><p>Reach out through our contact page — we are happy to help you pick plants that belong in your landscape.</p>',
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
