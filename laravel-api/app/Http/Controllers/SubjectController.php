<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Establishment;

class SubjectController extends Controller
{
    private function resolveAcademicYearId(Request $request): ?string
    {
        $yearId = $request->query('academic_year_id') ?? $request->input('academic_year_id');
        if ($yearId) {
            return $yearId;
        }

        $est = $request->user()?->establishment;
        if (!$est) {
            return null;
        }

        return $est->selected_academic_year_id ?: optional($est->activeAcademicYear)->id;
    }

    /**
     * List all subjects for the establishment (Library)
     */
    public function index(Request $request)
    {
        $establishmentId = $request->user()->establishment_id;
        $yearId = $this->resolveAcademicYearId($request);

        // Strict isolation by academic year
        if (!$yearId) {
            return response()->json([]);
        }
        
        $subjects = Subject::where('establishment_id', $establishmentId)
            ->where('academic_year_id', $yearId)
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
            'default_coefficient' => 'integer|min:1',
            'academic_year_id' => 'nullable|exists:academic_years,id',
        ]);

        $yearId = $this->resolveAcademicYearId($request);
        if (!$yearId) {
            return response()->json(['message' => 'Aucune année académique sélectionnée.'], 400);
        }

        $subject = Subject::create([
            'name' => $request->name,
            'code' => $request->code,
            'category' => $request->category,
            'coefficient' => $request->default_coefficient ?? 1,
            'establishment_id' => $request->user()->establishment_id,
            'academic_year_id' => $yearId,
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
        $assignedSubjects = $schoolClass->subjects()
            ->where('subjects.academic_year_id', $schoolClass->academic_year_id)
            ->get();
        
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

        // Only subjects from the same academic year can be configured for this class
        $subjectIds = collect($request->subjects)
            ->filter(fn ($i) => !isset($i['enabled']) || $i['enabled'] !== false)
            ->pluck('subject_id')
            ->unique()
            ->values();

        if ($subjectIds->isNotEmpty()) {
            $wrongCount = Subject::whereIn('id', $subjectIds)
                ->where('academic_year_id', '!=', $schoolClass->academic_year_id)
                ->count();

            if ($wrongCount > 0) {
                return response()->json([
                    'message' => 'Certaines matières ne correspondent pas à l\'année académique de la classe.'
                ], 422);
            }
        }
        
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
            'establishment_id' => 'required|exists:establishments,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
        ]);

        $yearId = $this->resolveAcademicYearId($request);
        if (!$yearId) {
            return response()->json(['message' => 'Aucune année académique sélectionnée.'], 400);
        }

        try {
            $file = $request->file('file');
            $data = \Maatwebsite\Excel\Facades\Excel::toCollection(new \stdClass, $file);
            $rows = $data[0] ?? collect([]);

            // Skip header
            if ($rows->count() > 0 && str_contains(strtolower($rows[0][0] ?? ''), 'nom')) {
                $rows->shift();
            }

            $count = 0;
            DB::transaction(function () use ($rows, $request, $yearId, &$count) {
                foreach ($rows as $row) {
                    // 0: Name, 1: Code, 2: Category, 3: Default Coeff
                    if (empty($row[0])) continue;

                    Subject::firstOrCreate(
                        [
                            'name' => trim($row[0]),
                            'establishment_id' => $request->establishment_id,
                            'academic_year_id' => $yearId,
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
