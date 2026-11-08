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

namespace FoF\PWA;

use Flarum\Extend;
use Flarum\Foundation\Event\ClearingCache;
use Flarum\Gdpr\Extend\UserData;
use Flarum\User\User;
use FoF\PWA\Api\Controller as ApiController;
use FoF\PWA\Data\PushSubscriptions;
use FoF\PWA\Model\PushSubscription;

return [
    (new Extend\Routes('api'))
        ->get('/pwa/settings', 'fof-pwa.settings', ApiController\ShowPWASettingsController::class)
        ->post(
            '/pwa/firebase-config',
            'fof-pwa.firebase-config.store',
            ApiController\AddFirebaseConfigController::class
        )
        ->post('/reset_vapid', 'fof-pwa.reset_vapid', ApiController\ResetVAPIDKeysController::class),

    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->jsDirectory(__DIR__.'/js/dist/forum')
        ->css(__DIR__.'/resources/less/forum.less')
        ->route('/pwa-notifications-help', 'fof-pwa.notifications-help'),

    (new Extend\Theme())
        ->manifest(fn (array $manifest) => resolve(ManifestBuilder::class)($manifest)),

    (new Extend\ServiceWorker())
        ->js(__DIR__.'/js/dist/sw.js'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/resources/less/admin.less'),

    new Extend\Locales(__DIR__.'/resources/locale'),

    (new Extend\Model(User::class))
        ->hasMany('pushSubscriptions', PushSubscription::class, 'user_id'),

    (new Extend\Settings())
        ->serializeToForum('vapidPublicKey', 'fof-pwa.vapid.public', [Util::class, 'url_encode'])
        ->serializeToForum('fofPwaShareButtons', 'fof-pwa.shareButtons', 'boolVal')
        ->default('fof-pwa.pushNotifPreferenceDefaultToEmail', true)
        ->default('fof-pwa.pushNotificationTtl', 86400)
        ->default('fof-pwa.userMaxSubscriptions', 20)
        ->default('fof-pwa.orientation', 'any')
        ->default('fof-pwa.shareButtons', true),

    (new Extend\Event())
        ->listen(ClearingCache::class, Listener\MoveIconToCore::class),

    new MoveIconOnEnable(),

    (new Extend\Notification())
        ->driver('push', PushNotificationDriver::class),

    (new Extend\ServiceProvider())
        ->register(FlarumPWAServiceProvider::class),

    new Extend\ApiResource(Api\Resource\FirebasePushSubscriptionResource::class),
    new Extend\ApiResource(Api\Resource\PushSubscriptionResource::class),

    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-gdpr', fn () => [
            (new UserData())
                ->addType(PushSubscriptions::class),
        ]),
];
