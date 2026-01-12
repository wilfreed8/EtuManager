<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Log the login
        AuditLog::logLogin($user->id, $request);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load(['establishment.activeAcademicYear', 'establishment.selectedAcademicYear', 'roles']),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function me(Request $request)
    {
        return $request->user()->load(['establishment.activeAcademicYear', 'establishment.selectedAcademicYear', 'roles']);
    }

    /**
     * Verify admin password for sensitive operations
     */
    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['valid' => false], 401);
        }

        return response()->json(['valid' => true]);
    }
}
