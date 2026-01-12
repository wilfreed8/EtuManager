<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Establishment;

class SubjectController extends Controller
{
    /**
     * List all subjects for the establishment (Library)
     */
    public function index(Request $request)
    {
        $establishmentId = $request->user()->establishment_id;
        
        $subjects = Subject::where('establishment_id', $establishmentId)
            ->orderBy('name')
            ->get();
            
        return response()->json($subjects);
    }

    /**
     * Create a new subject
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20',
            'category' => 'nullable|string',
            'default_coefficient' => 'integer|min:1'
        ]);

        $subject = Subject::create([
            'name' => $request->name,
            'code' => $request->code,
            'category' => $request->category,
            'coefficient' => $request->default_coefficient ?? 1,
            'establishment_id' => $request->user()->establishment_id
        ]);

        return response()->json($subject, 201);
    }

    /**
     * Get configuration for a specific class (enabled subjects + coefficients)
     */
    public function getClassConfig(Request $request, $classId)
    {
        $schoolClass = SchoolClass::findOrFail($classId);
        
        // Get all subjects currently assigned to this class with pivot data
        $assignedSubjects = $schoolClass->subjects;
        
        return response()->json($assignedSubjects);
    }

    /**
     * Update configuration for a class (Assign/Update/Remove subjects)
     */
    public function updateClassConfig(Request $request, $classId)
    {
        $request->validate([
            'subjects' => 'required|array',
            'subjects.*.subject_id' => 'required|exists:subjects,id',
            'subjects.*.coefficient' => 'required|integer|min:1',
            'subjects.*.enabled' => 'boolean' // If false, detach
        ]);

        $schoolClass = SchoolClass::findOrFail($classId);
        
        DB::transaction(function () use ($schoolClass, $request) {
            foreach ($request->subjects as $item) {
                if (isset($item['enabled']) && $item['enabled'] === false) {
                    $schoolClass->subjects()->detach($item['subject_id']);
                } else {
                    // Sync without detaching others (false argument for sync is complicated, use syncWithoutDetaching or attach/update)
                    // We use syncWithoutDetaching to add, but updateExistingPivot to update coeff.
                    // Easiest is to check existence.
                    
                    $exists = $schoolClass->subjects()->where('subject_id', $item['subject_id'])->exists();
                    
                    if ($exists) {
                        $schoolClass->subjects()->updateExistingPivot($item['subject_id'], [
                            'coefficient' => $item['coefficient']
                        ]);
                    } else {
                        $schoolClass->subjects()->attach($item['subject_id'], [
                            'coefficient' => $item['coefficient']
                        ]);
                    }
                }
            }
        });

        return response()->json(['message' => 'Configuration mise à jour']);
    }

    /**
     * Import subjects from Excel
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'establishment_id' => 'required|exists:establishments,id'
        ]);

        try {
            $file = $request->file('file');
            $data = \Maatwebsite\Excel\Facades\Excel::toCollection(new \stdClass, $file);
            $rows = $data[0] ?? collect([]);

            // Skip header
            if ($rows->count() > 0 && str_contains(strtolower($rows[0][0] ?? ''), 'nom')) {
                $rows->shift();
            }

            $count = 0;
            DB::transaction(function () use ($rows, $request, &$count) {
                foreach ($rows as $row) {
                    // 0: Name, 1: Code, 2: Category, 3: Default Coeff
                    if (empty($row[0])) continue;

                    Subject::firstOrCreate(
                        [
                            'name' => trim($row[0]),
                            'establishment_id' => $request->establishment_id
                        ],
                        [
                            'code' => $row[1] ?? strtoupper(substr($row[0], 0, 3)),
                            'category' => $row[2] ?? 'AUTRES MATIERES',
                            'coefficient' => intval($row[3] ?? 1)
                        ]
                    );
                    $count++;
                }
            });

            return response()->json(['message' => "$count matières importées"]);

        } catch (\Exception $e) {
            return response()->json(['message' => "Erreur import: " . $e->getMessage()], 500);
        }
    }
}
