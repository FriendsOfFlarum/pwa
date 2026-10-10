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

namespace FoF\PWA\Tests\fixtures;

use Flarum\Settings\SettingsRepositoryInterface;

class ManifestModifier
{
    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    public function __invoke(array $manifest): array
    {
        $manifest['name'] .= ' '.$this->settings->get('forum_title');
        $manifest['categories'][] = 'news';

        return $manifest;
    }
}
