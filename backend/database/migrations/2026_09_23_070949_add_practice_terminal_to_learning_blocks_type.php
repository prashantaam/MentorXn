<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE learning_blocks
            MODIFY COLUMN type ENUM(
                'content',
                'quiz',
                'practice_terminal'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE learning_blocks
            MODIFY COLUMN type ENUM(
                'content',
                'quiz'
            ) NOT NULL
        ");
    }
};