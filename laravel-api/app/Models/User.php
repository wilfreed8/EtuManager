<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'password',
        'avatar_url',
        'is_super_admin',
        'can_generate_bulletins',
        'establishment_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['role'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
            'can_generate_bulletins' => 'boolean',
        ];
    }

    public function establishment()
    {
        return $this->belongsTo(Establishment::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function teacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class);
    }

    public function academicYears()
    {
        return $this->belongsToMany(AcademicYear::class, 'academic_year_user')
            ->withTimestamps();
    }

    public function getRoleAttribute()
    {
        return $this->roles->first()->name ?? 'ENSEIGNANT';
    }

    public function superAdmin()
    {
        return $this->hasOne(SuperAdmin::class);
    }

    public function isSuperAdmin()
    {
        return $this->is_super_admin || $this->superAdmin !== null;
    }

    public function canManageSchools()
    {
        return $this->isSuperAdmin() && $this->superAdmin?->can_manage_schools;
    }

    public function canManageAllUsers()
    {
        return $this->isSuperAdmin() && $this->superAdmin?->can_manage_users;
    }

    public function canViewAllData()
    {
        return $this->isSuperAdmin() && $this->superAdmin?->can_view_all_data;
    }
}
