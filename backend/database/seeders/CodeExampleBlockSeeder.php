<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class CodeExampleBlockSeeder extends Seeder
{
    public function run(): void
    {
        LBlockTemplate::updateOrCreate(
            [
                'name' => 'Coding Example',
                'component' => 'CodeExampleBlock',
            ],
            [
                'icon' => '💻',

                'description' =>
                    'Display a single code example or multiple tabbed examples with optional simulated terminal output and explanations.',

                'tags' => [
                    'code',
                    'example',
                    'programming',
                    'terminal',
                    'output',
                ],

                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Block title',
                            'type' => 'text',
                            'required' => true,
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'textarea',
                            'required' => false,
                        ],
                        [
                            'name' => 'description',
                            'label' => 'Code description',
                            'type' => 'textarea',
                            'rows' => 3,
                            'required' => false,
                        ],

                        /*
                         * =================================================
                         * Existing single-example mode
                         * =================================================
                         */

                        [
                            'name' => 'language',
                            'label' => 'Programming language',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'code',
                            'label' => 'Code',
                            'type' => 'textarea',
                            'rows' => 14,
                            'required' => false,
                        ],
                        [
                            'name' => 'highlightedLines',
                            'label' => 'Highlighted lines',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'command',
                            'label' => 'Run command',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'output',
                            'label' => 'Output',
                            'type' => 'textarea',
                            'rows' => 4,
                            'required' => false,
                        ],
                        [
                            'name' => 'explanation',
                            'label' => 'Explanation',
                            'type' => 'textarea',
                            'rows' => 5,
                            'required' => false,
                        ],

                        /*
                         * =================================================
                         * Multi-example mode
                         * =================================================
                         */

                        [
                            'name' => 'examples',
                            'label' => 'Multiple code examples',
                            'type' => 'repeater',
                            'required' => false,

                            'fields' => [
                                [
                                    'name' => 'label',
                                    'label' => 'Tab label',
                                    'type' => 'text',
                                    'required' => true,
                                ],
                                [
                                    'name' => 'language',
                                    'label' => 'Programming language',
                                    'type' => 'text',
                                    'required' => true,
                                ],
                                [
                                    'name' => 'code',
                                    'label' => 'Code',
                                    'type' => 'textarea',
                                    'rows' => 10,
                                    'required' => true,
                                ],
                                [
                                    'name' => 'command',
                                    'label' => 'Run command',
                                    'type' => 'text',
                                    'required' => false,
                                ],
                                [
                                    'name' => 'output',
                                    'label' => 'Simulated output',
                                    'type' => 'textarea',
                                    'rows' => 4,
                                    'required' => false,
                                ],
                                [
                                    'name' => 'explanation',
                                    'label' => 'Explanation',
                                    'type' => 'textarea',
                                    'rows' => 4,
                                    'required' => false,
                                ],
                            ],
                        ],

                        /*
                         * =================================================
                         * Interactive labels
                         * =================================================
                         */

                        [
                            'name' => 'run_button_label',
                            'label' => 'Run button label',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'output_placeholder',
                            'label' => 'Output placeholder',
                            'type' => 'text',
                            'required' => false,
                        ],
                    ],
                ],

                /*
                 * =========================================================
                 * Code Quest example
                 * =========================================================
                 */

                'example_data' => [
                    'title' =>
                        'Hello, World! in different languages',

                    'icon' => '👋',

                    'subtitle' =>
                        'See how the same instruction looks in different programming languages.',

                    'description' =>
                        'Every programmer\'s first program says hello! Choose a language, study the code, then run it to see the simulated terminal output.',

                    'run_button_label' =>
                        '▶ Run it',

                    'output_placeholder' =>
                        'Press run!',

                    'examples' => [
                        [
                            'label' =>
                                'Python',

                            'language' =>
                                'python',

                            'code' =>
                                'print("Hello, World!")',

                            'command' =>
                                'python hello.py',

                            'output' =>
                                'Hello, World! 🎉',

                            'explanation' =>
                                'Python uses the **print()** function to display text.',
                        ],

                        [
                            'label' =>
                                'JavaScript',

                            'language' =>
                                'javascript',

                            'code' =>
                                'console.log("Hello, World!");',

                            'command' =>
                                'node hello.js',

                            'output' =>
                                'Hello, World! 🎉',

                            'explanation' =>
                                'JavaScript can use **console.log()** to display text in the console.',
                        ],

                        [
                            'label' =>
                                'Java',

                            'language' =>
                                'java',

                            'code' => <<<'CODE'
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
CODE,

                            'command' =>
                                'javac Main.java && java Main',

                            'output' =>
                                'Hello, World! 🎉',

                            'explanation' =>
                                'Java code runs inside a class. The **main()** method is the starting point of this program.',
                        ],

                        [
                            'label' =>
                                'C',

                            'language' =>
                                'c',

                            'code' => <<<'CODE'
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
CODE,

                            'command' =>
                                'gcc hello.c -o hello && ./hello',

                            'output' =>
                                'Hello, World! 🎉',

                            'explanation' =>
                                'C uses **printf()** from the standard input/output library to display text.',
                        ],
                    ],
                ],

                'status' => 'active',

                'position' => 20,
            ]
        );
    }
}