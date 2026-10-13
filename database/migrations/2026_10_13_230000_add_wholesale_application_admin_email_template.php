<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('email_templates')->where('slug', 'wholesale_application_admin')->exists();
        if ($exists) {
            return;
        }

        DB::table('email_templates')->insert([
            'slug' => 'wholesale_application_admin',
            'name' => 'New Wholesale Application (Admin)',
            'subject' => 'New wholesale application received',
            'body' => "A new wholesale application has been submitted.\n\nBusiness: {{business_name}}\nContact: {{contact_name}}\nEmail: {{email}}\nPhone: {{phone}}\nType: {{business_type}}\n\nPlease review it in the admin panel.",
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('email_templates')->where('slug', 'wholesale_application_admin')->delete();
    }
};
