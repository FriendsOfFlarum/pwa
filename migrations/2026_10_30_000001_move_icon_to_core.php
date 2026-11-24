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

use Flarum\Forum\Branding\AppIcon;
use Flarum\Forum\Branding\StoredFiles;
use Flarum\Forum\Branding\ThemeImages;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Database\Schema\Builder;
use Intervention\Image\ImageManager;
use Psr\Log\LoggerInterface;

// Only the 512 pixel icon can become the app icon: core doesn't enlarge an
// icon, so a smaller one would sit small in the middle of the larger icons.
//
// Settings are read from the table, not the settings repository: its cache was
// filled before an earlier migration renamed askvortsov-pwa's keys.
//
// Runs after the settings move, which looks for these icons to tell an upgrade
// from a first install.
return [
    'up' => function (Builder $schema) {
        $settings = fn () => $schema->getConnection()->table('settings');
        $keys = array_map(fn (int $size) => "fof-pwa.icon_{$size}_path", [48, 72, 96, 144, 196, 256, 512]);
        $paths = $settings()->whereIn('key', $keys)->whereNotNull('value')->where('value', '!=', '')->pluck('value', 'key');

        // Installs and test setup have no old icons, and may not have the
        // services that draw the app icon.
        if ($paths->isEmpty()) {
            return;
        }

        $assets = resolve(Factory::class)->disk('flarum-assets');
        $source = $paths->pull('fof-pwa.icon_512_path');
        $hasAppIcon = (string) $settings()->where('key', 'app_icon_path')->value('value') !== '';

        if ($source && !$hasAppIcon && !resolve(ThemeImages::class)->has('app_icon') && $assets->exists($source)) {
            $appIcon = resolve(AppIcon::class);

            try {
                $icon = resolve(ImageManager::class)->read((string) $assets->get($source))
                    ->removeAnimation()
                    ->scaleDown(AppIcon::SOURCE_SIZE, AppIcon::SOURCE_SIZE)
                    ->toPng();

                resolve(StoredFiles::class)->replace('app_icon_path', (string) $icon, 'app-icon', 'png');
                $appIcon->draw();

                // The assets disk reports a failed write by returning false, which core doesn't check.
                $drawn = json_decode((string) $settings()->where('key', 'app_icon_paths')->value('value'), true) ?: [];
                $stored = [(string) $settings()->where('key', 'app_icon_path')->value('value'), ...array_values($drawn)];

                if (!$drawn || in_array(false, array_map($assets->exists(...), $stored), true)) {
                    throw new RuntimeException('the app icon could not be stored');
                }
            } catch (Throwable $e) {
                try {
                    $appIcon->delete();
                } catch (Throwable) {
                }

                // The source stays on the assets disk for the admin to upload under Appearance.
                resolve(LoggerInterface::class)->warning("[PWA] Could not make $source the app icon, upload it under Appearance: {$e->getMessage()}");
                $source = null;
            }
        }

        foreach ($source ? [$source, ...$paths] : $paths as $path) {
            if ($assets->exists($path)) {
                $assets->delete($path);
            }
        }

        $settings()->whereIn('key', $keys)->delete();
    },
    'down' => function (Builder $schema) {
        // The old icons are gone, and core's app icon may have changed since.
    },
];
