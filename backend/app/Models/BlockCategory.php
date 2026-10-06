<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A group in the block library (Content, Assessment, …).
 * Managed by developers on /dev/block-categories.
 */
class BlockCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'icon',
        'color',
        'position',
        'status',
    ];

    protected $casts = [
        'position' => 'integer',
    ];

    public function blockTemplates(): HasMany
    {
        return $this->hasMany(BlockTemplate::class);
    }

    /** Active categories in library order. */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('position')->orderBy('name');
    }
}
