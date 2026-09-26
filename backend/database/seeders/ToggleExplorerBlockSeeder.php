<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class ToggleExplorerBlockSeeder extends Seeder
{
    /**
     * Seed the Toggle Explorer learning block template.
     */
    public function run(): void
    {
        $template = LBlockTemplate::query()
            ->where('component', 'ToggleExplorerBlock')
            ->orWhere('name', 'Toggle Explorer')
            ->first();

        $configurationSchema = [
            'fields' => [
                [
                    'name' => 'title',
                    'label' => 'Title',
                    'type' => 'text',
                    'default' => 'Toggle Explorer',
                    'required' => true,
                ],
                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'default' => '💡',
                    'required' => false,
                ],
                [
                    'name' => 'description',
                    'label' => 'Description',
                    'type' => 'textarea',
                    'default' => '',
                    'required' => false,
                ],
                [
                    'name' => 'items',
                    'label' => 'Toggle items',
                    'type' => 'repeater',
                    'min' => 1,
                    'required' => true,
                    'fields' => [
                        [
                            'name' => 'label',
                            'label' => 'Label',
                            'type' => 'text',
                            'default' => '',
                            'required' => true,
                        ],
                        [
                            'name' => 'value',
                            'label' => 'Value',
                            'type' => 'number',
                            'default' => 1,
                            'required' => true,
                        ],
                    ],
                ],
                [
                    'name' => 'on_icon',
                    'label' => 'ON icon',
                    'type' => 'text',
                    'default' => '💡',
                    'required' => false,
                ],
                [
                    'name' => 'off_icon',
                    'label' => 'OFF icon',
                    'type' => 'text',
                    'default' => '⚪',
                    'required' => false,
                ],
                [
                    'name' => 'input_label',
                    'label' => 'Number input label',
                    'type' => 'text',
                    'default' => 'Decimal number',
                    'required' => false,
                ],
                [
                    'name' => 'show_input',
                    'label' => 'Show number input',
                    'type' => 'boolean',
                    'default' => true,
                ],
                [
                    'name' => 'show_binary',
                    'label' => 'Show binary result',
                    'type' => 'boolean',
                    'default' => true,
                ],
                [
                    'name' => 'show_total',
                    'label' => 'Show total',
                    'type' => 'boolean',
                    'default' => true,
                ],
            ],
        ];

        $exampleData = [
            'description' => 'Each bulb is worth a number when it is ON. Turn bulbs on and off and watch the total, or type a number and watch the bulbs react!',
            'items' => [
                [
                    'label' => '16',
                    'value' => 16,
                ],
                [
                    'label' => '8',
                    'value' => 8,
                ],
                [
                    'label' => '4',
                    'value' => 4,
                ],
                [
                    'label' => '2',
                    'value' => 2,
                ],
                [
                    'label' => '1',
                    'value' => 1,
                ],
            ],
            'on_icon' => '💡',
            'off_icon' => '⚪',
            'input_label' => 'Decimal number',
            'show_input' => true,
            'show_binary' => true,
            'show_total' => true,
        ];

        if ($template) {
            $template->update([
                'name' => 'Toggle Explorer',
                'description' => 'An interactive weighted toggle activity for exploring binary values, combinations and ON/OFF states.',
                'icon' => '💡',
                'component' => 'ToggleExplorerBlock',
                'configuration_schema' => $configurationSchema,
                'example_data' => $exampleData,
                'position' => 70,
            ]);

            return;
        }

        LBlockTemplate::create([
            'name' => 'Toggle Explorer',
            'description' => 'An interactive weighted toggle activity for exploring binary values, combinations and ON/OFF states.',
            'icon' => '💡',
            'component' => 'ToggleExplorerBlock',
            'configuration_schema' => $configurationSchema,
            'example_data' => $exampleData,
            'position' => 70,
        ]);
    }
}