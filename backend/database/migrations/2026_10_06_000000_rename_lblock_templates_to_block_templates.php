<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Rename "lblock" to "block":
 *
 *   lblock_templates                    -> block_templates
 *   learning_blocks.lblock_template_id  -> learning_blocks.block_template_id
 *
 * The foreign key (and the index MySQL created for it) is dropped,
 * the column renamed, then the key recreated with the same
 * ON DELETE SET NULL behaviour under its new name.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_blocks', function (Blueprint $table) {
            $table->dropForeign('learning_blocks_lblock_template_id_foreign');
            $table->dropIndex('learning_blocks_lblock_template_id_foreign');
        });

        Schema::rename('lblock_templates', 'block_templates');

        Schema::table('learning_blocks', function (Blueprint $table) {
            $table->renameColumn('lblock_template_id', 'block_template_id');
        });

        Schema::table('learning_blocks', function (Blueprint $table) {
            $table->foreign('block_template_id')
                ->references('id')
                ->on('block_templates')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('learning_blocks', function (Blueprint $table) {
            $table->dropForeign('learning_blocks_block_template_id_foreign');
            $table->dropIndex('learning_blocks_block_template_id_foreign');
        });

        Schema::rename('block_templates', 'lblock_templates');

        Schema::table('learning_blocks', function (Blueprint $table) {
            $table->renameColumn('block_template_id', 'lblock_template_id');
        });

        Schema::table('learning_blocks', function (Blueprint $table) {
            $table->foreign('lblock_template_id')
                ->references('id')
                ->on('lblock_templates')
                ->nullOnDelete();
        });
    }
};
