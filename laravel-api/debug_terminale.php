<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\AcademicYear;

echo "=== TERMINALE CLASS INVESTIGATION ===" . PHP_EOL . PHP_EOL;

// Find Terminale class
$terminaleClass = SchoolClass::where('name', 'like', '%Terminale%')
    ->orWhere('name', 'like', '%Tle%')
    ->first();

if (!$terminaleClass) {
    echo "No Terminale class found!" . PHP_EOL;
    exit;
}

echo "Found Class: {$terminaleClass->name} (ID: {$terminaleClass->id})" . PHP_EOL;
echo "---" . PHP_EOL;

// Get active academic year
$activeYear = AcademicYear::where('is_active', true)->first();
echo "Active Academic Year: " . ($activeYear ? $activeYear->label : 'None') . PHP_EOL;
echo "---" . PHP_EOL;

// Check enrollments for this class
$enrollments = Enrollment::where('class_id', $terminaleClass->id)
    ->with(['student', 'academicYear'])
    ->get();

echo "Total Enrollments for this class: " . $enrollments->count() . PHP_EOL . PHP_EOL;

if ($enrollments->count() > 0) {
    echo "ENROLLED STUDENTS:" . PHP_EOL;
    foreach ($enrollments as $e) {
        $student = $e->student;
        $year = $e->academicYear;
        echo "  - {$student->first_name} {$student->last_name} (Matricule: {$student->registration_number})" . PHP_EOL;
        echo "    Academic Year: " . ($year ? $year->label : 'N/A') . " (ID: {$e->academic_year_id})" . PHP_EOL;
        echo "    Is Active Year: " . ($activeYear && $e->academic_year_id === $activeYear->id ? 'YES' : 'NO') . PHP_EOL;
        echo PHP_EOL;
    }
}

echo "=== END INVESTIGATION ===" . PHP_EOL;
