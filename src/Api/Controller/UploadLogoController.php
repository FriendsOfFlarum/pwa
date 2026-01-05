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
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use FoF\PWA\PWATrait;
use FoF\PWA\Util;
use Illuminate\Support\Arr;
use Intervention\Image\Image;
use Intervention\Image\ImageManager;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Tobscure\JsonApi\Document;

class UploadLogoController extends UploadImageController
{
    use PWATrait;

    protected int $size;

    /**
     * {@inheritdoc}
     *
     * @throws PermissionDeniedException|RouteNotFoundException
     */
    public function data(ServerRequestInterface $request, Document $document)
    {
        RequestUtil::getActor($request)->assertAdmin();

        $routeParams = $request->getAttribute('routeParameters', []);
        $size = intval(Arr::get($routeParams, 'size'));
        $this->size = $size;

        if (!in_array($size, Util::$ICON_SIZES)) {
            throw new RouteNotFoundException();
        }

        $this->filenamePrefix = "pwa-icon-{$size}x{$size}";
        $this->filePathSettingKey = "fof-pwa.icon_{$size}_path";

        // Debug logging
        $uploadedFiles = $request->getUploadedFiles();
        resolve('log')->debug('PWA Upload', [
            'uploaded_keys' => array_keys($uploadedFiles),
            'looking_for' => $this->filenamePrefix,
            'size' => $size
        ]);

        return parent::data($request, $document);
    }

    protected function makeImage(UploadedFileInterface $file): Image
    {
        $manager = new ImageManager();

        return $manager->make($file->getStream())->resize($this->size, $this->size)->encode('png');
    }
}
