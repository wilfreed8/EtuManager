<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class SuperAdmin extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'admin_code',
        'can_manage_schools',
        'can_manage_users',
        'can_view_all_data',
    ];

    protected $casts = [
        'can_manage_schools' => 'boolean',
        'can_manage_users' => 'boolean',
        'can_view_all_data' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isSuperAdmin()
    {
        return true;
    }

    public function getFullNameAttribute()
    {
        return $this->user->full_name ?? 'N/A';
    }

    public function getEmailAttribute()
    {
        return $this->user->email ?? 'N/A';
    }

    // Scope pour les super admins actifs
    public function scopeActive($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->where('is_active', true);
        });
    }

    // Scope pour les permissions spécifiques
    public function scopeCanManageSchools($query)
    {
        return $query->where('can_manage_schools', true);
    }

    public function scopeCanManageUsers($query)
    {
        return $query->where('can_manage_users', true);
    }

    public function scopeCanViewAllData($query)
    {
        return $query->where('can_view_all_data', true);
    }

    // Vérifier les permissions
    public function canManageSchools()
    {
        return $this->can_manage_schools;
    }

    public function canManageUsers()
    {
        return $this->can_manage_users;
    }

    public function canViewAllData()
    {
        return $this->can_view_all_data;
    }

    // Actions de gestion des écoles
    public function blockEstablishment(Establishment $establishment, $message = null)
    {
        if (!$this->canManageSchools()) {
            throw new \Exception('Permission refusée');
        }

        $establishment->update([
            'is_active' => false,
            'block_message' => $message,
            'blocked_at' => now(),
        ]);

        // Bloquer tous les utilisateurs de l'établissement
        $establishment->users()->update([
            'is_active' => false,
            'block_message' => $message ?? 'Votre établissement a été bloqué. Veuillez contacter l\'administration.',
            'blocked_at' => now(),
        ]);

        return $establishment;
    }

    public function unblockEstablishment(Establishment $establishment)
    {
        if (!$this->canManageSchools()) {
            throw new \Exception('Permission refusée');
        }

        $establishment->update([
            'is_active' => true,
            'block_message' => null,
            'blocked_at' => null,
            'unblocked_at' => now(),
        ]);

        // Réactiver tous les utilisateurs de l'établissement
        $establishment->users()->update([
            'is_active' => true,
            'block_message' => null,
            'blocked_at' => null,
            'unblocked_at' => now(),
        ]);

        return $establishment;
    }
}
