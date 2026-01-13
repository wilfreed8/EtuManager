<?php

namespace App\Http\Controllers;

use App\Models\Establishment;
use App\Models\User;
use App\Models\Student;
use App\Models\SuperAdmin;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_schools' => Establishment::count(),
            'active_schools' => Establishment::active()->count(),
            'blocked_schools' => Establishment::blocked()->count(),
            'total_users' => User::count(),
            'total_students' => Student::count(),
            'total_teachers' => User::whereHas('roles', function($query) {
                $query->where('name', 'ENSEIGNANT');
            })->count(),
            'total_admins' => User::whereHas('roles', function($query) {
                $query->whereIn('name', ['PROVISEUR', 'CENSEUR', 'SECRETAIRE', 'ADMIN']);
            })->count(),
        ];

        $recentSchools = Establishment::latest()->take(5)->get();
        $blockedSchools = Establishment::blocked()->latest()->take(5)->get();

        return response()->json([
            'stats' => $stats,
            'recent_schools' => $recentSchools,
            'blocked_schools' => $blockedSchools,
        ]);
    }

    public function schools()
    {
        $schools = Establishment::with(['users', 'academicYears'])->get();
        
        $schoolsData = $schools->map(function($school) {
            return [
                'id' => $school->id,
                'name' => $school->name,
                'type' => $school->type,
                'city' => $school->city,
                'phone' => $school->phone,
                'email' => $school->email,
                'address' => $school->address,
                'country' => $school->country,
                'is_active' => $school->is_active,
                'block_message' => $school->block_message,
                'blocked_at' => $school->blocked_at,
                'unblocked_at' => $school->unblocked_at,
                'users_count' => $school->users()->count(),
                'students_count' => Student::where('establishment_id', $school->id)->count(),
                'teachers_count' => $school->users()->whereHas('roles', function($query) {
                    $query->where('name', 'ENSEIGNANT');
                })->count(),
                'academic_years_count' => $school->academicYears()->count(),
            ];
        });

        return response()->json($schoolsData);
    }

    public function storeSchool(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:LYCEE,COLLEGE,PRIMAIRE',
            'city' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'country' => 'nullable|string|max:255',
        ]);

        $school = Establishment::create([
            'name' => $request->name,
            'type' => $request->type,
            'city' => $request->city,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'country' => $request->country ?? 'Côte d\'Ivoire',
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Établissement créé avec succès',
            'school' => $school,
        ]);
    }

    public function updateSchool(Request $request, Establishment $school)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:LYCEE,COLLEGE,PRIMAIRE',
            'city' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'country' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $school->update($request->all());

        return response()->json([
            'message' => 'Établissement mis à jour avec succès',
            'school' => $school,
        ]);
    }

    public function destroySchool(Establishment $school)
    {
        $school->delete();

        return response()->json([
            'message' => 'Établissement supprimé avec succès',
        ]);
    }

    public function blockSchool(Request $request, Establishment $school)
    {
        $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        $school->block($request->message);

        return response()->json([
            'message' => 'Établissement bloqué avec succès',
            'school' => $school,
        ]);
    }

    public function unblockSchool(Establishment $school)
    {
        $school->unblock();

        return response()->json([
            'message' => 'Établissement débloqué avec succès',
            'school' => $school,
        ]);
    }

    public function schoolDetails(Establishment $school)
    {
        $school->load(['users.roles', 'academicYears', 'students']);

        $details = [
            'school' => $school,
            'users' => $school->users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                ];
            }),
            'students_count' => $school->students->count(),
            'teachers_count' => $school->users->filter(function($user) {
                return $user->role === 'ENSEIGNANT';
            })->count(),
            'admins_count' => $school->users->filter(function($user) {
                return in_array($user->role, ['PROVISEUR', 'CENSEUR', 'SECRETAIRE', 'ADMIN']);
            })->count(),
            'academic_years' => $school->academicYears->map(function($year) {
                return [
                    'id' => $year->id,
                    'label' => $year->label,
                    'is_active' => $year->is_active,
                    'is_locked' => $year->is_locked,
                ];
            }),
        ];

        return response()->json($details);
    }

    public function allUsers()
    {
        $users = User::with(['roles', 'establishment'])->get();
        
        $usersData = $users->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'establishment' => $user->establishment ? [
                    'id' => $user->establishment->id,
                    'name' => $user->establishment->name,
                ] : null,
                'is_super_admin' => $user->is_super_admin,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json($usersData);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:ADMIN,PROVISEUR,CENSEUR,SECRETAIRE,ENSEIGNANT',
            'establishment_id' => 'nullable|exists:establishments,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role,
            'establishment_id' => $request->establishment_id,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user,
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:ADMIN,PROVISEUR,CENSEUR,SECRETAIRE,ENSEIGNANT',
            'establishment_id' => 'nullable|exists:establishments,id',
            'is_active' => 'boolean',
        ]);

        $user->update($request->all());

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user,
        ]);
    }

    public function destroyUser(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès',
        ]);
    }

    public function blockUser(Request $request, User $user)
    {
        $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        $user->update([
            'is_active' => false,
            'block_message' => $request->message,
            'blocked_at' => now(),
        ]);

        return response()->json([
            'message' => 'Utilisateur bloqué avec succès',
            'user' => $user,
        ]);
    }

    public function unblockUser(User $user)
    {
        $user->update([
            'is_active' => true,
            'block_message' => null,
            'blocked_at' => null,
            'unblocked_at' => now(),
        ]);

        return response()->json([
            'message' => 'Utilisateur débloqué avec succès',
            'user' => $user,
        ]);
    }

    public function resetUserPassword(Request $request, User $user)
    {
        $newPassword = Str::random(12);
        
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès',
            'new_password' => $newPassword,
        ]);
    }

    public function settings()
    {
        $settings = PlatformSetting::all();
        
        return response()->json($settings);
    }

    public function storeSetting(Request $request)
    {
        $request->validate([
            'key' => 'required|string|max:255|unique:platform_settings,key',
            'value' => 'required|string',
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:string,number,boolean,json',
            'category' => 'required|string|max:100',
        ]);

        $setting = PlatformSetting::create($request->all());

        return response()->json([
            'message' => 'Paramètre créé avec succès',
            'setting' => $setting,
        ]);
    }

    public function updateSetting(Request $request, PlatformSetting $setting)
    {
        $request->validate([
            'key' => 'required|string|max:255|unique:platform_settings,key,' . $setting->id,
            'value' => 'required|string',
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:string,number,boolean,json',
            'category' => 'required|string|max:100',
        ]);

        $setting->update($request->all());

        return response()->json([
            'message' => 'Paramètre mis à jour avec succès',
            'setting' => $setting,
        ]);
    }

    public function destroySetting(PlatformSetting $setting)
    {
        $setting->delete();

        return response()->json([
            'message' => 'Paramètre supprimé avec succès',
        ]);
    }

    public function createSuperAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'admin_code' => 'required|string|unique:super_admins,admin_code',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_super_admin' => true,
            ]);

            SuperAdmin::create([
                'user_id' => $user->id,
                'admin_code' => $request->admin_code,
                'can_manage_schools' => true,
                'can_manage_users' => true,
                'can_view_all_data' => true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Super Admin créé avec succès',
                'user' => $user->load('superAdmin'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
