<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query();

        if ($request->has('establishment_id')) {
            $query->where('establishment_id', $request->establishment_id);
        }

        if ($request->has('class_id')) {
            $query->whereHas('enrollments', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        return $query->with('enrollments.schoolClass')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:M,F',
            'address' => 'nullable|string',
            'establishment_id' => 'required|exists:establishments,id',
            'registration_number' => 'nullable|string|unique:students,registration_number',
            'parent_name' => 'nullable|string',
            'parent_phone' => 'nullable|string',
            'parent_address' => 'nullable|string',
            'class_id' => 'nullable|exists:classes,id',
        ]);

        $student = Student::create($validated);

        if ($request->has('class_id') && $request->class_id) {
            \App\Models\StudentEnrollment::create([
                'student_id' => $student->id,
                'class_id' => $request->class_id,
                'academic_year_id' => \App\Models\SchoolClass::find($request->class_id)->academic_year_id,
            ]);
        }

        return $student;
    }

    public function show(Student $student)
    {
        return $student->load('enrollments.schoolClass');
    }

    public function update(Request $request, Student $student)
    {
        $student->update($request->all());

        if ($request->has('class_id')) {
             // Handle class change logic if needed, simplify for now or assuming just profile update
             // If class change is needed, we need to update/create enrollment for current year
        }

        return $student;
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->noContent();
    }
}
