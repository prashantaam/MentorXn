<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'type',
        'title',
        'icon',
        'data',
        'position',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function isContent(): bool
    {
        return $this->type === 'content';
    }

    public function isQuiz(): bool
    {
        return $this->type === 'quiz';
    }
}