<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Practice Terminal" block: a safe pretend terminal for practising
 * commands. Nothing runs for real — the frontend simulates it
 * (lib/practiceTerminal). The teacher picks a terminal type:
 *
 *   - git:    version control, like Code Quest's "Version control:
 *             saving snapshots with Git" (with a commit history)
 *   - linux:  a small file system + shell commands (pwd, ls, cd,
 *             mkdir, touch, cat, echo, rm, cp, mv, tree…), with a
 *             folder tree
 *   - custom: the teacher's own "command -> output" pairs, for any
 *             tool (npm, python, docker…)
 *
 * Any type can have a task checklist that ticks off as students
 * run the commands.
 *
 * Frontend: PracticeTerminalBlock (component). Messages are added
 * to every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=PracticeTerminalBlockSeeder
 */
class PracticeTerminalBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'code')->value('id');

        $show = fn (string $kind) => ['field' => 'kind', 'equals' => $kind];

        BlockTemplate::updateOrCreate(
            ['component' => 'PracticeTerminalBlock'],
            [
                'name' => 'Practice Terminal',
                'icon' => '💻',
                'description' => 'A safe pretend terminal for practising commands — Git (with a commit history), Linux (with a folder tree), or any tool you set up yourself (npm, python, docker…). Add a task checklist that ticks off as students run commands. Nothing runs for real.',
                'block_category_id' => $categoryId,
                'tags' => ['terminal', 'command line', 'git', 'linux', 'shell', 'practice'],
                'status' => 'active',
                'position' => 28,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Practice terminal',
                            'required' => true,
                            'visual' => [
                                'selector' => '.practice-terminal-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '💻',
                            'required' => false,
                            'visual' => [
                                'selector' => '.practice-terminal-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Tap the commands in order, or type your own.',
                            'visual' => [
                                'selector' => '.practice-terminal-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'kind',
                            'label' => 'Terminal type',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'git',
                            'options' => [
                                ['value' => 'git', 'label' => 'Git (version control)'],
                                ['value' => 'linux', 'label' => 'Linux shell (files and folders)'],
                                ['value' => 'custom', 'label' => 'Custom (your own commands and outputs)'],
                            ],
                        ],
                        [
                            'name' => 'welcome',
                            'label' => 'Welcome message (optional)',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'Leave empty for a friendly default.',
                            'help' => 'The first line shown in the terminal.',
                            'visual' => [
                                'selector' => '.practice-terminal-block .term',
                            ],
                        ],
                        [
                            'name' => 'suggestions',
                            'label' => 'Suggested commands',
                            'type' => 'code',
                            'rows' => 8,
                            'required' => false,
                            'placeholder' => 'One command per line',
                            'help' => 'Each line becomes a chip students can tap. Leave empty to use the defaults for the terminal type.',
                            'visual' => [
                                'selector' => '.practice-terminal-block__spells',
                            ],
                        ],
                        [
                            'name' => 'suggestions_mode',
                            'label' => 'Suggested commands are',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'show',
                            'options' => [
                                ['value' => 'show', 'label' => 'Shown'],
                                ['value' => 'button', 'label' => 'Hidden behind a "💡 Show commands" button'],
                                ['value' => 'hide', 'label' => 'Not shown (students type everything)'],
                            ],
                        ],

                        /* ---------- Git ---------- */
                        [
                            'name' => 'files',
                            'label' => 'Pretend project files',
                            'type' => 'text',
                            'default' => 'app.py',
                            'required' => false,
                            'help' => 'Comma separated. These files don\'t really exist — they are just the names "git add ." stages in the pretend project.',
                            'show_when' => $show('git'),
                        ],

                        /* ---------- Linux ---------- */
                        [
                            'name' => 'username',
                            'label' => 'User name',
                            'type' => 'text',
                            'default' => 'student',
                            'required' => false,
                            'help' => 'Shown in the prompt: student@mentorxn:~$',
                            'show_when' => $show('linux'),
                        ],
                        [
                            'name' => 'start_files',
                            'label' => 'Starting files and folders',
                            'type' => 'code',
                            'rows' => 6,
                            'default' => "notes.txt = Remember to practise!\nprojects/\nprojects/app.py = print(\"Hello!\")",
                            'required' => false,
                            'help' => 'One per line, inside the home folder (~). End a folder with /. Give a file some text with " = ", e.g. notes.txt = Hello. Students can use: pwd, ls [-a -l], cd, mkdir [-p], touch, cat, echo [> or >> file], rm [-r], rmdir, cp [-r], mv, tree, whoami, clear, help.',
                            'show_when' => $show('linux'),
                        ],

                        /* ---------- Custom ---------- */
                        [
                            'name' => 'responses',
                            'label' => 'Commands and their output',
                            'type' => 'repeater',
                            'required' => false,
                            'item_label' => 'Command',
                            'help' => 'What the terminal prints for each command. Use * to match anything, e.g. "pip install *", and {1} in the output to repeat it.',
                            'show_when' => $show('custom'),
                            'fields' => [
                                [
                                    'name' => 'command',
                                    'label' => 'Command',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. pip install *',
                                ],
                                [
                                    'name' => 'output',
                                    'label' => 'Output',
                                    'type' => 'code',
                                    'rows' => 3,
                                    'required' => false,
                                    'placeholder' => 'e.g. Successfully installed {1}',
                                ],
                                [
                                    'name' => 'kind',
                                    'label' => 'Colour',
                                    'type' => 'select',
                                    'required' => true,
                                    'default' => '',
                                    'options' => [
                                        ['value' => '', 'label' => 'Normal'],
                                        ['value' => 'ok', 'label' => 'Green (success)'],
                                        ['value' => 'bad', 'label' => 'Red (error)'],
                                        ['value' => 'dim', 'label' => 'Grey (info)'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'name' => 'prompt_text',
                            'label' => 'Prompt (optional)',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. student@laptop:~/project',
                            'help' => 'Shown before the $ on each command.',
                            'show_when' => $show('custom'),
                        ],
                        [
                            'name' => 'unknown_message',
                            'label' => 'Message for other commands',
                            'type' => 'text',
                            'default' => '{command}: command not found',
                            'required' => false,
                            'help' => '{command} is the first word the student typed.',
                            'show_when' => $show('custom'),
                        ],

                        /* ---------- All types ---------- */
                        [
                            'name' => 'show_panel',
                            'label' => 'Show the commit history (Git) / folder tree (Linux)',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                            'visual' => [
                                'selector' => '.practice-terminal-block__panel',
                            ],
                        ],
                        [
                            'name' => 'tasks',
                            'label' => 'Tasks (optional)',
                            'type' => 'repeater',
                            'required' => false,
                            'item_label' => 'Task',
                            'help' => 'Students see the instruction; it ticks off when they run one of its commands without an error.',
                            'visual' => [
                                'selector' => '.practice-terminal-block__task',
                                'selection_type' => 'repeater',
                            ],
                            'fields' => [
                                [
                                    'name' => 'instruction',
                                    'label' => 'Instruction',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. Create a directory called test',
                                ],
                                [
                                    'name' => 'command',
                                    'label' => 'Command that completes it',
                                    'type' => 'code',
                                    'rows' => 2,
                                    'required' => true,
                                    'placeholder' => 'e.g. mkdir test',
                                    'help' => 'More than one right answer? Put each on its own line (e.g. mkdir test and mkdir -p test). Use * for "anything", e.g. git commit -m *. Extra spaces and " vs \' quotes don\'t matter.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'task_command_mode',
                            'label' => 'The command for each task is',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'button',
                            'options' => [
                                ['value' => 'show', 'label' => 'Shown under the instruction'],
                                ['value' => 'button', 'label' => 'Hidden behind a "💡 Show command" button'],
                                ['value' => 'hide', 'label' => 'Not shown'],
                            ],
                        ],
                        [
                            'name' => 'tasks_in_order',
                            'label' => 'Tasks must be done in order',
                            'type' => 'boolean',
                            'default' => false,
                            'required' => false,
                        ],
                        [
                            'name' => 'complete_message',
                            'label' => 'Message when all tasks are done',
                            'type' => 'text',
                            'default' => '🎉 All tasks done — nice work!',
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Practice terminal',
                    'icon' => '🌿',
                    'subtitle' => 'Tap the commands in order, or type your own.',
                    'kind' => 'git',
                    'welcome' => '',
                    // Empty = each terminal type's own suggested commands.
                    'suggestions' => '',

                    // Git
                    'files' => 'app.py',

                    // Linux
                    'username' => 'student',
                    'start_files' => "notes.txt = Remember to practise!\nprojects/\nprojects/app.py = print(\"Hello!\")",

                    // Custom (example: Python tools)
                    'responses' => [
                        ['command' => 'python --version', 'output' => 'Python 3.12.1', 'kind' => ''],
                        ['command' => 'pip install *', 'output' => "Collecting {1}\nSuccessfully installed {1}", 'kind' => 'ok'],
                        ['command' => 'python app.py', 'output' => 'Hello!', 'kind' => ''],
                    ],
                    'prompt_text' => '',
                    'unknown_message' => '{command}: command not found',

                    'suggestions_mode' => 'show',
                    'show_panel' => true,
                    'tasks' => [],
                    'task_command_mode' => 'button',
                    'tasks_in_order' => false,
                    'complete_message' => '🎉 All tasks done — nice work!',
                ],
            ]
        );
    }
}
