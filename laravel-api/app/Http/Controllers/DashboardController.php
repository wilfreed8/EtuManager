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
        $establishmentId = $request->establishment_id;
        
        // Base queries - filter by establishment if provided
        $studentsQuery = Student::query();
        $classesQuery = SchoolClass::query();
        $gradesQuery = Grade::query();
        $subjectsQuery = Subject::query();
        
        if ($establishmentId) {
            $studentsQuery->where('establishment_id', $establishmentId);
            $classesQuery->where('establishment_id', $establishmentId);
            $subjectsQuery->where('establishment_id', $establishmentId);
        }
        
        $studentsCount = $studentsQuery->count();
        $classesCount = $classesQuery->count();
        $subjectsCount = $subjectsQuery->count();
        
        // Count teachers (users with ENSEIGNANT role)
        $teachersQuery = User::whereHas('roles', function($q) {
            $q->where('name', 'ENSEIGNANT');
        });
        if ($establishmentId) {
            $teachersQuery->where('establishment_id', $establishmentId);
        }
        $teachersCount = $teachersQuery->count();
        
        // Grade statistics
        $totalGrades = $gradesQuery->count();
        $gradesWithCompo = Grade::whereNotNull('compo_grade')->count();
        
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

