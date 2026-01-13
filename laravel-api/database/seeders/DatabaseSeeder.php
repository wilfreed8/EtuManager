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
use App\Models\SuperAdmin;
use App\Models\ClassSubject;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
        $superAdminRole = Role::create(['name' => 'super_admin']);

        // 3. Create Super Admin User
        $superAdminUser = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'is_super_admin' => true,
        ]);

        // Create Super Admin profile
        SuperAdmin::create([
            'user_id' => $superAdminUser->id,
            'admin_code' => 'SUPER-ADMIN-001',
            'can_manage_schools' => true,
            'can_manage_users' => true,
            'can_view_all_data' => true,
        ]);

        // Assign super admin role
        $superAdminUser->roles()->attach($superAdminRole);

        // 4. Create School Admin (Proviseur)
        $schoolAdmin = User::create([
            'name' => 'Directeur Kokou',
            'email' => 'proviseur@example.com',
            'password' => Hash::make('password'),
            'establishment_id' => $establishment->id,
            'is_super_admin' => false,
        ]);
        $schoolAdmin->roles()->attach($proviseurRole);

        // 5. Create Teacher
        $teacher = User::create([
            'name' => 'Prof. Mensah Claire',
            'email' => 'enseignant@example.com',
            'password' => Hash::make('password'),
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

        Period::create([
            'name' => 'Trimestre 3',
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

        // 12. Create Class-Subject relationships with coefficients
        ClassSubject::create([
            'id' => Str::uuid(),
            'class_id' => $tle_c->id,
            'subject_id' => $francais->id,
            'coefficient' => 4,
        ]);

        ClassSubject::create([
            'id' => Str::uuid(),
            'class_id' => $tle_c->id,
            'subject_id' => $anglais->id,
            'coefficient' => 3,
        ]);

        ClassSubject::create([
            'id' => Str::uuid(),
            'class_id' => $tle_c->id,
            'subject_id' => $math->id,
            'coefficient' => 5,
        ]);

        ClassSubject::create([
            'id' => Str::uuid(),
            'class_id' => $tle_c->id,
            'subject_id' => $physique->id,
            'coefficient' => 4,
        ]);

        ClassSubject::create([
            'id' => Str::uuid(),
            'class_id' => $tle_c->id,
            'subject_id' => $svt->id,
            'coefficient' => 3,
        ]);

        ClassSubject::create([
            'id' => Str::uuid(),
            'class_id' => $tle_c->id,
            'subject_id' => $eps->id,
            'coefficient' => 1,
        ]);

        // 13. Create Teacher Assignments
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

        // 14. Create Students for Tle C
        $students = [];
        $studentData = [
            ['Dupont', 'Jean', 'M', '2005-03-15'],
            ['Mensah', 'Ama', 'F', '2005-07-22'],
            ['Agbeko', 'Koffi', 'M', '2005-11-08'],
            ['Lawson', 'Akouvi', 'F', '2005-02-14'],
            ['Dodji', 'Kossi', 'M', '2005-09-30'],
            ['Amouzou', 'Essi', 'F', '2005-06-18'],
            ['Tetteh', 'Kofi', 'M', '2005-04-25'],
            ['Adjei', 'Akua', 'F', '2005-12-03'],
        ];

        foreach ($studentData as $index => $data) {
            $student = Student::create([
                'first_name' => $data[1],
                'last_name' => $data[0],
                'gender' => $data[2],
                'birth_date' => $data[3],
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

        // 15. Create sample grades for first 3 students
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
        echo "Academic Year: " . $year->label . "\n";
        echo "Classes: Tle C, 1ère D\n";
        echo "Subjects: " . Subject::count() . " created\n";
    }
}

