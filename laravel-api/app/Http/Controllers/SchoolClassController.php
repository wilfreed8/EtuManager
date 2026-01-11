<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function index(Request $request)
    {
        $query = SchoolClass::query()->withCount('students');
        if ($request->has('academic_year_id')) {
            $query->where('academic_year_id', $request->academic_year_id);
        }
        if ($request->has('establishment_id')) {
            $query->where('establishment_id', $request->establishment_id);
        }
        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'academic_year_id' => 'required|exists:academic_years,id',
            'establishment_id' => 'required|exists:establishments,id',
        ]);

        return SchoolClass::create($validated);
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
