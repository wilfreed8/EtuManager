<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->with(['roles', 'teacherAssignments.subject', 'teacherAssignments.schoolClass']);

        if ($request->has('role')) {
            $roleName = $request->role;
            $query->whereHas('roles', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            });
        }

        if ($request->has('establishment_id')) {
            $query->where('establishment_id', $request->establishment_id);
        }

        return $query->get();
    }

    /**
     * Get teachers with their last login information
     */
    public function getTeachersWithAudit(Request $request)
    {
        $establishmentId = $request->user()->establishment_id;

        // Determine academic year context (selected year from settings).
        // If the client explicitly passes academic_year_id, it takes precedence.
        $activeYearId = $request->query('academic_year_id');

        if (!$activeYearId) {
            $activeYear = $request->user()->establishment->selected_academic_year_id
                ? $request->user()->establishment->selectedAcademicYear
                : $request->user()->establishment->activeAcademicYear;
            $activeYearId = $activeYear ? $activeYear->id : null;
        }

        $teachers = User::where('establishment_id', $establishmentId)
            ->whereHas('roles', function($q) {
                $q->where('name', 'ENSEIGNANT');
            })
            ->when($activeYearId, function ($q) use ($activeYearId) {
                $q->whereHas('academicYears', function ($yq) use ($activeYearId) {
                    $yq->where('academic_years.id', $activeYearId);
                });
            })
            ->with(['roles', 'teacherAssignments' => function($q) use ($activeYearId) {
                if ($activeYearId) {
                    $q->where('academic_year_id', $activeYearId);
                } else {
                    $q->where('id', '00000000-0000-0000-0000-000000000000'); // No context = no assignments
                }
                $q->with(['subject', 'schoolClass']);
            }])
            ->get()
            ->map(function ($teacher) use ($activeYearId) {
                // Get last login from audit logs
                $lastLogin = AuditLog::where('user_id', $teacher->id)
                    ->where('action', 'login')
                    ->orderBy('created_at', 'desc')
                    ->first();

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name ?? 'Enseignant Sans Nom', 
                    'email' => $teacher->email,
                    'phone' => $teacher->phone,
                    'address' => $teacher->address,
                    'role' => $teacher->role,
                    'teacher_assignments' => $teacher->teacherAssignments->map(function($a) {
                        return [
                            'id' => $a->id,
                            'subject' => ['name' => $a->subject->name ?? 'N/A'],
                            'school_class' => ['name' => $a->schoolClass->name ?? 'N/A'],
                        ];
                    }),
                    'last_login' => $lastLogin ? [
                        'date' => $lastLogin->created_at,
                        'ip' => $lastLogin->ip_address,
                    ] : null,
                ];
            });

        return response()->json($teachers->values()); // Ensure it's a JSON array
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'password' => 'required|string|min:8',
            'establishment_id' => 'required|exists:establishments,id',
            'role' => 'nullable|string|max:100',
            'avatar_url' => 'nullable|string|max:500',
            'can_generate_bulletins' => 'boolean',
            'academic_year_id' => 'nullable|exists:academic_years,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        
        $user = User::create($validated);

        if ($request->has('role')) {
            $roleName = $request->role;
            // Ensure consistency in role naming
            if ($roleName === 'ENSEIGNANT') {
                $role = Role::firstOrCreate(['name' => 'ENSEIGNANT']);
            } else {
                $role = Role::where('name', $roleName)->first();
            }
            
            if ($role) {
                // Check if already attached to avoid duplicates (though user is new here)
                $user->roles()->syncWithoutDetaching([$role->id => ['establishment_id' => $validated['establishment_id']]]);
            }

            // If teacher, attach to selected/active academic year (or provided academic_year_id)
            if ($roleName === 'ENSEIGNANT') {
                $yearId = $validated['academic_year_id'] ?? null;
                if (!$yearId && $request->user() && $request->user()->establishment) {
                    $est = $request->user()->establishment;
                    $yearId = $est->selected_academic_year_id ?: optional($est->activeAcademicYear)->id;
                }
                if ($yearId) {
                    $user->academicYears()->syncWithoutDetaching([$yearId]);
                }
            }
        }

        return $user;
    }

    public function show(User $user)
    {
        return $user->load('roles', 'teacherAssignments');
    }

    public function update(Request $request, User $user)
    {
        $data = $request->all();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $user->update($data);
        return $user;
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls',
            'establishment_id' => 'required|exists:establishments,id'
        ]);

        $file = $request->file('file');
        
        try {
            $data = \Maatwebsite\Excel\Facades\Excel::toCollection(new \stdClass, $file);
            $rows = $data[0] ?? collect([]);
            
            if ($rows->count() > 0) {
                 $firstRow = $rows->first();
                 if (is_string($firstRow[0]) && str_contains(strtolower($firstRow[0]), 'first_name')) {
                     $rows->shift();
                 }
            }

            $count = 0;
            $skipped = 0;
            $role = Role::firstOrCreate(['name' => 'ENSEIGNANT']);

            foreach ($rows as $row) {
                // first_name, last_name, email, phone, address, specialite
                if (!isset($row[2])) continue;

                $email = $row[2];
                if (User::where('email', $email)->exists()) {
                    $skipped++;
                    continue;
                }

                $user = User::create([
                    'name' => $row[0] . ' ' . $row[1],
                    'email' => $email,
                    'phone' => $row[3] ?? null,
                    'address' => $row[4] ?? null,
                    'establishment_id' => $request->establishment_id,
                    'password' => Hash::make('password123'),
                ]);

                if ($role) {
                    $user->roles()->syncWithoutDetaching([$role->id => ['establishment_id' => $request->establishment_id]]);
                }
                $count++;
            }

            return response()->json(['message' => "$count enseignants importés. $skipped ignorés (email existant)."]);
        } catch (\Exception $e) {
             return response()->json(['message' => "Erreur import: " . $e->getMessage()], 500);
        }
    }
}
