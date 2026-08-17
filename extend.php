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
use Flarum\Frontend\Document;
use Flarum\Gdpr\Extend\UserData;
use Flarum\User\User;
use FoF\PWA\Api\Controller as ApiController;
use FoF\PWA\Data\PushSubscriptions;
use FoF\PWA\Forum\Controller as ForumController;
use FoF\PWA\Model\PushSubscription;
use Illuminate\Support\Arr;

$metaClosure = function (Document $document) {
    $forumApiDocument = $document->getForumApiDocument();
    $basePath = rtrim(Arr::get($forumApiDocument, 'data.attributes.basePath'), '/');

    $document->head[] = "<link rel='manifest' href='$basePath/webmanifest'>";
};

return [
    (new Extend\Routes('api'))
        ->get('/pwa/settings', 'fof-pwa.settings', ApiController\ShowPWASettingsController::class)
        ->delete('/pwa/logo/{size}', 'fof-pwa.size_delete', ApiController\DeleteLogoController::class)
        ->post('/pwa/logo/{size}', 'fof-pwa.size_upload', ApiController\UploadLogoController::class)
        ->post(
            '/pwa/firebase-config',
            'fof-pwa.firebase-config.store',
            ApiController\AddFirebaseConfigController::class
        )
        ->post('/reset_vapid', 'fof-pwa.reset_vapid', ApiController\ResetVAPIDKeysController::class),

    (new Extend\Routes('forum'))
        ->get('/webmanifest', 'fof-pwa.webmanifest', ForumController\WebManifestController::class)
        ->get('/sw', 'fof-pwa.sw', ForumController\ServiceWorkerController::class)
        ->get('/offline', 'fof-pwa.offline', ForumController\OfflineController::class),

    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less')
        ->content($metaClosure),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/resources/less/admin.less')
        ->content($metaClosure),

    new Extend\Locales(__DIR__.'/resources/locale'),

    (new Extend\Model(User::class))
        ->hasMany('pushSubscriptions', PushSubscription::class, 'user_id'),

    (new Extend\Settings())
        ->serializeToForum('vapidPublicKey', 'fof-pwa.vapid.public', [Util::class, 'url_encode'])
        ->default('fof-pwa.pushNotifPreferenceDefaultToEmail', true)
        ->default('fof-pwa.userMaxSubscriptions', 20),

    (new Extend\Notification())
        ->driver('push', PushNotificationDriver::class),

    (new Extend\View())
        ->namespace('fof-pwa', __DIR__.'/views'),

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
