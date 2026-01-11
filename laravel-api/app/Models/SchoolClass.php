<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SchoolClass extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'room',
        'academic_year_id',
        'establishment_id',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function establishment()
    {
        return $this->belongsTo(Establishment::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_enrollments', 'class_id', 'student_id')
                    ->withPivot('academic_year_id');
    }

    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class, 'class_id');
    }

    public function teacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class, 'class_id');
    }
}
