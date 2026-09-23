<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class LBlockTemplateSeeder extends Seeder
{
    public function run(): void
    {
        /*
         * =========================================
         * Content
         * =========================================
         */

        LBlockTemplate::updateOrCreate(
            [
                'type' => 'content',
            ],
            [
                'name' => 'Content',

                'icon' => '📖',

                'description' =>
                    'Add explanatory learning content, notes and instructions.',

                'component' =>
                    'ContentBlock',

                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'content',
                            'label' => 'Content',
                            'type' => 'textarea',
                            'required' => true,
                        ],
                    ],
                ],

                'default_data' => [
                    'content' =>
                        'Enter your learning content here.',
                ],

                'status' => 'active',

                'position' => 1,
            ]
        );

        /*
         * =========================================
         * Quiz
         * =========================================
         */

        LBlockTemplate::updateOrCreate(
            [
                'type' => 'quiz',
            ],
            [
                'name' => 'Quiz',

                'icon' => '🧠',

                'description' =>
                    'Test learner understanding using multiple-choice questions.',

                'component' =>
                    'QuizBlock',

                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'instructions',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'passing_score',
                            'label' => 'Passing Score',
                            'type' => 'number',
                            'required' => true,
                        ],
                        [
                            'name' => 'allow_retry',
                            'label' => 'Allow Retry',
                            'type' => 'boolean',
                            'required' => true,
                        ],
                        [
                            'name' => 'questions',
                            'label' => 'Questions',
                            'type' => 'quiz_questions',
                            'required' => true,
                        ],
                    ],
                ],

                'default_data' => [
                    'instructions' =>
                        'Choose the best answer.',

                    'passing_score' => 100,

                    'allow_retry' => true,

                    'questions' => [],
                ],

                'status' => 'active',

                'position' => 2,
            ]
        );

        /*
         * =========================================
         * Practice Terminal
         * =========================================
         */

        LBlockTemplate::updateOrCreate(
            [
                'type' =>
                    'practice_terminal',
            ],
            [
                'name' =>
                    'Practice Terminal',

                'icon' => '🪄',

                'description' =>
                    'Provide safe simulated command-line practice without executing real shell commands.',

                'component' =>
                    'PracticeTerminalBlock',

                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'welcome',
                            'label' =>
                                'Welcome Message',
                            'type' => 'textarea',
                            'required' => false,
                        ],
                        [
                            'name' => 'tip',
                            'label' => 'Tip',
                            'type' => 'textarea',
                            'required' => false,
                        ],
                        [
                            'name' =>
                                'command_prefix',
                            'label' =>
                                'Command Prefix',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'commands',
                            'label' => 'Commands',
                            'type' =>
                                'terminal_commands',
                            'required' => true,
                        ],
                    ],
                ],

                'default_data' => [
                    'welcome' =>
                        'Welcome! Try a command.',

                    'tip' => '',

                    'command_prefix' => '$',

                    'commands' => [],
                ],

                'status' => 'active',

                'position' => 3,
            ]
        );
    }
}