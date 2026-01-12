<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TeacherAssignment;
use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;

echo "=== CLEANING DUPLICATE DATA ===" . PHP_EOL . PHP_EOL;

// Find and remove duplicate teacher assignments
echo "Checking for duplicate teacher assignments..." . PHP_EOL;
$duplicateAssignments = DB::table('teacher_assignments')
    ->select('user_id', 'class_id', 'subject_id', 'academic_year_id', DB::raw('COUNT(*) as count'))
    ->groupBy('user_id', 'class_id', 'subject_id', 'academic_year_id')
    ->having('count', '>', 1)
    ->get();

if ($duplicateAssignments->count() > 0) {
    echo "Found " . $duplicateAssignments->count() . " duplicate assignment groups" . PHP_EOL;
    
    foreach ($duplicateAssignments as $dup) {
        $assignments = TeacherAssignment::where('user_id', $dup->user_id)
            ->where('class_id', $dup->class_id)
            ->where('subject_id', $dup->subject_id)
            ->where('academic_year_id', $dup->academic_year_id)
            ->orderBy('created_at', 'asc')
            ->get();
        
        // Keep the first one, delete the rest
        $first = $assignments->shift();
        foreach ($assignments as $assignment) {
            echo "  Deleting duplicate assignment ID: {$assignment->id}" . PHP_EOL;
            $assignment->delete();
        }
    }
} else {
    echo "No duplicate teacher assignments found." . PHP_EOL;
}

echo PHP_EOL;

// Find and remove duplicate enrollments
echo "Checking for duplicate student enrollments..." . PHP_EOL;
$duplicateEnrollments = DB::table('enrollments')
    ->select('student_id', 'academic_year_id', DB::raw('COUNT(*) as count'))
    ->groupBy('student_id', 'academic_year_id')
    ->having('count', '>', 1)
    ->get();

if ($duplicateEnrollments->count() > 0) {
    echo "Found " . $duplicateEnrollments->count() . " duplicate enrollment groups" . PHP_EOL;
    
    foreach ($duplicateEnrollments as $dup) {
        $enrollments = Enrollment::where('student_id', $dup->student_id)
            ->where('academic_year_id', $dup->academic_year_id)
            ->orderBy('created_at', 'asc')
            ->get();
        
        // Keep the first one, delete the rest
        $first = $enrollments->shift();
        foreach ($enrollments as $enrollment) {
            echo "  Deleting duplicate enrollment ID: {$enrollment->id}" . PHP_EOL;
            $enrollment->delete();
        }
    }
} else {
    echo "No duplicate student enrollments found." . PHP_EOL;
}

echo PHP_EOL . "=== CLEANUP COMPLETE ===" . PHP_EOL;
