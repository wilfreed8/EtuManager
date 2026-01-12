<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $establishmentId = $user->establishment_id;
        
        // Priority: Request > Selected Year > Active Year
        $est = $user->establishment;
        $activeYear = $est->selected_academic_year_id 
            ? $est->selectedAcademicYear 
            : $est->activeAcademicYear;

        $academicYearId = $request->academic_year_id ?? ($activeYear ? $activeYear->id : null);

        $query = SchoolClass::query()->withCount('students');
        
        if ($establishmentId) {
            $query->where('establishment_id', $establishmentId);
        }

        // Strict isolation
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $est = $request->user()->establishment;
        $activeYear = $est->selected_academic_year_id 
            ? $est->selectedAcademicYear 
            : $est->activeAcademicYear;
        $activeYearId = $activeYear ? $activeYear->id : null;
        if (!$activeYearId) {
            return response()->json(['message' => 'Aucune année académique active. Veuillez en créer une dans les paramètres.'], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        return SchoolClass::create([
            ...$validated,
            'academic_year_id' => $activeYear->id,
            'establishment_id' => $user->establishment_id,
        ]);
    }

    public function show(SchoolClass $schoolClass)
    {
        return $schoolClass;
    }

    public function update(Request $request, SchoolClass $schoolClass)
    {
        $schoolClass->update($request->all());
        return $schoolClass;
    }

    public function destroy(SchoolClass $schoolClass)
    {
        $schoolClass->delete();
        return response()->noContent();
    }
}
