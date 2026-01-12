<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
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

        $query = Student::query();

        if ($establishmentId) {
            $query->where('establishment_id', $establishmentId);
        }

        // Strict isolation: Only show students enrolled in the target/active year
        if ($academicYearId) {
            $query->whereHas('enrollments', function ($q) use ($academicYearId, $request) {
                $q->where('academic_year_id', $academicYearId);
                if ($request->has('class_id')) {
                    $q->where('class_id', $request->class_id);
                }
            });
        }

        return $query->with(['enrollments' => function($q) use ($academicYearId) {
            if ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            }
        }, 'enrollments.schoolClass'])->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $establishment = $user->establishment;
        
        // Use selected year if available, otherwise active year
        $targetYear = $establishment->selected_academic_year_id 
            ? $establishment->selectedAcademicYear 
            : $establishment->activeAcademicYear;

        if (!$targetYear) {
            return response()->json(['message' => 'Aucune année académique sélectionnée ou active.'], 400);
        }

        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:M,F',
            'address' => 'nullable|string',
            'registration_number' => 'nullable|string|unique:students,registration_number',
            'parent_name' => 'nullable|string',
            'parent_phone' => 'nullable|string',
            'parent_address' => 'nullable|string',
            'class_id' => 'required|exists:classes,id',
        ]);

        $student = Student::create([
            ...$validated,
            'establishment_id' => $user->establishment_id,
        ]);

        if ($request->has('class_id') && $request->class_id) {
            \App\Models\StudentEnrollment::create([
                'student_id' => $student->id,
                'class_id' => $request->class_id,
                'academic_year_id' => $targetYear->id,
            ]);
        }

        return response()->json($student->load('enrollments.schoolClass'), 201);
    }

    public function show(Student $student)
    {
        return $student->load('enrollments.schoolClass');
    }

    public function update(Request $request, Student $student)
    {
        $student->update($request->all());

        if ($request->has('class_id') && $request->class_id) {
            $academicYear = \App\Models\SchoolClass::find($request->class_id)->academic_year_id;
            
            // Check if enrollment exists for this year
            $enrollment = \App\Models\StudentEnrollment::where('student_id', $student->id)
                ->where('academic_year_id', $academicYear)
                ->first();

            if ($enrollment) {
                $enrollment->update(['class_id' => $request->class_id]);
            } else {
                \App\Models\StudentEnrollment::create([
                    'student_id' => $student->id,
                    'class_id' => $request->class_id,
                    'academic_year_id' => $academicYear,
                ]);
            }
        }

        return $student->load('enrollments.schoolClass');
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->noContent();
    }

    public function import(Request $request) 
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls',
            'establishment_id' => 'required|exists:establishments,id'
        ]);

        $file = $request->file('file');
        
        try {
            $data = \Maatwebsite\Excel\Facades\Excel::toCollection(new \stdClass, $file);
            $rows = $data[0] ?? collect([]);
            
            if ($rows->count() > 0) {
                 $firstRow = $rows->first();
                 if ($firstRow && isset($firstRow[0]) && is_string($firstRow[0]) && str_contains(strtolower($firstRow[0]), 'first_name')) {
                     $rows->shift();
                 }
            }

            $count = 0;
            $establishment = \App\Models\Establishment::find($request->establishment_id);
            
            // Priority: Selected Year > Active Year
            $targetYear = $establishment->selected_academic_year_id 
                ? $establishment->selectedAcademicYear 
                : $establishment->activeAcademicYear;
            
            $targetYearId = $targetYear ? $targetYear->id : null;

            if (!$targetYearId) {
                return response()->json(['message' => "Aucune année académique sélectionnée ou active."], 400);
            }

            $errors = [];
            foreach ($rows as $index => $row) {
                // Skip empty rows
                if (!isset($row[0]) && !isset($row[1])) continue;
                
                $rowNum = $index + 2; // +1 for 0-index, +1 for header
                
                $validator = \Illuminate\Support\Facades\Validator::make([
                    'first_name' => $row[0] ?? null,
                    'last_name' => $row[1] ?? null,
                    'gender' => $row[2] ?? null,
                    'birth_date' => $row[3] ?? null,
                ], [
                    'first_name' => 'required|string',
                    'last_name' => 'required|string',
                    'gender' => 'nullable|in:M,F',
                ], [
                    'first_name.required' => "Ligne $rowNum: Le Prénom est manquant.",
                    'last_name.required' => "Ligne $rowNum: Le Nom est manquant.",
                    'gender.in' => "Ligne $rowNum: Le sexe doit être 'M' ou 'F'.",
                ]);

                if ($validator->fails()) {
                    foreach ($validator->errors()->all() as $error) {
                        $errors[] = $error;
                    }
                }
            }

            if (!empty($errors)) {
                return response()->json(['message' => 'Erreurs de validation', 'errors' => $errors], 422);
            }

            return \Illuminate\Support\Facades\DB::transaction(function () use ($rows, $request, $targetYearId, &$count) {
                foreach ($rows as $row) {
                    // columns: 0:first_name, 1:last_name, 2:gender, 3:birth_date, 4:address, 5:phone, 6:parent_name, 7:parent_phone, 8:classe_name, 9:parent_address (optional)
                    if (!isset($row[0]) || !isset($row[1]) || empty($row[0]) || empty($row[1])) continue;

                    // Stronger Registration Number: REG-[YEAR]-[RAND]-[SHORTID]
                    $registrationNumber = 'REG-' . now()->format('y') . '-' . strtoupper(\Illuminate\Support\Str::random(4)) . '-' . mt_rand(100, 999);
                    
                    // Ensure uniqueness
                    while (\App\Models\Student::where('registration_number', $registrationNumber)->exists()) {
                        $registrationNumber = 'REG-' . now()->format('y') . '-' . strtoupper(\Illuminate\Support\Str::random(4)) . '-' . mt_rand(100, 999);
                    }

                    $birthDate = $row[3] ?? null;
                    if ($birthDate && is_numeric($birthDate)) {
                        $birthDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($birthDate)->format('Y-m-d');
                    }

                    $student = Student::create([
                        'first_name' => $row[0],
                        'last_name' => $row[1],
                        'gender' => $row[2] ?? 'M',
                        'birth_date' => $birthDate,
                        'address' => $row[4] ?? null,
                        'phone' => $row[5] ?? null,
                        'parent_name' => $row[6] ?? null,
                        'parent_phone' => $row[7] ?? null,
                        'parent_address' => $row[9] ?? null, // Added support for 10th column if exists
                        'establishment_id' => $request->establishment_id,
                        'registration_number' => $registrationNumber,
                    ]);

                    // Handle Class Assignment by Name
                    $className = $row[8] ?? null;
                    if ($className) {
                        $schoolClass = \App\Models\SchoolClass::where('establishment_id', $request->establishment_id)
                            ->where('academic_year_id', $targetYearId)
                            ->where('name', 'like', trim($className))
                            ->first();

                        if ($schoolClass) {
                            \App\Models\StudentEnrollment::create([
                                'student_id' => $student->id,
                                'class_id' => $schoolClass->id,
                                'academic_year_id' => $targetYearId,
                            ]);
                        }
                    }

                    $count++;
                }

                return response()->json(['message' => "$count élèves importés avec succès"]);
            });
        } catch (\Exception $e) {
             return response()->json(['message' => "Erreur import: " . $e->getMessage()], 500);
        }
    }
}
