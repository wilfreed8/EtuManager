<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Student extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'first_name',
        'last_name',
        'birth_date',
        'gender',
        'address',
        'phone',
        'email',
        'photo_url',
        'registration_number',
        'establishment_id',
        'parent_name',
        'parent_phone',
        'parent_email',
        'parent_profession',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function establishment()
    {
        return $this->belongsTo(Establishment::class);
    }

    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function classes()
    {
        return $this->belongsToMany(SchoolClass::class, 'student_enrollments', 'student_id', 'class_id')
                    ->withPivot('academic_year_id');
    }
}
