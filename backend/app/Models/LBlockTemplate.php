<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LBlockTemplate extends Model
{
    protected $table = 'lblock_templates';

    protected $fillable = [
        'name',
        'type',
        'icon',
        'description',
        'component',
        'configuration_schema',
        'default_data',
        'status',
        'position',
    ];

    protected $casts = [
        'configuration_schema' => 'array',
        'default_data' => 'array',
        'position' => 'integer',
    ];

    public function learningBlocks(): HasMany
    {
        return $this->hasMany(
            LearningBlock::class,
            'lblock_template_id'
        );
    }
}