<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Establishment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'type',
        'address',
        'phone',
        'logo_url',
        'grading_config',
        'period_type',
    ];

    protected $casts = [
        'grading_config' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
