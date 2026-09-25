<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class QuizBlockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
         * =========================================
         * Find existing Quiz template
         * =========================================
         */

        $template = LBlockTemplate::query()
            ->where('component', 'QuizBlock')
            ->orWhere('name', 'Quiz')
            ->first();

        /*
         * =========================================
         * Configuration Schema
         * =========================================
         */

        $configurationSchema = [
            'fields' => [

                /*
                 * =================================
                 * Title
                 * =================================
                 */

                [
                    'name' => 'title',
                    'label' => 'Title',
                    'type' => 'text',
                    'required' => true,
                    'default' => 'Quick Quiz',
                ],

                /*
                 * =================================
                 * Icon
                 * =================================
                 */

                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'required' => false,
                    'default' => '🎯',
                ],

                /*
                 * =================================
                 * Instructions
                 * =================================
                 */

                [
                    'name' => 'subtitle',
                    'label' => 'Instructions',
                    'type' => 'textarea',
                    'required' => false,
                    'default' =>
                        'Choose the correct answer for each question.',
                ],

                /*
                 * =================================
                 * Questions
                 * =================================
                 */

                [
                    'name' => 'questions',
                    'label' => 'Questions',
                    'type' => 'repeater',
                    'required' => true,
                    'min_items' => 1,
                    'item_label' => 'Question',

                    'fields' => [

                        /*
                         * =========================
                         * Question
                         * =========================
                         */

                        [
                            'name' => 'question',
                            'label' => 'Question',
                            'type' => 'textarea',
                            'required' => true,
                            'rows' => 3,
                        ],

                        /*
                         * =========================
                         * Answers
                         * =========================
                         *
                         * Custom MentorXn field.
                         *
                         * The teacher can:
                         *
                         * - type an answer
                         * - click +
                         * - select the correct
                         *   answer using a radio
                         *   button
                         * - remove answers
                         *
                         * Stored value:
                         *
                         * [
                         *   [
                         *     'text' => '...',
                         *     'correct' => false,
                         *   ],
                         * ]
                         */

                        [
                            'name' => 'answers',
                            'label' => 'Answers',
                            'type' => 'answer_builder',
                            'required' => true,
                            'min_items' => 2,
                            'placeholder' =>
                                'Type an answer...',
                            'help' =>
                                'Add the possible answers, then select the correct answer.',
                        ],

                        /*
                         * =========================
                         * Correct Message
                         * =========================
                         */

                        [
                            'name' => 'correct_message',
                            'label' => 'Correct message',
                            'type' => 'textarea',
                            'required' => false,
                            'rows' => 2,
                            'default' => '🎉 Yes!',
                        ],

                        /*
                         * =========================
                         * Incorrect Message
                         * =========================
                         */

                        [
                            'name' => 'incorrect_message',
                            'label' => 'Incorrect message',
                            'type' => 'textarea',
                            'required' => false,
                            'rows' => 2,
                            'default' =>
                                'Not quite. Pick another answer, you can do it! 💪',
                        ],

                        /*
                         * =========================
                         * Explanation
                         * =========================
                         */

                        [
                            'name' => 'explanation',
                            'label' => 'Explanation',
                            'type' => 'textarea',
                            'required' => false,
                            'rows' => 4,
                        ],
                    ],
                ],

                /*
                 * =================================
                 * Shuffle Questions
                 * =================================
                 */

                [
                    'name' => 'shuffle_questions',
                    'label' => 'Shuffle questions',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => false,
                ],

                /*
                 * =================================
                 * Shuffle Answers
                 * =================================
                 */

                [
                    'name' => 'shuffle_answers',
                    'label' => 'Shuffle answers',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],

                /*
                 * =================================
                 * Show Question Numbers
                 * =================================
                 */

                [
                    'name' => 'show_question_numbers',
                    'label' => 'Show question numbers',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],

                /*
                 * =================================
                 * Retry Wrong Answers
                 * =================================
                 */

                [
                    'name' => 'retry_wrong_answers',
                    'label' => 'Retry wrong answers',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],

                /*
                 * =================================
                 * Completion Message
                 * =================================
                 */

                [
                    'name' => 'complete_message',
                    'label' => 'Completion message',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 3,
                    'default' =>
                        '🎉 Great work! You completed all the questions.',
                ],
            ],
        ];

        /*
         * =========================================
         * Example Data
         * =========================================
         */

        $exampleData = [
            'subtitle' =>
                'Choose the correct answer for each question.',

            'questions' => [

                /*
                 * Question 1
                 */

                [
                    'question' =>
                        'What is an algorithm?',

                    'answers' => [
                        [
                            'text' =>
                                'A type of computer',
                            'correct' => false,
                        ],
                        [
                            'text' =>
                                'A step-by-step set of instructions',
                            'correct' => true,
                        ],
                        [
                            'text' =>
                                'A programming language',
                            'correct' => false,
                        ],
                    ],

                    'correct_message' =>
                        '🎉 Yes!',

                    'incorrect_message' =>
                        'Not quite. Pick another answer, you can do it! 💪',

                    'explanation' =>
                        'An **algorithm** is a step-by-step recipe for solving a problem.',
                ],

                /*
                 * Question 2
                 */

                [
                    'question' =>
                        'What is code?',

                    'answers' => [
                        [
                            'text' =>
                                'A physical part inside a computer',
                            'correct' => false,
                        ],
                        [
                            'text' =>
                                'Instructions written in a language a computer can follow',
                            'correct' => true,
                        ],
                        [
                            'text' =>
                                'A type of computer screen',
                            'correct' => false,
                        ],
                    ],

                    'correct_message' =>
                        '🎉 Correct!',

                    'incorrect_message' =>
                        'Not quite. Pick another answer, you can do it! 💪',

                    'explanation' =>
                        '**Code** is a set of instructions written in a programming language.',
                ],

                /*
                 * Question 3
                 */

                [
                    'question' =>
                        'What is a bug in programming?',

                    'answers' => [
                        [
                            'text' =>
                                'An insect inside the computer',
                            'correct' => false,
                        ],
                        [
                            'text' =>
                                'A programming language',
                            'correct' => false,
                        ],
                        [
                            'text' =>
                                'A mistake in code that causes unexpected behaviour',
                            'correct' => true,
                        ],
                    ],

                    'correct_message' =>
                        '🎉 Exactly!',

                    'incorrect_message' =>
                        'Not quite. Pick another answer, you can do it! 💪',

                    'explanation' =>
                        'A **bug** is a mistake or problem in code that causes the program to behave unexpectedly.',
                ],
            ],

            'shuffle_questions' => false,

            'shuffle_answers' => true,

            'show_question_numbers' => true,

            'retry_wrong_answers' => true,

            'complete_message' =>
                '🎉 Great work! You completed all the questions.',
        ];

        /*
         * =========================================
         * Template Data
         * =========================================
         */

        $templateData = [
            'name' => 'Quiz',

            'component' =>
                'QuizBlock',

            'icon' => '🎯',

            'description' =>
                'Create an interactive multiple-choice quiz with one or more questions.',

            'tags' => [
                'quiz',
                'question',
                'assessment',
                'interactive',
            ],

            'configuration_schema' =>
                $configurationSchema,

            'example_data' =>
                $exampleData,

            'status' => 'active',

            'position' => 50,
        ];

        /*
         * =========================================
         * Create or Update
         * =========================================
         */

        if ($template) {
            $template->update(
                $templateData
            );

            return;
        }

        LBlockTemplate::create(
            $templateData
        );
    }
}