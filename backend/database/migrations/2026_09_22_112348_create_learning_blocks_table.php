<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_blocks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('topic_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('type', [
                'content',
                'quiz',
            ]);

            /*
             * Optional because the first content block
             * may not have its own heading.
             */
            $table->string('title')
                ->nullable();

            $table->string('icon', 20)
                ->nullable();

            /*
             * Block-specific configuration/content.
             *
             * Content:
             * {
             *   "content": "...",
             *   ...
             * }
             *
             * Quiz:
             * {
             *   "questions": [...]
             * }
             */
            $table->json('data');

            $table->unsignedInteger('position')
                ->default(1);

            $table->enum('status', [
                'draft',
                'published',
            ])->default('draft');

            $table->timestamps();

            $table->index([
                'topic_id',
                'position',
            ]);

            $table->index([
                'topic_id',
                'type',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_blocks');
    }
};