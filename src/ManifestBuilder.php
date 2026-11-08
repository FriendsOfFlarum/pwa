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

use Flarum\Settings\SettingsRepositoryInterface;

/**
 * fof/pwa's settings, applied to core's web app manifest through
 * Extend\Theme::manifest(). Core fills in everything else: the name and short
 * name, description, theme colour, app icon, start URL and scope, and the
 * splash screen's background colour.
 */
class ManifestBuilder
{
    /** @var list<callable(array<string, mixed>): array<string, mixed>> */
    private array $callbacks = [];

    public function __construct(
        private readonly SettingsRepositoryInterface $settings
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
     * @param array<string, mixed> $manifest
     *
     * @return array<string, mixed>
     */
    public function __invoke(array $manifest): array
    {
        $manifest['orientation'] = $this->settings->get('fof-pwa.orientation') ?: 'any';

        if ($this->settings->get('fof-pwa.windowControlsOverlay')) {
            $manifest['display_override'] = ['window-controls-overlay'];
        }

        foreach ($this->callbacks as $callback) {
            $manifest = $callback($manifest);
        }

        return $manifest;
    }
}
