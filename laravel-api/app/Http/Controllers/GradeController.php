<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $query = Grade::query();
        
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->has('period_id')) {
            $query->where('period_id', $request->period_id);
        }

        return $query->with(['subject', 'period'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'period_id' => 'required|exists:periods,id',
            'interro_avg' => 'nullable|numeric|between:0,20',
            'devoir_avg' => 'nullable|numeric|between:0,20',
            'compo_grade' => 'nullable|numeric|between:0,20',
            // period_avg calculated?
        ]);

        // Logic to calculate average could go here or in model observer
        // For now, accept what's sent or calc if missing
        
        return Grade::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'subject_id' => $request->subject_id,
                'period_id' => $request->period_id,
            ],
            $validated
        );
    }
}
