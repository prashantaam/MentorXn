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
                    'Display one or more syntax-highlighted code examples with optional simulated run output.',

                'tags' => [
                    'code',
                    'example',
                    'programming',
                    'terminal',
                    'output',
                ],

                'configuration_schema' => [
                    'fields' => [

                        /*
                         * =========================================
                         * Block
                         * =========================================
                         */

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
                            'rows' => 3,
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
                         * =========================================
                         * Run / Output
                         * =========================================
                         */

                        [
                            'name' => 'show_run_button',
                            'label' => 'Show Run button',
                            'type' => 'boolean',
                            'default' => false,
                            'required' => false,
                            'help' =>
                                'Enable this to let the student reveal the configured simulated terminal output.',
                        ],

                        [
                            'name' => 'run_button_label',
                            'label' => 'Run button label',
                            'type' => 'text',
                            'default' => '▶ Run it',
                            'required' => false,
                        ],

                        [
                            'name' => 'output_placeholder',
                            'label' => 'Output placeholder',
                            'type' => 'text',
                            'default' => 'Press run!',
                            'required' => false,
                        ],

                        /*
                         * =========================================
                         * Code Examples
                         * =========================================
                         *
                         * One item:
                         *   single code example
                         *
                         * Multiple items:
                         *   tabbed code examples
                         * =========================================
                         */

                        [
                            'name' => 'examples',
                            'label' => 'Code examples',
                            'type' => 'repeater',
                            'item_label' => 'Example',
                            'min_items' => 1,
                            'required' => true,

                            'help' =>
                                'Add one example for a single code display. Add multiple examples to automatically show tabs.',

                            'fields' => [

                                [
                                    'name' => 'label',
                                    'label' => 'Tab / display label',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. Python',
                                ],

                                [
                                    'name' => 'language',
                                    'label' => 'Syntax language',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. python',
                                ],

                                [
                                    'name' => 'code',
                                    'label' => 'Code',
                                    'type' => 'code',
                                    'rows' => 12,
                                    'required' => true,
                                ],

                                [
                                    'name' => 'command',
                                    'label' => 'Run command',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' =>
                                        'e.g. python hello.py',
                                ],

                                [
                                    'name' => 'output',
                                    'label' => 'Simulated output',
                                    'type' => 'textarea',
                                    'rows' => 4,
                                    'required' => false,
                                    'placeholder' =>
                                        'e.g. Hello, World! 🎉',
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
                    ],
                ],

                /*
                 * =========================================
                 * Example Data
                 * =========================================
                 *
                 * Code Quest:
                 * Hello, World! in different languages
                 * =========================================
                 */

                'example_data' => [

                    'title' =>
                        'Hello, World! in different languages',

                    'icon' => '👋',

                    'subtitle' =>
                        'See how the same instruction looks in different programming languages.',

                    'description' =>
                        'Every programmer\'s first program says hello! Choose a language, study the code, then run it to see the simulated terminal output.',

                    'show_run_button' => true,

                    'run_button_label' =>
                        '▶ Run it',

                    'output_placeholder' =>
                        'Press run!',

                    'examples' => [

                        [
                            'label' => 'Python',

                            'language' =>
                                'python',

                            'code' =>
                                <<<'CODE'
print("Hello, World!")
CODE,

                            'command' =>
                                'python hello.py',

                            'output' =>
                                'Hello, World! 🎉',

                            'explanation' =>
                                'Python uses the print() function to display text.',
                        ],

                        [
                            'label' =>
                                'JavaScript',

                            'language' =>
                                'javascript',

                            'code' =>
                                <<<'CODE'
console.log("Hello, World!");
CODE,

                            'command' =>
                                'node hello.js',

                            'output' =>
                                'Hello, World! 🎉',

                            'explanation' =>
                                'JavaScript can display text in the console using console.log().',
                        ],

                        [
                            'label' => 'Java',

                            'language' =>
                                'java',

                            'code' =>
                                <<<'CODE'
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
                                'Java programs normally run inside a class, with execution beginning in the main method.',
                        ],

                        [
                            'label' => 'C',

                            'language' => 'c',

                            'code' =>
                                <<<'CODE'
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
                                'C uses printf() from the standard input/output library to display text.',
                        ],
                    ],
                ],

                'status' => 'active',

                'position' => 20,
            ]
        );
    }
}