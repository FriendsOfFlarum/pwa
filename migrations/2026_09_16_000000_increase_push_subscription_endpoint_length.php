<?php

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
