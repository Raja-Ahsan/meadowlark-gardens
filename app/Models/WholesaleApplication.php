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
        'business_type',
        'estimated_monthly_order',
        'message',
        'status',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }
}
