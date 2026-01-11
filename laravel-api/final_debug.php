<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Enrollment;

echo "--- DETAILED CLASS CHECK ---" . PHP_EOL;

foreach (SchoolClass::all() as $c) {
    $enrollsCount = Enrollment::where('class_id', $c->id)->count();
    echo "Class: {$c->name} (ID: {$c->id}) | Enrollments: {$enrollsCount}" . PHP_EOL;
    if ($enrollsCount > 0) {
        $sample = Enrollment::where('class_id', $c->id)->with('student')->limit(3)->get();
        foreach ($sample as $e) {
            echo "  - Student: " . ($e->student->first_name ?? 'N/A') . " " . ($e->student->last_name ?? 'N/A') . PHP_EOL;
        }
    }
}
