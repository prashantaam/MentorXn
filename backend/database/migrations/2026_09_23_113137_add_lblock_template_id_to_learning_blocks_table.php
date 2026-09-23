<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'learning_blocks',
            function (Blueprint $table) {
                $table
                    ->foreignId(
                        'lblock_template_id'
                    )
                    ->nullable()
                    ->after('topic_id')
                    ->constrained(
                        'lblock_templates'
                    )
                    ->nullOnDelete();
            }
        );
    }

    public function down(): void
    {
        Schema::table(
            'learning_blocks',
            function (Blueprint $table) {
                $table->dropForeign([
                    'lblock_template_id',
                ]);

                $table->dropColumn(
                    'lblock_template_id'
                );
            }
        );
    }
};