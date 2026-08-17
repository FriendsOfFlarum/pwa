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

use Flarum\Http\Exception\RouteNotFoundException;
use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use FoF\PWA\IconSize;
use FoF\PWA\PWATrait;
use FoF\PWA\Util;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\EmptyResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class DeleteLogoController implements RequestHandlerInterface
{
    use PWATrait;

    protected Filesystem $uploadDir;

    public function __construct(protected SettingsRepositoryInterface $settings, Factory $filesystemFactory)
    {
        $this->uploadDir = $filesystemFactory->disk('flarum-assets');
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        $routeParams = $request->getAttribute('routeParameters', []);
        $iconSize = IconSize::tryFrom((int) Arr::get($routeParams, 'size'));

        if (!$iconSize) {
            throw new RouteNotFoundException();
        }

        $pathKey = $iconSize->getSettingsKey();
        $path = $this->settings->get($pathKey);

        $this->uploadDir->delete($path);

        $this->settings->set($pathKey, null);

        return new EmptyResponse(204);
    }
}
