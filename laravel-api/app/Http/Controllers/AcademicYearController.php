<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicYear::query();

        if ($request->has('establishment_id')) {
            $query->where('establishment_id', $request->establishment_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string',
            'establishment_id' => 'required|exists:establishments,id',
            'is_active' => 'boolean',
        ]);

        return AcademicYear::create($validated);
    }

    public function show(AcademicYear $academicYear)
    {
        return $academicYear;
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $academicYear->update($request->all());
        return $academicYear;
    }

    public function destroy(AcademicYear $academicYear)
    {
        $academicYear->delete();
        return response()->noContent();
    }
}
