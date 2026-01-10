<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Period;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;

class BulletinController extends Controller
{
    public function generate(Request $request, Student $student, Period $period)
    {
        // 1. Get all grades for this student in this period
        $grades = Grade::where('student_id', $student->id)
            ->where('period_id', $period->id)
            ->with('subject')
            ->get();

        // 2. Fetch all subjects for the student's class (via enrollment)
        // Assuming student has one enrollment for the period's academic year
        $enrollment = $student->enrollments()
            ->where('academic_year_id', $period->academic_year_id)
            ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Student not enrolled for this period\'s year.'], 404);
        }

        $class = $enrollment->schoolClass;
        $subjects = Subject::where('establishment_id', $student->establishment_id)->get(); // Simplify: Get all estab subjects or filter by class? 
        // Better: Get subjects that have grades or defined for the class? 
        // For now, let's use the grades we found. If a student has no grade in a subject, it won't show.
        // Ideally, we should show all subjects.

        // 3. Calculate Averages
        $report = $grades->map(function ($grade) {
            $avg = $this->calculateSubjectAverage($grade);
            return [
                'subject' => $grade->subject->name,
                'coefficient' => $grade->subject->coefficient,
                'interro' => $grade->interro_avg,
                'devoir' => $grade->devoir_avg,
                'compo' => $grade->compo_grade,
                'average' => $avg,
                'weighted_average' => $avg * $grade->subject->coefficient,
            ];
        });

        $totalCoeff = $report->sum('coefficient');
        $totalPoints = $report->sum('weighted_average');
        $overallAverage = $totalCoeff > 0 ? $totalPoints / $totalCoeff : 0;

        // 4. Return View
        return view('bulletin', [
            'student' => $student,
            'period' => $period,
            'class' => $class,
            'report' => $report,
            'overallAverage' => $overallAverage,
            'establishment' => $student->establishment,
        ]);
    }

    private function calculateSubjectAverage(Grade $grade)
    {
        // Config could be dynamic, hardcoding standard Ivoirian/French system for now or from Establishment config
        // Interro (25%), Devoir (25%), Compo (50%)
        $i = $grade->interro_avg ?? 0;
        $d = $grade->devoir_avg ?? 0;
        $c = $grade->compo_grade ?? 0;
        
        // Simple weighted avg
        return ($i * 1 + $d * 1 + $c * 2) / 4; 
    }
}
