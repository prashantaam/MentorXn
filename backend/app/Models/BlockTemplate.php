<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlockTemplate extends Model
{
    protected $table = 'block_templates';

    protected $fillable = [
        'name',
        'icon',
        'description',
        'component',
        'tags',
        'configuration_schema',
        'example_data',
        'status',
        'position',
    ];

    protected $casts = [
        'tags' => 'array',

        'configuration_schema' =>
            'array',

        'example_data' =>
            'array',

        'position' =>
            'integer',
    ];

    public function learningBlocks(): HasMany
    {
        return $this->hasMany(
            LearningBlock::class,
            'block_template_id'
        );
    }
}