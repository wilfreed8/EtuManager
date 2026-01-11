<?php

namespace App\Http\Controllers;

use App\Models\TeacherAssignment;
use App\Models\Student;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherController extends Controller
{
    /**
     * Get assignments for the currently authenticated teacher
     * Returns class info with student count and grading progress
     */
    public function myAssignments(Request $request)
    {
        $userId = $request->user_id ?? Auth::id();
        
        $assignments = TeacherAssignment::where('user_id', $userId)
            ->with(['schoolClass', 'subject', 'academicYear'])
            ->get()
            ->map(function ($assignment) {
                // Get student count for this class
                $studentCount = Student::whereHas('enrollments', function ($q) use ($assignment) {
                    $q->where('class_id', $assignment->class_id)
                      ->where('academic_year_id', $assignment->academic_year_id);
                })->count();

                // Get grading progress (students with at least one grade in this subject)
                $studentsWithGrades = Grade::where('subject_id', $assignment->subject_id)
                    ->whereHas('student.enrollments', function ($q) use ($assignment) {
                        $q->where('class_id', $assignment->class_id)
                          ->where('academic_year_id', $assignment->academic_year_id);
                    })
                    ->distinct('student_id')
                    ->count('student_id');

                $gradingProgress = $studentCount > 0 
                    ? round(($studentsWithGrades / $studentCount) * 100) 
                    : 0;

                return [
                    'id' => $assignment->id,
                    'class_id' => $assignment->class_id,
                    'class_name' => $assignment->schoolClass->name ?? 'N/A',
                    'subject_id' => $assignment->subject_id,
                    'subject_name' => $assignment->subject->name ?? 'N/A',
                    'academic_year_id' => $assignment->academic_year_id,
                    'academic_year' => $assignment->academicYear->label ?? 'N/A',
                    'students' => $studentCount,
                    'students_graded' => $studentsWithGrades,
                    'grading_progress' => $gradingProgress,
                    'status' => $gradingProgress >= 100 ? 'completed' : 'pending',
                    'room' => $assignment->schoolClass->room ?? '-',
                ];
            });

        return response()->json($assignments);
    }
}
