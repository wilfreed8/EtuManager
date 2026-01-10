<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Establishment;
use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Establishment
        $establishment = Establishment::create([
            'name' => 'Lycée Démarré',
            'type' => 'LYCEE',
            'period_type' => 'TRIMESTRE',
        ]);

        // 2. Create Roles
        $adminRole = Role::create(['name' => 'ADMIN']);
        $teacherRole = Role::create(['name' => 'ENSEIGNANT']);

        // 3. Create Admin User
        $user = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password', // Will be hashed by cast? No, need Hash::make if not casting setter
            'establishment_id' => $establishment->id,
            'is_super_admin' => true,
        ]);
        // Note: User model casts password => hashed, so simply setting 'password' might double has if not careful? 
        // Laravel 11 'hashed' cast handles it automatically if you pass plain text? 
        // Actually, 'hashed' cast works when setting. So 'password' => 'plain' works.

        // 4. Create Academic Year
        $year = AcademicYear::create([
            'label' => '2025-2026',
            'is_active' => true,
            'establishment_id' => $establishment->id,
        ]);

        // 5. Create Period
        $period = Period::create([
            'name' => 'Trimestre 1',
            'academic_year_id' => $year->id,
            'is_active' => true,
        ]);

        // 6. Create Class
        $class = SchoolClass::create([
            'name' => 'Tle C',
            'academic_year_id' => $year->id,
            'establishment_id' => $establishment->id,
        ]);

        // 7. Create Subject
        $math = Subject::create([
            'name' => 'Mathématiques',
            'coefficient' => 5,
            'establishment_id' => $establishment->id,
        ]);

        // 8. Create Student
        $student = Student::create([
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'establishment_id' => $establishment->id,
        ]);

        // 9. Enroll Student
        StudentEnrollment::create([
            'student_id' => $student->id,
            'class_id' => $class->id,
            'academic_year_id' => $year->id,
        ]);

        echo "Seeding completed successfully.\n";
        echo "Establishment ID: " . $establishment->id . "\n";
        echo "User Email: admin@example.com\n";
    }
}
