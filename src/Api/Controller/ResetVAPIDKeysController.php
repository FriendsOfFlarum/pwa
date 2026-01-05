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

namespace FoF\PWA\Api\Controller;

use ErrorException;
use Exception;
use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Exception\PermissionDeniedException;
use FoF\PWA\PushSubscription;
use Laminas\Diactoros\Response\JsonResponse;
use Minishlink\WebPush\VAPID;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class ResetVAPIDKeysController implements RequestHandlerInterface
{
    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * {@inheritdoc}
     *
     * @throws PermissionDeniedException|ErrorException
     * @throws Exception
     */
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        try {
            $keys = VAPID::createVapidKeys();
        } catch (ErrorException $e) {
            $this->settings->set('fof-pwa.vapid.success', false);
            $this->settings->set('fof-pwa.vapid.error', $e->getMessage());

            throw new Exception($e->getMessage());
        }

        $this->settings->set('fof-pwa.vapid.success', true);
        $this->settings->set('fof-pwa.vapid.private', $keys['privateKey']);
        $this->settings->set('fof-pwa.vapid.public', $keys['publicKey']);

        $query = PushSubscription::where('vapid_public_key', $keys['publicKey']);

        $count = $query->count();

        $query->delete();

        return new JsonResponse([
            'deleted' => $count,
        ]);
    }
}
