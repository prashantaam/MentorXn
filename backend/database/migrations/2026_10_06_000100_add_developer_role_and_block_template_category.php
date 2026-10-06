<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * 1. Add a "developer" role. Developers manage block templates;
 *    accounts are created with `php artisan app:make-developer`.
 *
 * 2. Give block templates a real category, so the block library can
 *    group them without guessing from their names. Existing templates
 *    are backfilled from their React component.
 */
return new class extends Migration
{
    /** Component -> category for the templates that already exist. */
    private const CATEGORY_BY_COMPONENT = [
        'BigIdeasBlock' => 'content',
        'ChipSelectorBlock' => 'content',
        'ContentBlock' => 'content',

        'MCQQuizBlock' => 'assessment',
        'QuizBlock' => 'assessment',

        'FlipCardBlock' => 'manipulation',
        'FlipCardsBlock' => 'manipulation',
        'DragBucketBlock' => 'manipulation',
        'ArrangeTextBlock' => 'manipulation',
        'SequenceBlock' => 'manipulation',
        'ToggleExplorerBlock' => 'manipulation',

        'ProcessFlowBlock' => 'process',

        'CodeExampleBlock' => 'code',
        'CodeActionBlock' => 'code',
        'PracticeTerminalBlock' => 'code',
    ];

    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['student', 'teacher', 'developer'])
                ->default('student')
                ->change();
        });

        Schema::table('block_templates', function (Blueprint $table) {
            $table->string('category', 30)
                ->default('content')
                ->after('component')
                ->index();
        });

        foreach (self::CATEGORY_BY_COMPONENT as $component => $category) {
            DB::table('block_templates')
                ->where('component', $component)
                ->update(['category' => $category]);
        }
    }

    public function down(): void
    {
        Schema::table('block_templates', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });

        // Developers become teachers so the narrower enum can be restored.
        DB::table('users')->where('role', 'developer')->update(['role' => 'teacher']);

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['student', 'teacher'])
                ->default('student')
                ->change();
        });
    }
};
