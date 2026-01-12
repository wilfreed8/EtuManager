<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $establishmentId = $request->establishment_id ?? $request->user()->establishment_id;
        $activeYear = null;

        // Determine academic year
        if ($request->has('academic_year_id')) {
            $yearId = $request->academic_year_id;
        } else {
            // Fallback to active/selected year of the establishment
            $est = $request->user()->establishment;
            
            $activeYear = $est->selected_academic_year_id 
                ? $est->selectedAcademicYear 
                : $est->activeAcademicYear;
            $yearId = $activeYear ? $activeYear->id : null;
        }
        
        // Base queries
        $studentsQuery = Student::query();
        $classesQuery = SchoolClass::query();
        $gradesQuery = Grade::query();
        $subjectsQuery = Subject::query();

        if ($establishmentId) {
            $studentsQuery->where('establishment_id', $establishmentId);
            $classesQuery->where('establishment_id', $establishmentId);
            $subjectsQuery->where('establishment_id', $establishmentId);
        }

        if ($yearId) {
            // Students are year-bound via enrollment
            $studentsQuery->whereHas('enrollments', function($q) use ($yearId) {
                $q->where('academic_year_id', $yearId);
            });
            
            // Classes ARE directly year-bound
            $classesQuery->where('academic_year_id', $yearId);
            
            // Grades are linked to period -> academic_year
            $gradesQuery->whereHas('period', function($q) use ($yearId) {
                $q->where('academic_year_id', $yearId);
            });
        }
        
        $studentsCount = $studentsQuery->count();
        $classesCount = $classesQuery->count();
        $subjectsCount = $subjectsQuery->count(); // Keep subjects establishment-bound if not year-bound
        
        // Count teachers (users with ENSEIGNANT role)
        // Teachers are Users, they don't BELONG to a year directly unless we check assignments.
        // But usually "Total Teachers" means "Teachers in the school".
        // If we want "Teachers active this year", we check TeacherAssignment.
        // For now, let's keep it as "Teachers in Establishment" (global) as users persist across years.
        $teachersQuery = User::whereHas('roles', function($q) {
            $q->where('name', 'ENSEIGNANT');
        });
        if ($establishmentId) {
            $teachersQuery->where('establishment_id', $establishmentId);
        }
        $teachersCount = $teachersQuery->count();
        
        // Grade statistics
        $totalGrades = $gradesQuery->count();
        $gradesWithCompo = (clone $gradesQuery)->whereNotNull('compo_grade')->count();
        
        return response()->json([
            'students_count' => $studentsCount,
            'classes_count' => $classesCount,
            'teachers_count' => $teachersCount,
            'subjects_count' => $subjectsCount,
            'grades_submitted' => $gradesWithCompo,
            'grades_pending' => $studentsCount * $subjectsCount - $gradesWithCompo,
        ]);
    }
    
    /**
     * Platform-wide stats for SuperAdmin
     */
    public function platformStats()
    {
        return response()->json([
            'establishments_count' => Establishment::count(),
            'total_students' => Student::count(),
            'total_teachers' => User::whereHas('roles', fn($q) => $q->where('name', 'ENSEIGNANT'))->count(),
            'total_users' => User::count(),
        ]);
    }
}

