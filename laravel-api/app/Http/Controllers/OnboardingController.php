<?php

namespace App\Http\Controllers;

use App\Models\Establishment;
use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class OnboardingController extends Controller
{
    public function setup(Request $request)
    {
        $validated = $request->validate([
            // School
            'schoolName' => 'required|string|max:255',
            'schoolType' => 'required|string',
            'schoolAddress' => 'required|string',
            'schoolPhone' => 'required|string',
            
            // Academic
            'academicYear' => 'required|string',
            'periodType' => 'required|string|in:TRIMESTRE,SEMESTRE',
            'gradingWeights' => 'required|array',
            
            // Admin
            'adminName' => 'required|string|max:255',
            'adminEmail' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Create Establishment
            $establishment = Establishment::create([
                'name' => $validated['schoolName'],
                'type' => $validated['schoolType'],
                'address' => $validated['schoolAddress'],
                'phone' => $validated['schoolPhone'],
                'period_type' => $validated['periodType'],
                'grading_config' => $validated['gradingWeights'],
            ]);

            // 2. Create Academic Year
            $academicYear = AcademicYear::create([
                'establishment_id' => $establishment->id,
                'label' => $validated['academicYear'],
                'start_date' => now()->startOfYear(),
                'end_date' => now()->addYear()->endOfYear(),
                'is_active' => true,
            ]);

            // 3. Create Periods
            $periodNames = $validated['periodType'] === 'TRIMESTRE' 
                ? ['1er Trimestre', '2ème Trimestre', '3ème Trimestre']
                : ['1er Semestre', '2ème Semestre'];

            foreach ($periodNames as $name) {
                Period::create([
                    'academic_year_id' => $academicYear->id,
                    'name' => $name,
                    'is_active' => false, // Set properly later
                ]);
            }
            // Set first period active
            $academicYear->periods()->first()->update(['is_active' => true]);

            // 4. Create Admin User
            $user = User::create([
                'name' => $validated['adminName'],
                'email' => $validated['adminEmail'],
                'password' => Hash::make($validated['password']),
                'establishment_id' => $establishment->id,
                'is_super_admin' => false, // This is a school admin
            ]);

            // 5. Assign Role
            $role = Role::firstOrCreate(['name' => 'PROVISEUR']);
            $user->roles()->attach($role->id, ['establishment_id' => $establishment->id]);

            return response()->json([
                'message' => 'Onboarding successful',
                'message' => 'Onboarding successful',
                'establishment' => $establishment,
                'user' => $user->load('establishment.activeAcademicYear', 'roles'),
            ], 201);
        });
    }
}
