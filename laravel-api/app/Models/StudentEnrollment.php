<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class StudentEnrollment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'student_id',
        'class_id',
        'academic_year_id',
    ];

    /**
     * Validation rules for preventing duplicate enrollments
     */
    public static function rules()
    {
        return [
            'student_id' => 'required|exists:students,id',
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ];
    }

    /**
     * Check if student is already enrolled in a class for this academic year
     */
    public static function studentAlreadyEnrolled($studentId, $academicYearId)
    {
        return self::where('student_id', $studentId)
            ->where('academic_year_id', $academicYearId)
            ->exists();
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
