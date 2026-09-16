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

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('push_subscriptions', function (Blueprint $table) {
            $table->string('endpoint', 2048)->change();
        });
    },
    'down' => function (Builder $schema) {
        // Intentionally left unchanged to avoid truncating existing subscription endpoints.
    },
];
