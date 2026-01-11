<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query();

        if ($request->has('establishment_id')) {
            $query->where('establishment_id', $request->establishment_id);
        }

        if ($request->has('class_id')) {
            $query->whereHas('enrollments', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        return $query->with('enrollments.schoolClass')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:M,F',
            'address' => 'nullable|string',
            'establishment_id' => 'required|exists:establishments,id',
            'registration_number' => 'nullable|string|unique:students,registration_number',
            'parent_name' => 'nullable|string',
            'parent_phone' => 'nullable|string',
            'parent_address' => 'nullable|string',
            'class_id' => 'nullable|exists:classes,id',
        ]);

        $student = Student::create($validated);

        if ($request->has('class_id') && $request->class_id) {
            \App\Models\StudentEnrollment::create([
                'student_id' => $student->id,
                'class_id' => $request->class_id,
                'academic_year_id' => \App\Models\SchoolClass::find($request->class_id)->academic_year_id,
            ]);
        }

        return $student;
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
                 if (is_string($firstRow[0]) && str_contains(strtolower($firstRow[0]), 'first_name')) {
                     $rows->shift();
                 }
            }

            $count = 0;
            $establishment = \App\Models\Establishment::find($request->establishment_id);
            $activeYearId = $establishment->active_academic_year->id ?? null;

            foreach ($rows as $row) {
                // columns: 0:first_name, 1:last_name, 2:gender, 3:birth_date, 4:address, 5:phone, 6:parent_name, 7:parent_phone, 8:classe_name
                if (!isset($row[0]) || !isset($row[1])) continue;

                $registrationNumber = 'REG-' . now()->year . '-' . mt_rand(1000, 9999);
                
                $birthDate = $row[3] ?? null;
                if (is_numeric($birthDate)) {
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
                    'establishment_id' => $request->establishment_id,
                    'registration_number' => $registrationNumber,
                ]);

                // Handle Class Assignment by Name
                $className = $row[8] ?? null;
                if ($className && $activeYearId) {
                    $schoolClass = \App\Models\SchoolClass::where('establishment_id', $request->establishment_id)
                        ->where('academic_year_id', $activeYearId)
                        ->where('name', 'like', trim($className))
                        ->first();

                    if ($schoolClass) {
                        \App\Models\StudentEnrollment::create([
                            'student_id' => $student->id,
                            'class_id' => $schoolClass->id,
                            'academic_year_id' => $activeYearId,
                        ]);
                    }
                }

                $count++;
            }

            return response()->json(['message' => "$count élèves importés avec succès"]);
        } catch (\Exception $e) {
             return response()->json(['message' => "Erreur import: " . $e->getMessage()], 500);
        }
    }
}
