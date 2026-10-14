<?php

namespace Tests\Unit;

use App\Models\WholesaleApplication;
use PHPUnit\Framework\TestCase;

class WholesaleApplicationAddressTest extends TestCase
{
    public function test_formatted_address_uses_structured_fields(): void
    {
        $app = new WholesaleApplication([
            'address' => 'legacy free text',
            'address_line_1' => '123 Garden St',
            'address_line_2' => 'Suite 4',
            'city' => 'Nashville',
            'state' => 'TN',
            'postal_code' => '37201',
            'country' => 'US',
        ]);

        $this->assertSame(
            "123 Garden St\nSuite 4\nNashville, TN 37201",
            $app->formattedAddress()
        );
    }

    public function test_formatted_address_falls_back_to_legacy_address(): void
    {
        $app = new WholesaleApplication([
            'address' => "Old Town Rd\nSomewhere, TN 37000",
            'address_line_1' => null,
            'city' => null,
            'state' => null,
            'postal_code' => null,
        ]);

        $this->assertSame("Old Town Rd\nSomewhere, TN 37000", $app->formattedAddress());
    }
}
