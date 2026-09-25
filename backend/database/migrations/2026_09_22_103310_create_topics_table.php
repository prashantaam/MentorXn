<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lesson_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');

            $table->string('icon', 20)
                ->nullable();

            $table->text('introduction');

            $table->unsignedInteger('position')
                ->default(1);

            $table->enum('status', [
                'draft',
                'published',
            ])->default('draft');

            $table->timestamps();

            $table->index([
                'lesson_id',
                'position',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topics');
    }
};