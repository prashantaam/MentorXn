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
        'lblock_template_id',
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
            'position' => 'integer',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(
            Topic::class
        );
    }

    public function lblockTemplate(): BelongsTo
    {
        return $this->belongsTo(
            LBlockTemplate::class,
            'lblock_template_id'
        );
    }
}