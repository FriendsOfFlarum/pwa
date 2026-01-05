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
        $tableName = 'push_subscriptions';
        $fullTableName = $prefix . $tableName;

        // Check if the unique constraint exists before dropping it
        // The unique index would have been created by the first migration
        try {
            $schemaManager = $connection->getDoctrineSchemaManager();
            $indexes = $schemaManager->listTableIndexes($fullTableName);

            // Check for the unique index with various possible names
            $hasUniqueIndex = false;
            foreach ($indexes as $index) {
                if ($index->isUnique() && in_array('endpoint', $index->getColumns())) {
                    $hasUniqueIndex = true;
                    break;
                }
            }

            if ($hasUniqueIndex) {
                $schema->table($tableName, function (Blueprint $table) {
                    $table->dropUnique(['endpoint']);
                });
            }
        } catch (\Exception $e) {
            // If Doctrine schema manager is not available or fails,
            // attempt to drop the constraint and catch any errors
            try {
                $schema->table($tableName, function (Blueprint $table) {
                    $table->dropUnique(['endpoint']);
                });
            } catch (\Exception $dropException) {
                // Index doesn't exist, which is fine
            }
        }
    },
    'down' => function (Builder $schema) {
    },
];
