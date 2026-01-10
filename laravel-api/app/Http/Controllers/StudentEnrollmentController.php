<?php

namespace App\Http\Controllers;

use App\Models\StudentEnrollment;
use Illuminate\Http\Request;

class StudentEnrollmentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ]);

        // Prevent duplicate enrollment for same year
        $exists = StudentEnrollment::where('student_id', $request->student_id)
            ->where('academic_year_id', $request->academic_year_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'L\'élève est déjà inscrit pour cette année.'], 422);
        }

        return StudentEnrollment::create($validated);
    }

    public function destroy(StudentEnrollment $enrollment)
    {
        $enrollment->delete();
        return response()->noContent();
    }
}
