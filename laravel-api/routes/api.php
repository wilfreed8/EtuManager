<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TeacherController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'setup']);

use App\Http\Controllers\EstablishmentController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::apiResource('users', \App\Http\Controllers\UserController::class);
    Route::apiResource('establishments', EstablishmentController::class);
    Route::apiResource('academic-years', \App\Http\Controllers\AcademicYearController::class);
    Route::apiResource('periods', \App\Http\Controllers\PeriodController::class);
    Route::apiResource('classes', \App\Http\Controllers\SchoolClassController::class)->parameters(['classes' => 'schoolClass']);
    Route::apiResource('students', \App\Http\Controllers\StudentController::class);
    Route::apiResource('enrollments', \App\Http\Controllers\StudentEnrollmentController::class)->only(['store', 'destroy']);
    Route::apiResource('teacher-assignments', \App\Http\Controllers\TeacherAssignmentController::class)->except(['update', 'show']); // Often just add/remove
    Route::apiResource('grades', \App\Http\Controllers\GradeController::class)->only(['index', 'store']);
    
    Route::get('/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);
    
    // Teacher routes
    Route::get('/teachers/my-assignments', [TeacherController::class, 'myAssignments']);
    
    // Bulletin routes
    Route::get('/bulletins/{student}/{period}', [\App\Http\Controllers\BulletinController::class, 'generate']);
    Route::get('/bulletins/class/{classId}/period/{periodId}', [\App\Http\Controllers\BulletinController::class, 'generateClassBulletins']);
});
