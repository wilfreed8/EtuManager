<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Grade extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'student_id',
        'subject_id',
        'period_id',
        'interro_avg',
        'devoir_avg',
        'compo_grade',
        'period_avg',
    ];

    protected $casts = [
        'interro_avg' => 'float',
        'devoir_avg' => 'float',
        'compo_grade' => 'float',
        'period_avg' => 'float',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function period()
    {
        return $this->belongsTo(Period::class);
    }
}
