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
        if (!$schema->hasTable('push_subscriptions')) {
            return;
        }

        $connection = $schema->getConnection();
        $prefix = $connection->getTablePrefix();
        $tableName = $prefix . 'push_subscriptions';

        // Check current collation of the endpoint column
        $columns = $connection->select("SHOW FULL COLUMNS FROM `{$tableName}` WHERE Field = 'endpoint'");

        if (!empty($columns)) {
            $column = $columns[0];
            $currentCollation = $column->Collation ?? '';

            // Only change if collation is not already utf8mb4_bin
            if ($currentCollation !== 'utf8mb4_bin') {
                $schema->table('push_subscriptions', function (Blueprint $table) {
                    $table->string('endpoint')->collation('utf8mb4_bin')->change();
                });
            }
        }
    },
    'down' => function (Builder $schema) {
    },
];
