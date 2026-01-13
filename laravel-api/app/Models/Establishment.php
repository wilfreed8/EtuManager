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
        'is_active',
        'block_message',
        'blocked_at',
        'unblocked_at',
    ];

    protected $casts = [
        'grading_config' => 'array',
        'is_active' => 'boolean',
        'blocked_at' => 'datetime',
        'unblocked_at' => 'datetime',
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

    public function students()
    {
        return $this->hasManyThrough(Student::class, User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeBlocked($query)
    {
        return $query->where('is_active', false);
    }

    public function block($message = null)
    {
        $this->update([
            'is_active' => false,
            'block_message' => $message,
            'blocked_at' => now(),
            'unblocked_at' => null,
        ]);
    }

    public function unblock()
    {
        $this->update([
            'is_active' => true,
            'block_message' => null,
            'blocked_at' => null,
            'unblocked_at' => now(),
        ]);
    }

    public function isBlocked()
    {
        return !$this->is_active;
    }
}
