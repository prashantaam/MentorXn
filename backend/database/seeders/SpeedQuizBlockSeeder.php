<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Timed / speed quiz" block: a normal quiz with a visible countdown
 * — adds light time pressure. The timer starts when the student
 * presses Start and stops cleanly when they answer or leave. Same as
 * the Block Library's Timed / speed quiz, with several questions.
 *
 * Frontend: SpeedQuizBlock (component). Messages are added to every
 * block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=SpeedQuizBlockSeeder
 */
class SpeedQuizBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'SpeedQuizBlock'],
            [
                'name' => 'Timed / speed quiz',
                'icon' => '⏱️',
                'description' => 'A normal quiz with a visible countdown — adds light time pressure. The timer starts when the student presses Start.',
                'block_category_id' => $categoryId,
                'tags' => ['timed', 'speed', 'quiz', 'countdown', 'challenge'],
                'status' => 'active',
                'position' => 54,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Speed round',
                            'required' => true,
                            'visual' => [
                                'selector' => '.speed-quiz-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '⏱️',
                            'required' => false,
                            'visual' => [
                                'selector' => '.speed-quiz-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Answer as fast as you can!',
                            'visual' => [
                                'selector' => '.speed-quiz-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'questions',
                            'label' => 'Questions',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Question',
                            'visual' => [
                                'selector' => '.speed-quiz-block__question',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'question',
                                    'label' => 'Question',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 2,
                                    'placeholder' => 'e.g. What is 7 × 8?',
                                ],
                                [
                                    'name' => 'answers',
                                    'label' => 'Answers',
                                    'type' => 'answer_builder',
                                    'required' => true,
                                    'min_items' => 2,
                                    'placeholder' => 'Type an answer...',
                                    'help' => 'Add the possible answers, then select the correct answer.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'seconds',
                            'label' => 'Seconds per question',
                            'type' => 'number',
                            'default' => 10,
                            'min' => 3,
                            'max' => 120,
                            'step' => 1,
                            'required' => false,
                        ],
                        [
                            'name' => 'shuffle_answers',
                            'label' => 'Shuffle answers',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                        ],
                        [
                            'name' => 'complete_message',
                            'label' => 'Message on the result screen',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Speedy work! Try again to beat your score.',
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Speed round',
                    'icon' => '⏱️',
                    'subtitle' => 'Answer as fast as you can!',
                    'questions' => [
                        [
                            'question' => 'Quick! What is 7 × 8?',
                            'answers' => [
                                ['text' => '54', 'correct' => false],
                                ['text' => '56', 'correct' => true],
                                ['text' => '64', 'correct' => false],
                            ],
                        ],
                        [
                            'question' => 'What is 9 × 6?',
                            'answers' => [
                                ['text' => '54', 'correct' => true],
                                ['text' => '56', 'correct' => false],
                                ['text' => '63', 'correct' => false],
                            ],
                        ],
                    ],
                    'seconds' => 10,
                    'shuffle_answers' => true,
                    'complete_message' => 'Speedy work! Try again to beat your score.',
                ],
            ]
        );
    }
}
