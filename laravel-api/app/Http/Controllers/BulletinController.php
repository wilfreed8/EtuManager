<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Period;
use App\Models\Student;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use ZipArchive;

class BulletinController extends Controller
{
    /**
     * Generate bulletin for a single student
     */
    public function generate(Request $request, Student $student, Period $period)
    {
        try {
            $bulletinData = $this->prepareBulletinData($student, $period);
            
            if (isset($bulletinData['error'])) {
                return response()->json($bulletinData, 404);
            }

            $template = $student->establishment->bulletin_template ?? 'template1';
            $viewName = 'bulletins.' . $template;
            
            if (!view()->exists($viewName)) {
                $viewName = 'bulletins.template1';
            }

            if ($request->query('format') === 'pdf') {
                 $pdf = app('dompdf.wrapper');
                 $pdf->loadView($viewName, $bulletinData);
                 $pdf->setPaper('a4', 'portrait');
                 return $pdf->download('Bulletin_' . $student->last_name . '.pdf');
            }

            return view($viewName, $bulletinData);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Bulletin gen error: " . $e->getMessage());
            return response()->json(['error' => 'Erreur génération PDF: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Generate bulletins for all students in a class (ZIP download)
     */
    public function generateClassBulletins(Request $request, $classId, $periodId)
    {
        $period = Period::findOrFail($periodId);
        $schoolClass = SchoolClass::findOrFail($classId);
        
        // Get all students enrolled in this class
        $enrollments = StudentEnrollment::where('class_id', $classId)
            ->where('academic_year_id', $period->academic_year_id)
            ->with('student')
            ->get();

        if ($enrollments->isEmpty()) {
            return response()->json(['error' => 'No students found in this class'], 404);
        }

        $format = $request->query('format', 'html'); // 'html', 'pdf'
        $zipFileName = 'Bulletins_' . $schoolClass->name . '_' . now()->timestamp . '.zip';
        $zipPath = storage_path('app/public/' . $zipFileName);

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
            foreach ($enrollments as $enrollment) {
                try {
                    $student = $enrollment->student;
                    $data = $this->prepareBulletinData($student, $period);
                    
                    if (isset($data['error'])) {
                        \Illuminate\Support\Facades\Log::warning("Bulletin data error for student {$student->id}: " . $data['error']);
                        continue;
                    }

                    $filenameBase = str_replace(' ', '_', $student->last_name . '_' . $student->first_name);
                    $template = $student->establishment->bulletin_template ?? 'template1';
                    $viewName = 'bulletins.' . $template;
                    
                    if (!view()->exists($viewName)) {
                        \Illuminate\Support\Facades\Log::warning("View $viewName not found, falling back to template1");
                        $viewName = 'bulletins.template1';
                    }

                    if ($format === 'pdf') {
                        // Ensure DOMPDF is loaded
                         $pdf = app('dompdf.wrapper');
                         $pdf->loadView($viewName, $data);
                         $pdf->setPaper('a4', 'portrait');
                         $zip->addFromString($filenameBase . '.pdf', $pdf->output());
                    } else {
                        $html = view($viewName, $data)->render();
                        $zip->addFromString($filenameBase . '.html', $html);
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Error generating bulletin for user {$enrollment->student_id}: " . $e->getMessage() . "\n" . $e->getTraceAsString());
                    continue; // Skip this student but continue others
                }
            }
            $zip->close();
        } else {
            return response()->json(['error' => 'Could not create ZIP archive'], 500);
        }

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }

    /**
     * Prepare all data needed for a student's bulletin
     */
    private function prepareBulletinData(Student $student, Period $period)
    {
        // Get enrollment for this period's academic year
        $enrollment = $student->enrollments()
            ->where('academic_year_id', $period->academic_year_id)
            ->first();

        if (!$enrollment) {
            return ['error' => 'Student not enrolled for this period\'s year.'];
        }

        $class = $enrollment->schoolClass;
        
        // Get all grades for this student in this period
        $grades = Grade::where('student_id', $student->id)
            ->where('period_id', $period->id)
            ->with(['subject', 'subject.teacherAssignments.teacher'])
            ->get();

        // Group subjects by category
        $subjectsByCategory = $this->groupSubjectsByCategory($grades);
        
        // Calculate report data
        // Calculate report data
        $report = $this->calculateReport($grades, $class->id);
        
        // Get class statistics
        $classStats = $this->calculateClassStats($class->id, $period->id);
        
        // Get previous trimester data
        $previousPeriods = $this->getPreviousPeriodsData($student, $period);

        // Calculate overall average
        $totalCoeff = $report->sum('coefficient');
        $totalPoints = $report->sum('weighted_average');
        $overallAverage = $totalCoeff > 0 ? round($totalPoints / $totalCoeff, 2) : 0;

        // Get student rank
        $rank = $this->calculateStudentRank($student->id, $class->id, $period->id);
        
        // Get class size
        $classSize = StudentEnrollment::where('class_id', $class->id)
            ->where('academic_year_id', $period->academic_year_id)
            ->count();

        return [
            'student' => $student,
            'period' => $period,
            'class' => $class,
            'classSize' => $classSize,
            'report' => $report,
            'subjectsByCategory' => $subjectsByCategory,
            'overallAverage' => $overallAverage,
            'rank' => $rank,
            'classStats' => $classStats,
            'previousPeriods' => $previousPeriods,
            'establishment' => $student->establishment,
        ];
    }

    /**
     * Group grades by subject category
     */
    private function groupSubjectsByCategory($grades)
    {
        $categories = [
            'MATIERES LITTERAIRES' => [],
            'MATIERES SCIENTIFIQUES' => [],
            'AUTRES MATIERES' => []
        ];

        foreach ($grades as $grade) {
            $subject = $grade->subject;
            $categoryName = $subject->category ?? 'AUTRES MATIERES';
            
            if (!isset($categories[$categoryName])) {
                $categories[$categoryName] = [];
            }
            
            $categories[$categoryName][] = $grade;
        }

        return $categories;
    }

    /**
     * Get coefficient for a subject in a specific class
     */
    private function getSubjectCoefficient($subject, $classId)
    {
        if (!$subject || !$classId) return 1;

        // Try to find specific coefficient for this class
        $classSubject = \Illuminate\Support\Facades\DB::table('class_subjects')
            ->where('class_id', $classId)
            ->where('subject_id', $subject->id)
            ->first();
            
        return $classSubject ? $classSubject->coefficient : ($subject->coefficient ?? 1);
    }

    /**
     * Calculate report data from grades
     */
    private function calculateReport($grades, $classId)
    {
        if ($grades->isEmpty()) return collect([]);
        
        return $grades->map(function ($grade) use ($classId) {
            $avg = $this->calculateSubjectAverage($grade);
            $coeff = $this->getSubjectCoefficient($grade->subject, $classId);
            
            // Get teacher name from assignment
            $teacherName = 'N/A';
            if ($grade->subject && $grade->subject->teacherAssignments->isNotEmpty()) {
                // Filter assignments for THIS class
                $assignment = $grade->subject->teacherAssignments
                    ->where('class_id', $classId)
                    ->first();
                    
                if ($assignment && $assignment->teacher) {
                    $teacherName = $assignment->teacher->name;
                }
            }
            
            return [
                'subject' => $grade->subject->name ?? 'N/A',
                'subject_code' => $grade->subject->code ?? '',
                'coefficient' => $coeff,
                'interro' => $grade->interro_avg,
                'devoir' => $grade->devoir_avg,
                'compo' => $grade->compo_grade,
                'average' => $avg,
                'weighted_average' => $avg * $coeff,
                'teacher' => $teacherName,
                'appreciation' => $this->getAppreciation($avg),
            ];
        });
    }

    /**
     * Calculate class statistics for the period
     */
    private function calculateClassStats($classId, $periodId)
    {
        // Get all students in the class with their averages
        $studentAverages = $this->getClassStudentAverages($classId, $periodId);
        
        if ($studentAverages->isEmpty()) {
            return [
                'highest' => 0,
                'lowest' => 0,
                'average' => 0,
            ];
        }
        
        return [
            'highest' => round($studentAverages->max(), 2),
            'lowest' => round($studentAverages->min(), 2),
            'average' => round($studentAverages->avg(), 2),
        ];
    }

    /**
     * Get all student averages for a class in a period
     */
    private function getClassStudentAverages($classId, $periodId)
    {
        $period = Period::find($periodId);
        if (!$period) return collect([]);
        
        $enrollments = StudentEnrollment::where('class_id', $classId)
            ->where('academic_year_id', $period->academic_year_id)
            ->get();

        return $enrollments->map(function ($enrollment) use ($periodId, $classId) {
            $grades = Grade::where('student_id', $enrollment->student_id)
                ->where('period_id', $periodId)
                ->with('subject')
                ->get();
            
            if ($grades->isEmpty()) return null;
            
            $totalCoeff = 0;
            $totalPoints = 0;
            
            foreach ($grades as $grade) {
                $avg = $this->calculateSubjectAverage($grade);
                $coeff = $this->getSubjectCoefficient($grade->subject, $classId);
                $totalPoints += $avg * $coeff;
                $totalCoeff += $coeff;
            }
            
            return $totalCoeff > 0 ? $totalPoints / $totalCoeff : 0;
        })->filter()->values();
    }

    /**
     * Calculate student rank in class
     */
    private function calculateStudentRank($studentId, $classId, $periodId)
    {
        $averages = $this->getClassStudentAverages($classId, $periodId);
        
        // Get this student's average
        $period = Period::find($periodId);
        $studentGrades = Grade::where('student_id', $studentId)
            ->where('period_id', $periodId)
            ->with('subject')
            ->get();
        
        if ($studentGrades->isEmpty()) return '-';
        
        $totalCoeff = 0;
        $totalPoints = 0;
        
        foreach ($studentGrades as $grade) {
            $avg = $this->calculateSubjectAverage($grade);
            $coeff = $this->getSubjectCoefficient($grade->subject, $classId);
            $totalPoints += $avg * $coeff;
            $totalCoeff += $coeff;
        }
        
        $studentAvg = $totalCoeff > 0 ? $totalPoints / $totalCoeff : 0;
        
        // Count how many are above
        $rank = $averages->filter(fn($avg) => $avg > $studentAvg)->count() + 1;
        
        return $this->formatRank($rank);
    }

    /**
     * Format rank with French ordinal suffix
     */
    private function formatRank($rank)
    {
        if ($rank == 1) return '1er';
        return $rank . 'ème';
    }

    /**
     * Get previous periods data for the student
     */
    private function getPreviousPeriodsData(Student $student, Period $currentPeriod)
    {
        $previousPeriods = Period::where('academic_year_id', $currentPeriod->academic_year_id)
            ->where('id', '!=', $currentPeriod->id)
            ->orderBy('start_date')
            ->get();

        return $previousPeriods->map(function ($period) use ($student) {
            $grades = Grade::where('student_id', $student->id)
                ->where('period_id', $period->id)
                ->with('subject')
                ->get();

            if ($grades->isEmpty()) {
                return [
                    'name' => $period->name,
                    'average' => null,
                    'rank' => null
                ];
            }

            // Find enrollment for that period's year
            $prevEnrollment = StudentEnrollment::where('student_id', $student->id)
                ->where('academic_year_id', $period->academic_year_id)
                ->first();
            $prevClassId = $prevEnrollment ? $prevEnrollment->class_id : null;

            $totalCoeff = 0;
            $totalPoints = 0;
            foreach ($grades as $grade) {
                $avg = $this->calculateSubjectAverage($grade);
                $coeff = $prevClassId ? $this->getSubjectCoefficient($grade->subject, $prevClassId) : ($grade->subject->coefficient ?? 1);
                $totalPoints += $avg * $coeff;
                $totalCoeff += $coeff;
            }

            return [
                'name' => $period->name,
                'average' => $totalCoeff > 0 ? round($totalPoints / $totalCoeff, 2) : 0,
                'rank' => '-' // Would need to calculate separately
            ];
        });
    }

    /**
     * Calculate weighted average for a subject
     */
    private function calculateSubjectAverage(Grade $grade)
    {
        $i = $grade->interro_avg ?? 0;
        $d = $grade->devoir_avg ?? 0;
        $c = $grade->compo_grade ?? 0;
        
        // Interro (25%), Devoir (25%), Compo (50%)
        return ($i * 1 + $d * 1 + $c * 2) / 4; 
    }

    /**
     * Get appreciation based on average
     */
    private function getAppreciation($average)
    {
        if ($average >= 16) return 'Très bien';
        if ($average >= 14) return 'Bien';
        if ($average >= 12) return 'Assez bien';
        if ($average >= 10) return 'Passable';
        if ($average >= 8) return 'Insuffisant';
        return 'Très insuffisant';
    }
}

