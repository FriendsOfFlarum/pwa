<?php

/*
 * This file is part of fof/pwa
 *
 * Copyright (c) 2021 Alexander Skvortsov.
 * Copyright (c) 2025 FriendsOfFlarum
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

use Flarum\Forum\Branding\ShortName;
use Flarum\Forum\Branding\SplashScreen;
use Illuminate\Database\Schema\Builder;

// Core's manifest now has a short name, a splash screen background colour and
// decides whether the forum opens as an app. A core setting an admin already
// filled in is kept. A value core would reject isn't moved, as the admin page
// couldn't be saved with it: a short name that is too long, for which core
// shortens the forum title, or a colour that isn't an opaque hex colour, for
// which core uses the app icon's background.
//
// The long name and theme colour are dropped: core's manifest takes the name
// from the forum title and the theme colour from the primary colour, which the
// page's theme-color meta tag also uses, so the two can't disagree.
//
// fof/pwa opened the forum as an app unless an admin chose another display
// mode, while core keeps upgraded forums in the browser. A forum that used
// fof/pwa at its default goes on opening as an app. A first install has no
// settings of its own yet, other than the push keys an earlier migration
// makes, and no push subscriptions, so it leaves core's setting alone.
return [
    'up' => function (Builder $schema) {
        $connection = $schema->getConnection();
        $settings = $connection->table('settings');

        $hadPwa = (clone $settings)->where('key', 'like', 'fof-pwa.%')->where('key', 'not like', 'fof-pwa.vapid.%')->exists()
            || $connection->table('push_subscriptions')->exists()
            || $connection->table('firebase_push_subscriptions')->exists();

        if ($hadPwa && !(clone $settings)->where('key', 'fof-pwa.display')->exists()) {
            (clone $settings)->updateOrInsert(['key' => 'open_as_app'], ['value' => '1']);
        }

        $move = function (string $from, string $to, callable $fits) use ($settings) {
            $value = trim((string) (clone $settings)->where('key', $from)->value('value'));

            if ($value !== '' && $fits($value) && trim((string) (clone $settings)->where('key', $to)->value('value')) === '') {
                (clone $settings)->updateOrInsert(['key' => $to], ['value' => $value]);
            }
        };

        $move('fof-pwa.shortName', 'forum_short_name', fn (string $name) => mb_strlen($name) <= ShortName::MAX_LENGTH);
        $move('fof-pwa.backgroundColor', 'splash_screen_background', fn (string $colour) => (bool) preg_match(SplashScreen::BACKGROUND_PATTERN, $colour));

        (clone $settings)->whereIn('key', ['fof-pwa.shortName', 'fof-pwa.backgroundColor', 'fof-pwa.display', 'fof-pwa.longName', 'fof-pwa.themeColor'])->delete();
    },
    'down' => function (Builder $schema) {
        // Core's settings may have been changed since, so they aren't moved back.
    },
];
