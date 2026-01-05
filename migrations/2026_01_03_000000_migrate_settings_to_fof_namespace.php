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

use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $connection = $schema->getConnection();

        // Get all askvortsov-pwa.* settings
        $settings = $connection->table('settings')
            ->where('key', 'like', 'askvortsov-pwa.%')
            ->get();

        // Update each setting key to use fof-pwa prefix
        foreach ($settings as $setting) {
            $newKey = str_replace('askvortsov-pwa.', 'fof-pwa.', $setting->key);

            $connection->table('settings')
                ->where('key', $setting->key)
                ->update(['key' => $newKey]);
        }
    },
    'down' => function (Builder $schema) {
        $connection = $schema->getConnection();

        // Get all fof-pwa.* settings
        $settings = $connection->table('settings')
            ->where('key', 'like', 'fof-pwa.%')
            ->get();

        // Update each setting key to use askvortsov-pwa prefix
        foreach ($settings as $setting) {
            $oldKey = str_replace('fof-pwa.', 'askvortsov-pwa.', $setting->key);

            $connection->table('settings')
                ->where('key', $setting->key)
                ->update(['key' => $oldKey]);
        }
    },
];
