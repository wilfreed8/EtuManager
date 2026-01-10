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
            'establishment_id' => 'required|exists:establishments,id',
            'registration_number' => 'nullable|string|unique:students,registration_number',
            // Parent info validation...
            'parent_name' => 'nullable|string',
        ]);

        return Student::create($validated);
    }

    public function show(Student $student)
    {
        return $student->load('enrollments.schoolClass');
    }

    public function update(Request $request, Student $student)
    {
        $student->update($request->all());
        return $student;
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->noContent();
    }
}
