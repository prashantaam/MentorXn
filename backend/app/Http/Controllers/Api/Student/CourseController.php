<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;

/**
 * Courses as students see them: read-only, and only published
 * courses. A course is visible once its teacher sets it to
 * "Published"; everything inside it (lessons, topics, blocks)
 * comes with it.
 */
class CourseController extends Controller
{
    /**
     * GET /api/student/courses — every published course, newest first.
     */
    public function index(): JsonResponse
    {
        $courses = Course::query()
            ->where('status', 'published')
            ->with('teacher:id,name')
            ->withCount('lessons')
            ->addSelect([
                'topics_count' => Topic::query()
                    ->selectRaw('count(*)')
                    ->join('lessons', 'lessons.id', '=', 'topics.lesson_id')
                    ->whereColumn('lessons.course_id', 'courses.id'),
            ])
            ->orderByDesc('published_at')
            ->get()
            ->map(fn (Course $course) => $this->summary($course));

        return response()->json([
            'courses' => $courses,
        ]);
    }

    /**
     * GET /api/student/courses/{course} — the course and its outline
     * (lessons with their topics; no block content).
     */
    public function show(Course $course): JsonResponse
    {
        if ($course->status !== 'published') {
            return $this->notFound();
        }

        $course->load([
            'teacher:id,name',
            'lessons:id,course_id,title,icon,description,position',
            'lessons.topics:id,lesson_id,title,icon,position',
        ]);

        return response()->json([
            'course' => [
                ...$this->summary($course),
                'lessons' => $course->lessons->map(fn ($lesson) => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'icon' => $lesson->icon,
                    'description' => $lesson->description,
                    'topics' => $lesson->topics->map(fn ($topic) => [
                        'id' => $topic->id,
                        'title' => $topic->title,
                        'icon' => $topic->icon,
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    /**
     * GET /api/student/topics/{topic} — one topic with its learning
     * blocks, ready for the block renderer.
     */
    public function topic(Topic $topic): JsonResponse
    {
        $topic->loadMissing('lesson.course');
        $course = $topic->lesson?->course;

        if (!$course || $course->status !== 'published') {
            return $this->notFound();
        }

        $blocks = $topic
            ->learningBlocks()
            ->with('blockTemplate:id,name,component,icon')
            ->orderBy('position')
            ->get(['id', 'topic_id', 'block_template_id', 'title', 'icon', 'data', 'position']);

        return response()->json([
            'topic' => [
                'id' => $topic->id,
                'lesson_id' => $topic->lesson_id,
                'course_id' => $course->id,
                'title' => $topic->title,
                'icon' => $topic->icon,
                'introduction' => $topic->introduction,
            ],
            'learning_blocks' => $blocks,
        ]);
    }

    private function summary(Course $course): array
    {
        return [
            'id' => $course->id,
            'title' => $course->title,
            'slug' => $course->slug,
            'description' => $course->description,
            'category' => $course->category,
            'level' => $course->level,
            'icon' => $course->icon,
            'accent_color' => $course->accent_color,
            'published_at' => $course->published_at,
            'teacher_name' => $course->teacher?->name,
            'lessons_count' => $course->lessons_count ?? $course->lessons?->count() ?? 0,
            'topics_count' => $course->topics_count
                ?? $course->lessons?->sum(fn ($lesson) => $lesson->topics->count())
                ?? 0,
        ];
    }

    private function notFound(): JsonResponse
    {
        return response()->json([
            'message' => 'Course not found.',
        ], 404);
    }
}
