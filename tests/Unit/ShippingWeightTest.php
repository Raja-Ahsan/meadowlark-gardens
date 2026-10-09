<?php

namespace Tests\Unit;

use App\Support\ShippingWeight;
use PHPUnit\Framework\TestCase;

class ShippingWeightTest extends TestCase
{
    public function test_pounds_passthrough(): void
    {
        $this->assertSame(2.5, ShippingWeight::toPounds(2.5, 'lb'));
        $this->assertSame(2.5, ShippingWeight::toPounds(2.5, 'lbs'));
    }

    public function test_kg_to_pounds(): void
    {
        $this->assertEqualsWithDelta(2.20462, ShippingWeight::toPounds(1, 'kg'), 0.001);
    }

    public function test_oz_to_pounds(): void
    {
        $this->assertSame(1.0, ShippingWeight::toPounds(16, 'oz'));
    }

    public function test_grams_to_pounds(): void
    {
        $this->assertEqualsWithDelta(1.0, ShippingWeight::toPounds(453.59237, 'g'), 0.001);
    }

    public function test_normalize_enforces_minimum(): void
    {
        $this->assertSame(0.1, ShippingWeight::normalizeLbs(0));
        $this->assertSame(0.1, ShippingWeight::normalizeLbs(-5));
        $this->assertSame(3.25, ShippingWeight::normalizeLbs(3.251));
    }
}
