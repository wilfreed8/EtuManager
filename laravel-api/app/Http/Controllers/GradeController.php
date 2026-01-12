<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $userId = $request->user_id ?? $user->id;
        
        // Priority: Selected Year > Active Year
        $est = $user->establishment;
        $activeYear = $est->selected_academic_year_id 
            ? $est->selectedAcademicYear 
            : $est->activeAcademicYear;

        $academicYearId = $activeYear ? $activeYear->id : null;

        $query = Grade::query();
        
        // Strict isolation: filter by academic year through period
        if ($academicYearId) {
            $query->whereHas('period', function($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            });
        }
        
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->has('period_id')) {
            $query->where('period_id', $request->period_id);
        }

        return $query->with(['subject', 'period', 'student'])->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $activeYear = $user->establishment->activeAcademicYear;

        if (!$activeYear) {
            return response()->json(['message' => 'Aucune année académique active.'], 400);
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'period_id' => 'required|exists:periods,id',
            'interro_avg' => 'nullable|numeric|between:0,20',
            'devoir_avg' => 'nullable|numeric|between:0,20',
            'compo_grade' => 'nullable|numeric|between:0,20',
        ]);

        // Verify period belongs to active year
        $period = \App\Models\Period::find($validated['period_id']);
        if ($period->academic_year_id !== $activeYear->id) {
            return response()->json(['message' => 'La période sélectionnée n\'appartient pas à l\'année académique active.'], 400);
        }

        return Grade::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'subject_id' => $validated['subject_id'],
                'period_id' => $validated['period_id'],
            ],
            [
                'interro_avg' => $validated['interro_avg'] ?? 0,
                'devoir_avg' => $validated['devoir_avg'] ?? 0,
                'compo_grade' => $validated['compo_grade'],
            ]
        );
    }
}
