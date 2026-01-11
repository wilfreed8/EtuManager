<?php

namespace App\Http\Controllers;

use App\Models\Period;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
    public function index(Request $request)
    {
        $query = Period::query();
        if ($request->has('academic_year_id')) {
            $query->where('academic_year_id', $request->academic_year_id);
        }
        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'academic_year_id' => 'required|exists:academic_years,id',
            'start_date' => 'date|nullable',
            'end_date' => 'date|nullable',
        ]);

        return Period::create($validated);
    }

    public function show(Period $period)
    {
        return $period;
    }

    public function update(Request $request, Period $period)
    {
        $period->update($request->all());
        return $period;
    }

    public function activate(Period $period)
    {
        // Only admins can activate a period
        if (!in_array(auth()->user()->role, ['PROVISEUR', 'CENSEUR', 'ADMIN', 'SUPER_ADMIN'])) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Deactivate all periods in the same academic year
        Period::where('academic_year_id', $period->academic_year_id)
            ->update(['is_active' => false]);

        // Activate the chosen one
        $period->update(['is_active' => true]);

        return response()->json(['message' => "Période {$period->name} activée", 'period' => $period]);
    }

    public function getActive(Request $request)
    {
        $establishmentId = $request->query('establishment_id');
        if (!$establishmentId && auth()->check()) {
            $establishmentId = auth()->user()->establishment_id;
        }

        if (!$establishmentId) {
            return response()->json(['message' => 'Établissement non spécifié'], 400);
        }

        $activePeriod = Period::whereHas('academicYear', function ($q) use ($establishmentId) {
            $q->where('establishment_id', $establishmentId)
              ->where('is_active', true); // active academic year
        })
        ->where('is_active', true)
        ->first();

        return $activePeriod;
    }
}
