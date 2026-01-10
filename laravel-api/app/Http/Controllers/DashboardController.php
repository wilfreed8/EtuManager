<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\TeacherAssignment; // Count unique teachers? Or User where role teacher
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'students_count' => Student::count(),
            'classes_count' => SchoolClass::count(),
            'teachers_count' => User::whereHas('roles', function($q) {
                $q->where('name', 'ENSEIGNANT');
            })->count(),
            // Ensure Role 'ENSEIGNANT' exists from seeder
        ]);
    }
}
