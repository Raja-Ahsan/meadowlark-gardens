<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WholesaleApplication extends Model
{
    protected $fillable = [
        'business_name',
        'contact_name',
        'email',
        'phone',
        'address',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'business_type',
        'license_document',
        'estimated_monthly_order',
        'message',
        'password',
        'status',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Display address for admin/emails. Prefers structured fields; falls back to legacy `address`.
     */
    public function formattedAddress(): string
    {
        if (filled($this->address_line_1) || filled($this->city) || filled($this->state) || filled($this->postal_code)) {
            $country = strtoupper(trim((string) ($this->country ?: '')));
            $cityState = trim(implode(', ', array_filter([
                trim((string) $this->city),
                trim((string) $this->state),
            ], fn ($part) => $part !== '')));
            $postal = trim((string) $this->postal_code);
            $cityLine = trim($cityState.($postal !== '' ? ' '.$postal : ''));

            $lines = array_values(array_filter([
                trim((string) $this->address_line_1),
                trim((string) $this->address_line_2),
                $cityLine,
                ($country !== '' && $country !== 'US') ? $country : '',
            ], fn ($line) => $line !== ''));

            return implode("\n", $lines);
        }

        return trim((string) $this->address);
    }
}
