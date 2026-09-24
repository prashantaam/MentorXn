<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'lblock_templates',
            function (Blueprint $table) {
                /*
                 * Type is no longer required.
                 *
                 * Tags will be used for searching
                 * and filtering templates instead.
                 */
                $table->dropUnique(
                    'lblock_templates_type_unique'
                );

                $table->dropColumn('type');
            }
        );

        Schema::table(
            'lblock_templates',
            function (Blueprint $table) {
                /*
                 * Flexible template tags.
                 *
                 * Examples:
                 *
                 * ["Content", "Code"]
                 *
                 * ["Content", "Mascot", "Code"]
                 *
                 * ["Interactive", "Buttons"]
                 */
                $table
                    ->json('tags')
                    ->nullable()
                    ->after('component');

                /*
                 * Rename default_data because this
                 * data is used to demonstrate and
                 * preview the template.
                 */
                $table->renameColumn(
                    'default_data',
                    'example_data'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::table(
            'lblock_templates',
            function (Blueprint $table) {
                $table->renameColumn(
                    'example_data',
                    'default_data'
                );

                $table->dropColumn('tags');

                $table
                    ->string('type', 50)
                    ->nullable();
            }
        );

        Schema::table(
            'lblock_templates',
            function (Blueprint $table) {
                $table->unique('type');
            }
        );
    }
};