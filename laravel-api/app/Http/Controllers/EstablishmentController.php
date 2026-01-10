<?php

namespace App\Http\Controllers;

use App\Models\Establishment;
use Illuminate\Http\Request;

class EstablishmentController extends Controller
{
    public function index()
    {
        return Establishment::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|string', // PRIMAIRE, COLLEGE, LYCEE
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'grading_config' => 'nullable|array',
            'period_type' => 'required|string|in:TRIMESTRE,SEMESTRE',
        ]);

        $establishment = Establishment::create($validated);

        return response()->json($establishment, 201);
    }

    public function show(Establishment $establishment)
    {
        return $establishment;
    }

    public function update(Request $request, Establishment $establishment)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'grading_config' => 'nullable|array',
            'period_type' => 'sometimes|string|in:TRIMESTRE,SEMESTRE',
        ]);

        $establishment->update($validated);

        return $establishment;
    }

    public function destroy(Establishment $establishment)
    {
        $establishment->delete();

        return response()->noContent();
    }
}
