<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Subject extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'code',
        'coefficient',
        'category',
        'establishment_id',
        'academic_year_id',
    ];

    public function establishment()
    {
        return $this->belongsTo(Establishment::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function teacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}

