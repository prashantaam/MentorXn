<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\TrimStrings as Middleware;
use Illuminate\Support\Str;

/**
 * Trims request strings like Laravel's default, except for the
 * text nodes inside rich text (TipTap JSON) documents.
 *
 * A rich text paragraph is split into text pieces at every
 * formatting change: "An " + "algorithm" (bold) + " is…".
 * Trimming those pieces would glue the words together.
 */
class TrimStrings extends Middleware
{
    /**
     * Key patterns (Str::is wildcards) that are never trimmed.
     *
     * Matches e.g. data.content.content.0.content.2.text
     * and data.items.1.body.content.0.content.0.text
     */
    protected array $exceptPatterns = [
        'data.*.content.*.text',
    ];

    protected function shouldSkip($key, $except)
    {
        return parent::shouldSkip($key, $except)
            || Str::is($this->exceptPatterns, $key);
    }
}
