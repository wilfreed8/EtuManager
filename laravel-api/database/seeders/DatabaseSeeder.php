<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Establishment;
use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\TeacherAssignment;
use App\Models\Grade;
use App\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Establishment
        $establishment = Establishment::create([
            'name' => 'Lycée Moderne de Lomé',
            'type' => 'LYCEE',
            'period_type' => 'TRIMESTRE',
            'city' => 'Lomé',
            'phone' => '22 21 23 45',
            'bp' => 'BP 1234',
        ]);

        // 2. Create Roles
        $adminRole = Role::create(['name' => 'ADMIN']);
        $teacherRole = Role::create(['name' => 'ENSEIGNANT']);
        $proviseurRole = Role::create(['name' => 'PROVISEUR']);

        // 3. Create Super Admin User
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => 'password',
            'establishment_id' => $establishment->id,
            'is_super_admin' => true,
        ]);

        // 4. Create School Admin (Proviseur)
        $schoolAdmin = User::create([
            'name' => 'Directeur Kokou',
            'email' => 'proviseur@example.com',
            'password' => 'password',
            'establishment_id' => $establishment->id,
            'is_super_admin' => false,
        ]);
        $schoolAdmin->roles()->attach($proviseurRole);

        // 5. Create Teacher
        $teacher = User::create([
            'name' => 'Prof. Mensah Claire',
            'email' => 'enseignant@example.com',
            'password' => 'password',
            'establishment_id' => $establishment->id,
            'is_super_admin' => false,
        ]);
        $teacher->roles()->attach($teacherRole);

        // 6. Create Academic Year
        $year = AcademicYear::create([
            'label' => '2025-2026',
            'is_active' => true,
            'establishment_id' => $establishment->id,
        ]);

        // 7. Create Periods
        $trimestre1 = Period::create([
            'name' => 'Trimestre 1',
            'academic_year_id' => $year->id,
            'is_active' => true,
        ]);
        
        Period::create([
            'name' => 'Trimestre 2',
            'academic_year_id' => $year->id,
            'is_active' => false,
        ]);

        // 8. Create Classes
        $tle_c = SchoolClass::create([
            'name' => 'Tle C',
            'academic_year_id' => $year->id,
            'establishment_id' => $establishment->id,
            'room' => 'Salle 101',
        ]);

        $premiere_d = SchoolClass::create([
            'name' => '1ère D',
            'academic_year_id' => $year->id,
            'establishment_id' => $establishment->id,
            'room' => 'Salle 102',
        ]);

        // 9. Create Subjects - MATIERES LITTERAIRES
        $francais = Subject::create([
            'name' => 'Français',
            'code' => 'FRA',
            'coefficient' => 4,
            'category' => 'MATIERES LITTERAIRES',
            'establishment_id' => $establishment->id,
        ]);

        $anglais = Subject::create([
            'name' => 'Anglais',
            'code' => 'ANG',
            'coefficient' => 3,
            'category' => 'MATIERES LITTERAIRES',
            'establishment_id' => $establishment->id,
        ]);

        // 10. Create Subjects - MATIERES SCIENTIFIQUES
        $math = Subject::create([
            'name' => 'Mathématiques',
            'code' => 'MATH',
            'coefficient' => 5,
            'category' => 'MATIERES SCIENTIFIQUES',
            'establishment_id' => $establishment->id,
        ]);

        $physique = Subject::create([
            'name' => 'Physique-Chimie',
            'code' => 'PC',
            'coefficient' => 4,
            'category' => 'MATIERES SCIENTIFIQUES',
            'establishment_id' => $establishment->id,
        ]);

        $svt = Subject::create([
            'name' => 'SVT',
            'code' => 'SVT',
            'coefficient' => 3,
            'category' => 'MATIERES SCIENTIFIQUES',
            'establishment_id' => $establishment->id,
        ]);

        // 11. Other Subjects
        $eps = Subject::create([
            'name' => 'EPS',
            'code' => 'EPS',
            'coefficient' => 1,
            'category' => 'AUTRES MATIERES',
            'establishment_id' => $establishment->id,
        ]);

        // 12. Create Teacher Assignments
        TeacherAssignment::create([
            'user_id' => $teacher->id,
            'class_id' => $tle_c->id,
            'subject_id' => $math->id,
            'academic_year_id' => $year->id,
        ]);

        TeacherAssignment::create([
            'user_id' => $teacher->id,
            'class_id' => $premiere_d->id,
            'subject_id' => $physique->id,
            'academic_year_id' => $year->id,
        ]);

        // 13. Create Students for Tle C
        $students = [];
        $studentNames = [
            ['Dupont', 'Jean'],
            ['Mensah', 'Ama'],
            ['Agbeko', 'Koffi'],
            ['Lawson', 'Akouvi'],
            ['Dodji', 'Kossi'],
            ['Amouzou', 'Essi'],
            ['Tetteh', 'Kofi'],
            ['Adjei', 'Akua'],
        ];

        foreach ($studentNames as $index => $name) {
            $student = Student::create([
                'first_name' => $name[1],
                'last_name' => $name[0],
                'gender' => $index % 2 === 0 ? 'M' : 'F',
                'registration_number' => 'REG-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'establishment_id' => $establishment->id,
            ]);
            $students[] = $student;

            StudentEnrollment::create([
                'student_id' => $student->id,
                'class_id' => $tle_c->id,
                'academic_year_id' => $year->id,
            ]);
        }

        // 14. Create sample grades for first 3 students
        for ($i = 0; $i < 3; $i++) {
            Grade::create([
                'student_id' => $students[$i]->id,
                'subject_id' => $math->id,
                'period_id' => $trimestre1->id,
                'interro_avg' => rand(100, 180) / 10,
                'devoir_avg' => rand(100, 180) / 10,
                'compo_grade' => rand(100, 180) / 10,
            ]);
        }

        echo "=== Seeding completed successfully ===\n";
        echo "Super Admin: admin@example.com / password\n";
        echo "School Admin: proviseur@example.com / password\n";
        echo "Teacher: enseignant@example.com / password\n";
        echo "Establishment: " . $establishment->name . "\n";
        echo "Students created: " . count($students) . "\n";
    }
}

