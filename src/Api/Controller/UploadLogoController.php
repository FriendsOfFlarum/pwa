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

use Flarum\Api\Controller\UploadImageController;
use Flarum\Http\Exception\RouteNotFoundException;
use FoF\PWA\PWATrait;
use FoF\PWA\Util;
use Illuminate\Support\Arr;
use Intervention\Image\Interfaces\EncodedImageInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamInterface;
use Psr\Http\Message\UploadedFileInterface;

class UploadLogoController extends UploadImageController
{
    use PWATrait;

    protected int $size;

    protected string $fileExtension = 'png';

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $size = (int) Arr::get($request->getAttribute('routeParameters', []), 'size');
        if (!in_array($size, Util::$ICON_SIZES)) {
            throw new RouteNotFoundException();
        }

        $this->size = $size;

        return parent::handle($request);
    }

    protected function filenamePrefix(ServerRequestInterface $request): string
    {
        return "pwa-icon-{$this->size}x{$this->size}";
    }

    protected function filePathSettingKey(ServerRequestInterface $request, UploadedFileInterface $file): string
    {
        return "fof-pwa.icon_{$this->size}_path";
    }

    protected function makeImage(UploadedFileInterface $file): EncodedImageInterface|StreamInterface
    {
        return $this->imageManager->read($file->getStream()->getMetadata('uri'))
            ->resize($this->size, $this->size)
            ->toPng();
    }
}
