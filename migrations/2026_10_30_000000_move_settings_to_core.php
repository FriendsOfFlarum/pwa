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

// The long name and theme colour are dropped: core takes them from the forum
// title and primary colour.
//
// Core keeps upgraded forums in the browser, while fof/pwa opened them as an app
// in every display mode but "browser". The push keys alone don't tell an
// upgrade apart: an earlier migration makes them on install.
return [
    'up' => function (Builder $schema) {
        $connection = $schema->getConnection();
        $settings = $connection->table('settings');

        $hadPwa = (clone $settings)->where('key', 'like', 'fof-pwa.%')->where('key', 'not like', 'fof-pwa.vapid.%')->exists()
            || $connection->table('push_subscriptions')->exists()
            || $connection->table('firebase_push_subscriptions')->exists();

        if ($hadPwa && trim((string) (clone $settings)->where('key', 'fof-pwa.display')->value('value')) !== 'browser') {
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
