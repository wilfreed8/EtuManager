<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->with(['roles', 'teacherAssignments']);

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'password' => 'required|string|min:8',
            'establishment_id' => 'required|exists:establishments,id',
            'role' => 'nullable|string'
        ]);

        $validated['password'] = Hash::make($validated['password']);
        
        $user = User::create($validated);

        if ($request->has('role')) {
            $role = Role::where('name', $request->role)->first();
            if ($role) {
                $user->roles()->attach($role->id, ['establishment_id' => $validated['establishment_id']]);
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
}
