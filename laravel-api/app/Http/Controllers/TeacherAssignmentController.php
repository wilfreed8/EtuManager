<?php

namespace App\Http\Controllers;

use App\Models\TeacherAssignment;
use Illuminate\Http\Request;

class TeacherAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = TeacherAssignment::query();
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        return $query->with(['teacher', 'schoolClass', 'subject'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ]);

        return TeacherAssignment::create($validated);
    }

    public function destroy(TeacherAssignment $assignment)
    {
        $assignment->delete();
        return response()->noContent();
    }
}
