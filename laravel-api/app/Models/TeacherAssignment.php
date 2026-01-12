<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TeacherAssignment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'class_id',
        'subject_id',
        'academic_year_id',
    ];

    /**
     * Validation rules for preventing duplicate assignments
     */
    public static function rules()
    {
        return [
            'user_id' => 'required|exists:users,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ];
    }

    /**
     * Check if assignment already exists
     */
    public static function exists($userId, $classId, $subjectId, $academicYearId)
    {
        return self::where('user_id', $userId)
            ->where('class_id', $classId)
            ->where('subject_id', $subjectId)
            ->where('academic_year_id', $academicYearId)
            ->exists();
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
