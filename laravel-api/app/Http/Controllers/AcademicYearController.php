<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\TeacherAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AcademicYearController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicYear::query();

        if ($request->has('establishment_id')) {
            $query->where('establishment_id', $request->establishment_id);
        } elseif ($request->user()) {
            $query->where('establishment_id', $request->user()->establishment_id);
        }

        return $query->orderBy('start_date', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string',
            'establishment_id' => 'sometimes|exists:establishments,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            'initial_active_period' => 'integer|min:1|max:3',
        ]);

        $establishmentId = $validated['establishment_id'] ?? $request->user()->establishment_id;

        $year = AcademicYear::create([
            'id' => Str::uuid(),
            'establishment_id' => $establishmentId,
            'label' => $validated['label'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        // Auto-generate periods
        $establishment = \App\Models\Establishment::find($establishmentId);
        $periodType = $establishment->period_type ?? 'TRIMESTRE';
        
        if ($periodType === 'TRIMESTRE') {
            $periods = [
                ['name' => '1er Trimestre', 'order' => 1],
                ['name' => '2ème Trimestre', 'order' => 2],
                ['name' => '3ème Trimestre', 'order' => 3],
            ];
        } else {
            $periods = [
                ['name' => '1er Semestre', 'order' => 1],
                ['name' => '2ème Semestre', 'order' => 2],
            ];
        }

        $initialActivePeriod = $request->input('initial_active_period', 1);

        foreach ($periods as $period) {
            Period::create([
                'id' => Str::uuid(),
                'academic_year_id' => $year->id,
                'name' => $period['name'],
                'order' => $period['order'],
                'is_active' => $period['order'] == $initialActivePeriod,
            ]);
        }

        // Zero start: No teacher copying.

        return response()->json($year->load('periods'), 201);
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

    /**
     * Set active academic year (Live Year)
     */
    public function activate(Request $request, $yearId)
    {
        $establishment = $request->user()->establishment;
        
        $year = AcademicYear::where('establishment_id', $establishment->id)
            ->findOrFail($yearId);

        \Illuminate\Support\Facades\DB::transaction(function () use ($establishment, $year) {
            // Deactivate all years for this establishment
            AcademicYear::where('establishment_id', $establishment->id)
                ->update(['is_active' => false]);

            // Activate the chosen year
            $year->is_active = true;
            $year->save();

            // Also update selected year for consistency
            $establishment->selected_academic_year_id = $year->id;
            $establishment->save();
        });

        return response()->json(['message' => 'Année académique activée (Live)', 'year' => $year]);
    }

    /**
     * Set selected academic year for operations (Workspace)
     */
    public function select(Request $request, $yearId)
    {
        $year = AcademicYear::where('establishment_id', $request->user()->establishment_id)
            ->findOrFail($yearId);

        $establishment = $request->user()->establishment;
        $establishment->selected_academic_year_id = $year->id;
        $establishment->save();

        return response()->json(['message' => 'Espace de travail mis à jour', 'year' => $year]);
    }
}
