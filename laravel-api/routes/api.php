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
    Route::post('/verify-password', [AuthController::class, 'verifyPassword']);
    
    // Super Admin routes
    Route::prefix('super-admin')->middleware('super.admin')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\SuperAdminController::class, 'dashboard']);
        
        // Schools management
        Route::get('/schools', [\App\Http\Controllers\SuperAdminController::class, 'schools']);
        Route::post('/schools', [\App\Http\Controllers\SuperAdminController::class, 'storeSchool']);
        Route::put('/schools/{school}', [\App\Http\Controllers\SuperAdminController::class, 'updateSchool']);
        Route::delete('/schools/{school}', [\App\Http\Controllers\SuperAdminController::class, 'destroySchool']);
        Route::post('/schools/{school}/block', [\App\Http\Controllers\SuperAdminController::class, 'blockSchool']);
        Route::post('/schools/{school}/unblock', [\App\Http\Controllers\SuperAdminController::class, 'unblockSchool']);
        Route::get('/schools/{school}/details', [\App\Http\Controllers\SuperAdminController::class, 'schoolDetails']);
        
        // Users management
        Route::get('/users', [\App\Http\Controllers\SuperAdminController::class, 'allUsers']);
        Route::post('/users', [\App\Http\Controllers\SuperAdminController::class, 'storeUser']);
        Route::put('/users/{user}', [\App\Http\Controllers\SuperAdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [\App\Http\Controllers\SuperAdminController::class, 'destroyUser']);
        Route::post('/users/{user}/block', [\App\Http\Controllers\SuperAdminController::class, 'blockUser']);
        Route::post('/users/{user}/unblock', [\App\Http\Controllers\SuperAdminController::class, 'unblockUser']);
        Route::post('/users/{user}/reset-password', [\App\Http\Controllers\SuperAdminController::class, 'resetUserPassword']);
        
        // Platform settings
        Route::get('/settings', [\App\Http\Controllers\SuperAdminController::class, 'settings']);
        Route::post('/settings', [\App\Http\Controllers\SuperAdminController::class, 'storeSetting']);
        Route::put('/settings/{setting}', [\App\Http\Controllers\SuperAdminController::class, 'updateSetting']);
        Route::delete('/settings/{setting}', [\App\Http\Controllers\SuperAdminController::class, 'destroySetting']);
        
        // Super admin management
        Route::post('/create-super-admin', [\App\Http\Controllers\SuperAdminController::class, 'createSuperAdmin']);
    });
    
    Route::apiResource('users', \App\Http\Controllers\UserController::class);
    Route::get('/users-with-audit', [\App\Http\Controllers\UserController::class, 'getTeachersWithAudit']);
    Route::apiResource('establishments', EstablishmentController::class);
    Route::post('/establishments/{id}/logo', [EstablishmentController::class, 'uploadLogo']);
    Route::apiResource('academic-years', \App\Http\Controllers\AcademicYearController::class);
    Route::apiResource('periods', \App\Http\Controllers\PeriodController::class);
    Route::post('/periods/{period}/activate', [\App\Http\Controllers\PeriodController::class, 'activate']);
    Route::get('/active-period', [\App\Http\Controllers\PeriodController::class, 'getActive']);
    
    // Academic year selection
    Route::post('/academic-years/{year}/select', [\App\Http\Controllers\AcademicYearController::class, 'select']);
    Route::post('/academic-years/{year}/activate', [\App\Http\Controllers\AcademicYearController::class, 'activate']);
    Route::post('/academic-years/{year}/toggle-lock', [\App\Http\Controllers\AcademicYearController::class, 'toggleLock']);
    Route::apiResource('classes', \App\Http\Controllers\SchoolClassController::class)->parameters(['classes' => 'schoolClass']);
    Route::apiResource('students', \App\Http\Controllers\StudentController::class);
    Route::apiResource('enrollments', \App\Http\Controllers\StudentEnrollmentController::class)->only(['store', 'destroy']);
    Route::apiResource('teacher-assignments', \App\Http\Controllers\TeacherAssignmentController::class)->except(['update', 'show']); // Often just add/remove
    Route::apiResource('grades', \App\Http\Controllers\GradeController::class)->only(['index', 'store']);
    Route::apiResource('subjects', \App\Http\Controllers\SubjectController::class);
    Route::post('/subjects/import', [\App\Http\Controllers\SubjectController::class, 'import']);
    
    // Class Configuration
    Route::get('/classes/{classId}/subjects', [\App\Http\Controllers\SubjectController::class, 'getClassConfig']);
    Route::post('/classes/{classId}/subjects', [\App\Http\Controllers\SubjectController::class, 'updateClassConfig']);
    
    // Import
    Route::post('/students/import', [\App\Http\Controllers\StudentController::class, 'import']);
    Route::post('/users/import', [\App\Http\Controllers\UserController::class, 'import']);
    
    Route::get('/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);
    
    // Admin messages
    Route::get('/admin-messages', [\App\Http\Controllers\AdminMessageController::class, 'index']);
    Route::get('/admin-messages/all', [\App\Http\Controllers\AdminMessageController::class, 'all']);
    Route::post('/admin-messages', [\App\Http\Controllers\AdminMessageController::class, 'store']);
    Route::put('/admin-messages/{id}', [\App\Http\Controllers\AdminMessageController::class, 'update']);
    Route::delete('/admin-messages/{id}', [\App\Http\Controllers\AdminMessageController::class, 'destroy']);
    
    // Teacher routes
    Route::get('/teachers/my-assignments', [TeacherController::class, 'myAssignments']);
    
    // Audit logs routes
    Route::get('/audit-logs', [\App\Http\Controllers\AuditLogController::class, 'index']);
    Route::get('/audit-logs/login-stats', [\App\Http\Controllers\AuditLogController::class, 'loginStats']);
    
    // Bulletin routes
    Route::get('/bulletins/{student}/{period}', [\App\Http\Controllers\BulletinController::class, 'generate']);
    Route::get('/bulletins/class/{classId}/period/{periodId}', [\App\Http\Controllers\BulletinController::class, 'generateClassBulletins']);
});
