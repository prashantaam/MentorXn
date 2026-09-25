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
                    'Display a code example with optional highlighted lines and an explanation.',

                'tags' => [
                    'code',
                    'example',
                    'programming',
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
                            'name' => 'language',
                            'label' => 'Programming language',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'description',
                            'label' => 'Code description',
                            'type' => 'textarea',
                            'rows' => 3,
                            'required' => false,
                        ],
                        [
                            'name' => 'code',
                            'label' => 'Code',
                            'type' => 'textarea',
                            'rows' => 14,
                            'required' => true,
                        ],
                        [
                            'name' => 'highlightedLines',
                            'label' => 'Highlighted lines',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'explanation',
                            'label' => 'Explanation',
                            'type' => 'textarea',
                            'rows' => 5,
                            'required' => false,
                        ],
                    ],
                ],

                'example_data' => [
                    'title' => 'Your First C# Class',
                    'icon' => '💻',

                    'subtitle' =>
                        'Study the code example and the highlighted lines.',

                    'language' => 'C#',

                    'description' =>
                        'This example shows a simple C# class with a property and a method.',

                    'code' => <<<'CODE'
public class Student
{
    public string Name { get; set; }

    public void Study()
    {
        Console.WriteLine("Learning!");
    }
}
CODE,

                    'highlightedLines' => '1, 3, 5-8',

                    'explanation' =>
                        'The Student class contains data through the Name property and behaviour through the Study method.',
                ],

                'status' => 'active',

                'position' => 20,
            ]
        );
    }
}