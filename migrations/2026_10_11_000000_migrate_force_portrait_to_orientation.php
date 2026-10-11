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
        $forcePortrait = $connection->table('settings')->where('key', 'fof-pwa.forcePortrait')->value('value');

        if ($forcePortrait === null) {
            return;
        }

        $connection->table('settings')->insertOrIgnore([
            'key'   => 'fof-pwa.orientation',
            'value' => $forcePortrait ? 'portrait' : 'any',
        ]);
        $connection->table('settings')->where('key', 'fof-pwa.forcePortrait')->delete();
    },
    'down' => function (Builder $schema) {
        $connection = $schema->getConnection();
        $orientation = $connection->table('settings')->where('key', 'fof-pwa.orientation')->value('value');

        if ($orientation === null) {
            return;
        }

        $connection->table('settings')->updateOrInsert(
            ['key' => 'fof-pwa.forcePortrait'],
            ['value' => $orientation === 'portrait' ? '1' : '0']
        );
        $connection->table('settings')->where('key', 'fof-pwa.orientation')->delete();
    },
];
