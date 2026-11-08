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

use Flarum\Forum\Branding\AppIcon;
use Flarum\Forum\Branding\StoredFiles;
use Flarum\Forum\Branding\ThemeImages;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Filesystem\Cloud;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Database\ConnectionInterface;
use Intervention\Image\ImageManager;
use Psr\Log\LoggerInterface;
use Throwable;

/**
 * The icons uploaded before fof/pwa used core's app icon. The 512 pixel one
 * becomes the app icon, unless the forum already has one, and then all are
 * deleted. A smaller one isn't used: core doesn't enlarge an icon, so it would
 * sit small in the middle of the larger icons.
 *
 * Not a migration: drawing the app icon needs services that aren't safe to
 * resolve while migrating, on install or in test setup.
 */
class LegacyIcons
{
    public const SIZES = [48, 72, 96, 144, 196, 256, 512];

    protected Cloud $assets;

    public function __construct(
        protected SettingsRepositoryInterface $settings,
        protected StoredFiles $files,
        protected ThemeImages $theme,
        protected AppIcon $appIcon,
        protected ImageManager $images,
        protected LoggerInterface $logger,
        Factory $filesystemFactory
    ) {
        $this->assets = $filesystemFactory->disk('flarum-assets');
    }

    /**
     * Whether any old icon is left, checked without the services that move one.
     *
     * Read from the table rather than the settings repository: filling its
     * cache before every extension has migrated would hide the settings their
     * migrations add.
     */
    public static function exist(ConnectionInterface $db): bool
    {
        return $db->table('settings')
            ->whereIn('key', array_map(self::settingKey(...), self::SIZES))
            ->whereNotNull('value')
            ->exists();
    }

    public function moveToAppIcon(): void
    {
        $source = $this->settings->get(self::settingKey(512));

        if ($source && !$this->settings->get('app_icon_path') && !$this->theme->has('app_icon') && $this->assets->exists($source)) {
            try {
                $icon = $this->images->read((string) $this->assets->get($source))
                    ->removeAnimation()
                    ->scaleDown(AppIcon::SOURCE_SIZE, AppIcon::SOURCE_SIZE)
                    ->toPng();
            } catch (Throwable $e) {
                // Keep the old icons, so the next attempt can try again.
                $this->logger->warning("[PWA] Could not make $source the app icon: {$e->getMessage()}");

                return;
            }

            $this->files->replace('app_icon_path', (string) $icon, 'app-icon', 'png');
            $this->appIcon->draw();
        }

        foreach (self::SIZES as $size) {
            if ($this->settings->get(self::settingKey($size)) !== null) {
                $this->files->delete(self::settingKey($size));
            }
        }
    }

    protected static function settingKey(int $size): string
    {
        return "fof-pwa.icon_{$size}_path";
    }
}
