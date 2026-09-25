<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class QuizBlockSeeder extends Seeder
{
    public function run(): void
    {
        /*
         * =====================================================
         * Find Existing Template
         * =====================================================
         *
         * This allows the seeder to be run repeatedly without
         * creating duplicate Quiz templates.
         * =====================================================
         */

        $template = LBlockTemplate::query()
            ->where('component', 'QuizBlock')
            ->orWhere('name', 'Quiz')
            ->first();

        if (!$template) {
            $template = new LBlockTemplate();
        }


        /*
         * =====================================================
         * Basic Template Information
         * =====================================================
         */

        $template->name = 'Quiz';

        $template->component = 'QuizBlock';

        $template->icon = '🎯';

        $template->description =
            'Create an interactive quiz with multiple questions, '
            . 'multiple answer options, feedback and explanations.';

        $template->tags = [
            'quiz',
            'questions',
            'assessment',
            'knowledge-check',
            'interactive',
        ];


        /*
         * =====================================================
         * Teacher Configuration Schema
         * =====================================================
         */

        $template->configuration_schema = [
            'fields' => [

                /*
                 * -------------------------------------------------
                 * Block Title
                 * -------------------------------------------------
                 */

                [
                    'name' => 'title',
                    'label' => 'Block title',
                    'type' => 'text',
                    'required' => true,
                    'default' => 'Quick Quiz',
                ],


                /*
                 * -------------------------------------------------
                 * Block Icon
                 * -------------------------------------------------
                 */

                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'required' => false,
                    'default' => '🎯',
                ],


                /*
                 * -------------------------------------------------
                 * Instructions
                 * -------------------------------------------------
                 */

                [
                    'name' => 'subtitle',
                    'label' => 'Instructions',
                    'type' => 'textarea',
                    'rows' => 2,
                    'required' => false,
                    'default' =>
                        'Choose the correct answer for each question.',
                ],


                /*
                 * -------------------------------------------------
                 * Questions
                 * -------------------------------------------------
                 *
                 * Teachers can add as many questions as required.
                 * -------------------------------------------------
                 */

                [
                    'name' => 'questions',
                    'label' => 'Questions',
                    'type' => 'repeater',
                    'required' => true,
                    'item_label' => 'Question',
                    'min_items' => 1,

                    'fields' => [

                        /*
                         * Question Text
                         */

                        [
                            'name' => 'question',
                            'label' => 'Question',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => true,
                        ],


                        /*
                         * -----------------------------------------
                         * Answers
                         * -----------------------------------------
                         *
                         * Each question can contain as many answer
                         * options as required.
                         *
                         * For this first QuizBlock version,
                         * exactly ONE answer should be marked
                         * correct.
                         * -----------------------------------------
                         */

                        [
                            'name' => 'answers',
                            'label' => 'Answers',
                            'type' => 'repeater',
                            'required' => true,
                            'item_label' => 'Answer',
                            'min_items' => 2,

                            'fields' => [

                                [
                                    'name' => 'text',
                                    'label' => 'Answer',
                                    'type' => 'text',
                                    'required' => true,
                                ],

                                [
                                    'name' => 'correct',
                                    'label' => 'Correct answer',
                                    'type' => 'boolean',
                                    'required' => false,
                                    'default' => false,
                                ],
                            ],
                        ],


                        /*
                         * Correct Feedback
                         */

                        [
                            'name' => 'correct_message',
                            'label' => 'Correct message',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'default' => '🎉 Yes!',
                        ],


                        /*
                         * Incorrect Feedback
                         */

                        [
                            'name' => 'incorrect_message',
                            'label' => 'Incorrect message',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'default' =>
                                'Not quite. Pick another answer, you can do it! 💪',
                        ],


                        /*
                         * Explanation
                         */

                        [
                            'name' => 'explanation',
                            'label' => 'Explanation',
                            'type' => 'textarea',
                            'rows' => 3,
                            'required' => false,
                        ],
                    ],
                ],


                /*
                 * -------------------------------------------------
                 * Shuffle Questions
                 * -------------------------------------------------
                 */

                [
                    'name' => 'shuffle_questions',
                    'label' => 'Shuffle questions',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => false,
                ],


                /*
                 * -------------------------------------------------
                 * Shuffle Answers
                 * -------------------------------------------------
                 */

                [
                    'name' => 'shuffle_answers',
                    'label' => 'Shuffle answers',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],


                /*
                 * -------------------------------------------------
                 * Question Numbers
                 * -------------------------------------------------
                 */

                [
                    'name' => 'show_question_numbers',
                    'label' => 'Show question numbers',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],


                /*
                 * -------------------------------------------------
                 * Retry Incorrect Answers
                 * -------------------------------------------------
                 */

                [
                    'name' => 'retry_wrong_answers',
                    'label' => 'Allow retry after wrong answer',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],


                /*
                 * -------------------------------------------------
                 * Quiz Completion Message
                 * -------------------------------------------------
                 */

                [
                    'name' => 'complete_message',
                    'label' => 'Quiz complete message',
                    'type' => 'textarea',
                    'rows' => 2,
                    'required' => false,
                    'default' =>
                        '🎉 Great work! You completed all the questions.',
                ],
            ],
        ];


        /*
         * =====================================================
         * Example Data
         * =====================================================
         *
         * Programming Basics example showing that a single
         * Quiz block can contain multiple questions.
         * =====================================================
         */

        $template->example_data = [

            'title' => 'Quick Quiz',

            'icon' => '🎯',

            'subtitle' =>
                'Choose the correct answer for each question.',


            /*
             * -------------------------------------------------
             * Multiple Questions
             * -------------------------------------------------
             */

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
                                'Instructions written in a language a computer can follow',
                            'correct' => true,
                        ],
                        [
                            'text' =>
                                'The physical parts inside a computer',
                            'correct' => false,
                        ],
                        [
                            'text' =>
                                'Only the text shown on a computer screen',
                            'correct' => false,
                        ],
                    ],

                    'correct_message' =>
                        '🎉 Correct!',

                    'incorrect_message' =>
                        'Not quite. Try another answer! 💪',

                    'explanation' =>
                        '**Code** is a set of instructions written in a language a computer can follow.',
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
                                'A mistake in code that causes unexpected behaviour',
                            'correct' => true,
                        ],
                        [
                            'text' =>
                                'A programming language',
                            'correct' => false,
                        ],
                        [
                            'text' =>
                                'A computer keyboard',
                            'correct' => false,
                        ],
                    ],

                    'correct_message' =>
                        '🎉 Exactly!',

                    'incorrect_message' =>
                        'Not quite. Have another go! 💪',

                    'explanation' =>
                        'A **bug** is a mistake in code that makes a program behave differently from what was expected.',
                ],
            ],


            /*
             * -------------------------------------------------
             * Quiz Options
             * -------------------------------------------------
             */

            'shuffle_questions' => false,

            'shuffle_answers' => true,

            'show_question_numbers' => true,

            'retry_wrong_answers' => true,

            'complete_message' =>
                '🎉 Great work! You completed all the questions.',
        ];


        /*
         * =====================================================
         * Template Status
         * =====================================================
         */

        $template->status = 'active';

        $template->position = 50;

        $template->save();
    }
}