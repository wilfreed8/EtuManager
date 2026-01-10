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

    public function destroy(Period $period)
    {
        $period->delete();
        return response()->noContent();
    }
}
