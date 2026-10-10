<?php

namespace FoF\PWA;

use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Filesystem\Cloud;
use Illuminate\Contracts\Filesystem\Factory;

class IconProvider
{
    private Cloud $assetsFilesystem;

    public function __construct(
        private SettingsRepositoryInterface $settings,
        Factory $filesystemFactory
    ) {
        $this->assetsFilesystem = $filesystemFactory->disk('flarum-assets');
    }

    /**
     * @return list<array{src: string, sizes: string, type: string}>
     */
    public function get(): array
    {
        $icons = [];

        foreach (IconSize::cases() as $size) {
            if ($path = $this->settings->get($size->getSettingsKey())) {
                $icons[] = [
                    'src'   => $this->assetsFilesystem->url($path),
                    'sizes' => "{$size->value}x{$size->value}",
                    'type'  => 'image/png',
                ];
            }
        }

        return $icons;
    }
}
