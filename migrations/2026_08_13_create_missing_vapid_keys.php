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

use Flarum\Settings\SettingsRepositoryInterface;
use Minishlink\WebPush\VAPID;

return [
    'up'=> function () {
        $settings = resolve(SettingsRepositoryInterface::class);

        if ($settings->get('fof-pwa.vapid.private') && $settings->get('fof-pwa.vapid.public')) {
            return;
        }

        try {
            $keys = VAPID::createVapidKeys();
            $settings->set('fof-pwa.vapid.private', $keys['privateKey']);
            $settings->set('fof-pwa.vapid.public', $keys['publicKey']);
            $settings->set('fof-pwa.vapid.success', true);
        } catch (\Throwable $e) {
            $settings->set('fof-pwa.vapid.success', false);
            $settings->set('fof-pwa.vapid.error', $e->getMessage());
        }
    },
    'down'=> function () {
        // nothing here
    },
];
