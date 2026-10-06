<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Teacher\CourseController;
use App\Http\Controllers\Api\Teacher\LessonController;
use App\Http\Controllers\Api\Teacher\TopicController;
use App\Http\Controllers\Api\Teacher\LearningBlockController;
use App\Http\Controllers\Api\Teacher\BlockTemplateController;
use App\Http\Controllers\Api\Dev\BlockTemplateController as DevBlockTemplateController;
use App\Http\Controllers\Api\Dev\BlockCategoryController as DevBlockCategoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Student Authentication
|--------------------------------------------------------------------------
*/

Route::prefix('student')->group(function () {
    Route::post(
        '/register',
        [AuthController::class, 'registerStudent']
    );

    Route::post(
        '/login',
        [AuthController::class, 'loginStudent']
    );
});

/*
|--------------------------------------------------------------------------
| Teacher Authentication
|--------------------------------------------------------------------------
*/

Route::prefix('teacher')->group(function () {
    Route::post(
        '/register',
        [AuthController::class, 'registerTeacher']
    );

    Route::post(
        '/login',
        [AuthController::class, 'loginTeacher']
    );
});

/*
|--------------------------------------------------------------------------
| Developer Authentication (no public sign-up)
|--------------------------------------------------------------------------
*/

Route::post(
    '/dev/login',
    [AuthController::class, 'loginDeveloper']
);

/*
|--------------------------------------------------------------------------
| Authenticated API
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/user',
        [AuthController::class, 'user']
    );

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    /*
    |--------------------------------------------------------------------------
    | Teacher API
    |--------------------------------------------------------------------------
    */

    Route::prefix('teacher')->group(function () {
        /*
        |--------------------------------------------------------------------------
        | Courses
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/courses',
            [CourseController::class, 'index']
        );

        Route::post(
            '/courses',
            [CourseController::class, 'store']
        );

        Route::get(
            '/courses/{course}',
            [CourseController::class, 'show']
        );

        Route::put(
            '/courses/{course}',
            [CourseController::class, 'update']
        );

        /*
        |--------------------------------------------------------------------------
        | Lessons
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/courses/{course}/lessons',
            [LessonController::class, 'index']
        );

        Route::post(
            '/courses/{course}/lessons',
            [LessonController::class, 'store']
        );

        Route::put(
            '/lessons/{lesson}',
            [LessonController::class, 'update']
        );

        Route::delete(
            '/lessons/{lesson}',
            [LessonController::class, 'destroy']
        );

        /*
        |--------------------------------------------------------------------------
        | Topics
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/lessons/{lesson}/topics',
            [TopicController::class, 'index']
        );

        Route::post(
            '/lessons/{lesson}/topics',
            [TopicController::class, 'store']
        );

        Route::put(
            '/topics/{topic}',
            [TopicController::class, 'update']
        );

        Route::delete(
            '/topics/{topic}',
            [TopicController::class, 'destroy']
        );

        /*
        |--------------------------------------------------------------------------
        | Learning Blocks
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/topics/{topic}/learning-blocks',
            [LearningBlockController::class, 'index']
        );

        Route::post(
            '/topics/{topic}/learning-blocks',
            [LearningBlockController::class, 'store']
        );

        Route::put(
            '/topics/{topic}/learning-blocks/reorder',
            [LearningBlockController::class, 'reorder']
        );

        Route::get(
            '/learning-blocks/{learningBlock}',
            [LearningBlockController::class, 'show']
        );
        Route::put(
            '/learning-blocks/{learningBlock}',
            [LearningBlockController::class, 'update']
        );

        Route::delete(
            '/learning-blocks/{learningBlock}',
            [LearningBlockController::class, 'destroy']
        );

        /*
        |--------------------------------------------------------------------------
        | Block Templates (read-only; managed by developers below)
        |--------------------------------------------------------------------------
        */

        Route::middleware('role:teacher,developer')->group(function () {
            Route::get(
                '/block-templates',
                [BlockTemplateController::class, 'index']
            );

            Route::get(
                '/block-templates/{blockTemplate}',
                [BlockTemplateController::class, 'show']
            );
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Developer: manage block templates
    |--------------------------------------------------------------------------
    */

    Route::prefix('dev')
        ->middleware('role:developer')
        ->group(function () {
            Route::get(
                '/block-templates',
                [DevBlockTemplateController::class, 'index']
            );

            Route::post(
                '/block-templates',
                [DevBlockTemplateController::class, 'store']
            );

            Route::get(
                '/block-templates/{blockTemplate}',
                [DevBlockTemplateController::class, 'show']
            );

            Route::put(
                '/block-templates/{blockTemplate}',
                [DevBlockTemplateController::class, 'update']
            );

            Route::delete(
                '/block-templates/{blockTemplate}',
                [DevBlockTemplateController::class, 'destroy']
            );

            Route::get(
                '/block-categories',
                [DevBlockCategoryController::class, 'index']
            );

            Route::post(
                '/block-categories',
                [DevBlockCategoryController::class, 'store']
            );

            Route::put(
                '/block-categories/{blockCategory}',
                [DevBlockCategoryController::class, 'update']
            );

            Route::delete(
                '/block-categories/{blockCategory}',
                [DevBlockCategoryController::class, 'destroy']
            );
        });
});
