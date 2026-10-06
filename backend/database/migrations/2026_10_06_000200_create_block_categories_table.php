<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * Block categories become managed data (developers edit them in the app)
 * instead of a fixed list in code.
 *
 *   1. Create block_categories and seed the five existing categories.
 *   2. Link templates by id (block_templates.block_category_id),
 *      filled in from the old block_templates.category text.
 *   3. Drop the old text column.
 *
 * A category that templates use can't be deleted (restrictOnDelete).
 */
return new class extends Migration
{
    /** The categories that existed in code, with their library colours. */
    private const INITIAL_CATEGORIES = [
        ['slug' => 'content', 'name' => 'Content', 'icon' => '📝', 'color' => '#8fd9a8'],
        ['slug' => 'assessment', 'name' => 'Assessment', 'icon' => '❓', 'color' => '#ffd84d'],
        ['slug' => 'manipulation', 'name' => 'Manipulation', 'icon' => '🧩', 'color' => '#7cd4ff'],
        ['slug' => 'process', 'name' => 'Process & structure', 'icon' => '🔄', 'color' => '#ff9a8b'],
        ['slug' => 'code', 'name' => 'Code', 'icon' => '💻', 'color' => '#6ee7b7'],
    ];

    public function up(): void
    {
        Schema::create('block_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60);
            $table->string('slug', 60)->unique();
            $table->string('icon', 20)->nullable();
            $table->string('color', 20)->default('#8fd9a8');
            $table->unsignedInteger('position')->default(0);
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->index(['status', 'position']);
        });

        $now = now();
        foreach (self::INITIAL_CATEGORIES as $index => $category) {
            DB::table('block_categories')->insert($category + [
                'position' => ($index + 1) * 10,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        Schema::table('block_templates', function (Blueprint $table) {
            $table->foreignId('block_category_id')
                ->nullable()
                ->after('component')
                ->constrained('block_categories')
                ->restrictOnDelete();
        });

        // Link each template to the category its old text column named.
        $idBySlug = DB::table('block_categories')->pluck('id', 'slug');
        foreach ($idBySlug as $slug => $id) {
            DB::table('block_templates')
                ->where('category', $slug)
                ->update(['block_category_id' => $id]);
        }

        Schema::table('block_templates', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        Schema::table('block_templates', function (Blueprint $table) {
            $table->string('category', 30)->default('content')->after('component')->index();
        });

        $slugById = DB::table('block_categories')->pluck('slug', 'id');
        foreach ($slugById as $id => $slug) {
            DB::table('block_templates')
                ->where('block_category_id', $id)
                ->update(['category' => $slug]);
        }

        Schema::table('block_templates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('block_category_id');
        });

        Schema::dropIfExists('block_categories');
    }
};
