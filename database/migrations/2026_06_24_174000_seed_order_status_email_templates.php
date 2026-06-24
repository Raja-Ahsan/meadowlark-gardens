<?php

use App\Models\EmailTemplate;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $templates = [
            [
                'slug' => 'order_processing',
                'name' => 'Order Processing',
                'subject' => 'Order #{{order_number}} is being processed',
                'body' => "Hello {{name}},\n\nYour order #{{order_number}} is now being processed. We'll notify you when it's ready to ship.\n\nOrder total: \${{total}}",
            ],
            [
                'slug' => 'order_packed',
                'name' => 'Order Packed',
                'subject' => 'Order #{{order_number}} has been packed',
                'body' => "Hello {{name}},\n\nGood news! Your order #{{order_number}} has been packed and will ship soon.\n\nOrder total: \${{total}}",
            ],
            [
                'slug' => 'order_completed',
                'name' => 'Order Completed',
                'subject' => 'Order #{{order_number}} is complete',
                'body' => "Hello {{name}},\n\nYour order #{{order_number}} is now complete. Thank you for shopping with Meadowlark Gardens!\n\nOrder total: \${{total}}",
            ],
            [
                'slug' => 'order_cancelled',
                'name' => 'Order Cancelled',
                'subject' => 'Order #{{order_number}} has been cancelled',
                'body' => "Hello {{name}},\n\nYour order #{{order_number}} has been cancelled. If you have questions, please contact us.\n\nOrder total: \${{total}}",
            ],
            [
                'slug' => 'order_refunded',
                'name' => 'Order Refunded',
                'subject' => 'Refund processed for order #{{order_number}}',
                'body' => "Hello {{name}},\n\nA refund has been processed for order #{{order_number}}. Please allow 5–10 business days for it to appear on your statement.\n\nOrder total: \${{total}}",
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                [...$template, 'is_active' => true]
            );
        }

        foreach (['payment_confirmation', 'shipping_confirmation', 'delivery_confirmation'] as $slug) {
            EmailTemplate::where('slug', $slug)->update(['is_active' => true]);
        }
    }

    public function down(): void
    {
        EmailTemplate::whereIn('slug', [
            'order_processing', 'order_packed', 'order_completed', 'order_cancelled', 'order_refunded',
        ])->delete();
    }
};
