<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;
use App\Models\SchoolClass;

echo "--- STUDENTS & CLASSES ---" . PHP_EOL;
$students = Student::with('enrollments.schoolClass')->get();
foreach ($students as $s) {
    $enrolls = [];
    foreach ($s->enrollments as $e) {
        $enrolls[] = ($e->schoolClass->name ?? 'N/A') . " (ID: " . $e->class_id . ")";
    }
    echo "Student: {$s->first_name} {$s->last_name} | Enrollments: " . implode(', ', $enrolls) . PHP_EOL;
}

echo PHP_EOL . "--- ALL SCHOOL CLASSES ---" . PHP_EOL;
foreach (SchoolClass::all() as $c) {
    echo "ID: {$c->id} | Name: {$c->name}" . PHP_EOL;
}
