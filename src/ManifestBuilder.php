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

use Flarum\Http\UrlGenerator;
use Flarum\Settings\SettingsRepositoryInterface;

class ManifestBuilder
{
    /** @var list<callable(array<string, mixed>): array<string, mixed>> */
    private array $callbacks = [];

    public function __construct(
        private readonly SettingsRepositoryInterface $settings,
        private readonly UrlGenerator $url,
        private readonly IconProvider $icons
    ) {
    }

    /**
     * @param callable(array<string, mixed>): array<string, mixed> $callback
     */
    public function modify(callable $callback): void
    {
        $this->callbacks[] = $callback;
    }

    /**
     * @return array<string, mixed>
     */
    public function build(): array
    {
        $basePath = rtrim(parse_url($this->url->to('forum')->base(), PHP_URL_PATH) ?? '/', '/').'/';

        $manifest = [
            'name'        => $this->settings->get('fof-pwa.longName') ?: $this->settings->get('forum_title'),
            'description' => $this->settings->get('forum_description', ''),
            'start_url'   => $basePath,
            'scope'       => $basePath,
            'dir'         => 'auto',
            'theme_color' => $this->settings->get('fof-pwa.themeColor') ?: $this->settings->get('theme_primary_color'),
            'display'     => $this->settings->get('fof-pwa.display') ?: 'standalone',
            'icons'       => $this->icons->get(),
        ];

        if ($backgroundColor = $this->settings->get('fof-pwa.backgroundColor')) {
            $manifest['background_color'] = $backgroundColor;
        }

        if ($this->settings->get('fof-pwa.forcePortrait')) {
            $manifest['orientation'] = 'portrait';
        }

        if ($shortName = $this->settings->get('fof-pwa.shortName')) {
            $manifest['short_name'] = $shortName;
        }

        if ($this->settings->get('fof-pwa.windowControlsOverlay')) {
            $manifest['display_override'] = ['window-controls-overlay'];
        }

        foreach ($this->callbacks as $callback) {
            $manifest = $callback($manifest);
        }

        return $manifest;
    }
}
