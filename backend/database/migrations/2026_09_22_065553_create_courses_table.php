<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();

            // Teacher who owns/created the course
            $table->foreignId('teacher_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Basic course information
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Course classification
            $table->string('category')->nullable();
            $table->enum('level', [
                'Beginner',
                'Intermediate',
                'Advanced',
            ])->default('Beginner');

            // Publishing
            $table->enum('status', [
                'draft',
                'published',
            ])->default('draft');

            // Course appearance
            $table->string('icon', 20)->nullable();
            $table->string('accent_color', 20)
                ->default('#ff9a8b');

            // Set when the course is published
            $table->timestamp('published_at')->nullable();

            $table->timestamps();

            // Helpful for teacher course queries
            $table->index(['teacher_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};