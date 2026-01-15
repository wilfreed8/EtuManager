<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AuditLog extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'ip_address',
        'user_agent',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a login audit log
     */
    public static function logLogin($userId, $request, $status = 'success')
    {
        return self::create([
            'user_id' => $userId,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => ['status' => $status],
            'created_at' => now(),
        ]);
    }

    /**
     * Create a logout audit log
     */
    public static function logLogout($userId, $request)
    {
        return self::create([
            'user_id' => $userId,
            'action' => 'logout',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => ['status' => 'success'],
            'created_at' => now(),
        ]);
    }

    /**
     * Create a generic action audit log
     */
    public static function logAction($userId, $action, $request, $metadata = [])
    {
        return self::create([
            'user_id' => $userId,
            'action' => $action,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => array_merge(['status' => 'success'], $metadata),
            'created_at' => now(),
        ]);
    }

    /**
     * Log failed login attempt
     */
    public static function logFailedLogin($email, $request)
    {
        return self::create([
            'user_id' => null,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'status' => 'failed',
                'email' => $email,
                'reason' => 'invalid_credentials'
            ],
            'created_at' => now(),
        ]);
    }
}
