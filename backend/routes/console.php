<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 * Developer accounts have no public sign-up. This promotes an existing
 * user to developer, or creates a new developer account.
 *
 *   php artisan app:make-developer dev@example.com
 *   php artisan app:make-developer dev@example.com --name="Dev" --password="secret123"
 */
Artisan::command('app:make-developer {email} {--name=Developer} {--password=}', function () {
    $email = strtolower(trim($this->argument('email')));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error("\"{$email}\" is not a valid email address.");
        return 1;
    }

    $user = \App\Models\User::where('email', $email)->first();

    if ($user) {
        $previous = $user->role;
        $user->update(['role' => 'developer']);
        $this->info("{$email} is now a developer (was: {$previous}). Their password is unchanged.");
        return 0;
    }

    $password = $this->option('password') ?: \Illuminate\Support\Str::password(16, symbols: false);

    if (strlen($password) < 8) {
        $this->error('The password must be at least 8 characters.');
        return 1;
    }

    \App\Models\User::create([
        'name' => $this->option('name'),
        'email' => $email,
        'password' => $password, // hashed by the User model's cast
        'role' => 'developer',
    ]);

    $this->info("Developer account created: {$email}");

    if (!$this->option('password')) {
        $this->warn("Generated password (shown once): {$password}");
    }

    return 0;
})->purpose('Create a developer account, or promote an existing user to developer');
