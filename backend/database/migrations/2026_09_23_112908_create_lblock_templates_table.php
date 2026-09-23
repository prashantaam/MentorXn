<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lblock_templates', function (Blueprint $table) {
            $table->id();

            $table->string('name', 100);

            $table->string('type', 50)
                ->unique();

            $table->string('icon', 20)
                ->nullable();

            $table->text('description')
                ->nullable();

            /*
             * Maps the template to a trusted MentorXn
             * React learning-block component.
             *
             * Examples:
             * ContentBlock
             * QuizBlock
             * PracticeTerminalBlock
             */
            $table->string('component', 100);

            /*
             * Describes which content/configuration
             * fields teachers can edit.
             */
            $table->json('configuration_schema')
                ->nullable();

            /*
             * Default content/configuration used when
             * a teacher adds this block to a course.
             */
            $table->json('default_data')
                ->nullable();

            $table->string('status', 20)
                ->default('active');

            $table->unsignedInteger('position')
                ->default(0);

            $table->timestamps();

            $table->index('status');
            $table->index('position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'lblock_templates'
        );
    }
};