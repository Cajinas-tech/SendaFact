<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'status',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'administrador';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cajero';
    }

    public function isSeller(): bool
    {
        return $this->role === 'vendedor';
    }

    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            'administrador' => 'ADMINISTRADOR',
            'cajero' => 'CAJERO',
            'vendedor' => 'VENDEDOR',
            default => strtoupper($this->role ?? 'USUARIO'),
        };
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

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
        ];
    }
}
