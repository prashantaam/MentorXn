<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Teacher\CourseController;
use App\Http\Controllers\Api\Teacher\LessonController;
use App\Http\Controllers\Api\Teacher\TopicController;
use App\Http\Controllers\Api\Teacher\LearningBlockController;
use App\Http\Controllers\Api\Teacher\LBlockTemplateController;
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

        /*
        |--------------------------------------------------------------------------
        | Learning Block Templates
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/lblock-templates',
            [LBlockTemplateController::class, 'index']
        );

        Route::post(
            '/lblock-templates',
            [LBlockTemplateController::class, 'store']
        );

        Route::get(
            '/lblock-templates/{lblockTemplate}',
            [LBlockTemplateController::class, 'show']
        );

        Route::put(
            '/lblock-templates/{lblockTemplate}',
            [LBlockTemplateController::class, 'update']
        );

        Route::delete(
            '/lblock-templates/{lblockTemplate}',
            [LBlockTemplateController::class, 'destroy']
        );
    });
});