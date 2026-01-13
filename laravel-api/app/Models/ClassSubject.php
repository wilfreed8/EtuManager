<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSubject extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'class_id',
        'subject_id',
        'coefficient',
        'academic_year_id',
    ];

    protected $casts = [
        'id' => 'string',
        'coefficient' => 'integer',
        'academic_year_id' => 'string',
        'class_id' => 'string',
        'subject_id' => 'string',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function class()
    {
        return $this->belongsTo(SchoolClass::class);
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
