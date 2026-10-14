<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $template = DB::table('email_templates')->where('slug', 'wholesale_application_admin')->first();
        if (! $template) {
            return;
        }

        $body = (string) $template->body;
        if (str_contains($body, '{{address}}')) {
            return;
        }

        $updated = str_replace(
            "Phone: {{phone}}\nType: {{business_type}}",
            "Phone: {{phone}}\nAddress:\n{{address}}\nType: {{business_type}}",
            $body
        );

        if ($updated === $body) {
            $updated = $body."\n\nAddress:\n{{address}}";
        }

        DB::table('email_templates')
            ->where('slug', 'wholesale_application_admin')
            ->update(['body' => $updated, 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Intentionally left blank — template content may have been customized.
    }
};
