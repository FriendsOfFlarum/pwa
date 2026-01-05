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

namespace FoF\PWA\Forum\Controller;

use FoF\PWA\PWATrait;
use Illuminate\Contracts\Filesystem\Factory as FilesystemFactory;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Contracts\View\Factory as ViewFactory;
use Laminas\Diactoros\Response\HtmlResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class OfflineController implements RequestHandlerInterface
{
    use PWATrait;

    protected Filesystem $assetDir;

    protected ViewFactory $viewFactory;

    public function __construct(FilesystemFactory $filesystemFactory, ViewFactory $viewFactory)
    {
        $this->assetDir = $filesystemFactory->disk('flarum-assets');
        $this->viewFactory = $viewFactory;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $html = $this->viewFactory->make('fof-pwa::offline')->render();

        return new HtmlResponse($html);
    }
}
