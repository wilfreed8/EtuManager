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
            'bulletin_template' => 'sometimes|string|in:template1,template2,template3',
        ]);

        $establishment->update($validated);

        return $establishment;
    }

    public function destroy(Establishment $establishment)
    {
        $establishment->delete();

        return response()->noContent();
    }

    /**
     * Upload establishment logo
     */
    public function uploadLogo(Request $request, $id)
    {
        $request->validate([
            'logo' => 'required|image|max:2048', // 2MB max
        ]);

        $establishment = Establishment::findOrFail($id);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = 'logo_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('logos', $filename, 'public');

            // Delete old logo if exists
            if ($establishment->logo) {
                \Storage::disk('public')->delete($establishment->logo);
            }

            $establishment->logo = $path;
            $establishment->save();

            return response()->json([
                'message' => 'Logo uploaded successfully',
                'logo' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
}
