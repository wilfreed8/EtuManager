<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Get recent audit logs for the establishment
     */
    public function index(Request $request)
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
            'action' => 'nullable|string|in:login,logout,create,update,delete,view',
        ]);

        $limit = $request->get('limit', 50);
        $action = $request->get('action');

        $query = AuditLog::with('user')
            ->whereHas('user', function ($q) {
                $q->where('establishment_id', $request->user()->establishment_id);
            });

        if ($action) {
            $query->where('action', $action);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? [
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                        'role' => $this->getUserRole($log->user),
                    ] : null,
                    'action' => $log->action,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'metadata' => $log->metadata,
                    'created_at' => $log->created_at,
                    'status' => $this->getLogStatus($log),
                ];
            });

        return response()->json($logs);
    }

    /**
     * Get login statistics
     */
    public function loginStats(Request $request)
    {
        $stats = AuditLog::with('user')
            ->whereHas('user', function ($q) {
                $q->where('establishment_id', $request->user()->establishment_id);
            })
            ->where('action', 'login')
            ->where('created_at', '>=', now()->subDays(7))
            ->get()
            ->groupBy(function ($log) {
                return $log->created_at->format('Y-m-d');
            })
            ->map(function ($dayLogs) {
                return [
                    'date' => $dayLogs->first()->created_at->format('Y-m-d'),
                    'count' => $dayLogs->count(),
                    'successful' => $dayLogs->where('metadata.status', 'success')->count(),
                    'failed' => $dayLogs->where('metadata.status', 'failed')->count(),
                ];
            })
            ->values()
            ->sortBy('date');

        return response()->json($stats);
    }

    /**
     * Get user role from user model
     */
    private function getUserRole($user)
    {
        if ($user->is_super_admin) {
            return 'Super Admin';
        } elseif ($user->establishment_id && $user->establishment->owner_id === $user->id) {
            return 'Admin';
        } elseif ($user->role === 'teacher') {
            return 'Teacher';
        } else {
            return 'User';
        }
    }

    /**
     * Determine log status based on action and metadata
     */
    private function getLogStatus($log)
    {
        if ($log->action === 'login') {
            return $log->metadata['status'] ?? 'success';
        }

        // For other actions, determine based on metadata or default to success
        return $log->metadata['status'] ?? 'success';
    }
}
