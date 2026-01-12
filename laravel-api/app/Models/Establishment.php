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
        'city',
        'bp',
        'phone',
        'logo_url',
        'grading_config',
        'period_type',
        'selected_academic_year_id',
        'bulletin_template',
        'logo',
    ];

    protected $casts = [
        'grading_config' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function academicYears()
    {
        return $this->hasMany(AcademicYear::class);
    }

    public function activeAcademicYear()
    {
        return $this->hasOne(AcademicYear::class)->where('is_active', true);
    }

    public function selectedAcademicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'selected_academic_year_id');
    }
}
