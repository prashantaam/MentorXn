<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'title',
        'slug',
        'description',
        'category',
        'level',
        'status',
        'icon',
        'accent_color',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    /**
     * Teacher who created the course.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'teacher_id'
        );
    }

    /**
     * Lessons belonging to this course.
     */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)
            ->orderBy('position');
    }
}