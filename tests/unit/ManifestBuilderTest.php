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

namespace FoF\PWA\Tests\unit;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Testing\unit\TestCase;
use FoF\PWA\ManifestBuilder;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

class ManifestBuilderTest extends TestCase
{
    private const array CORE = [
        'name'        => 'Test forum',
        'display'     => 'standalone',
        'theme_color' => '#123456',
        'icons'       => [['src' => 'icon-512.png', 'sizes' => '512x512', 'type' => 'image/png']],
    ];

    #[Test]
    public function keeps_cores_manifest_without_settings(): void
    {
        $this->assertSame(self::CORE + ['orientation' => 'any'], $this->build([]));
    }

    #[Test]
    public function leaves_the_name_and_theme_colour_to_core(): void
    {
        $manifest = $this->build([
            'fof-pwa.longName'   => 'My app',
            'fof-pwa.themeColor' => '#654321',
        ]);

        $this->assertSame(self::CORE['name'], $manifest['name']);
        $this->assertSame(self::CORE['theme_color'], $manifest['theme_color']);
        $this->assertSame(self::CORE['icons'], $manifest['icons']);
    }

    #[Test]
    public function leaves_the_display_mode_to_core(): void
    {
        $this->assertSame('standalone', $this->build(['fof-pwa.display' => 'fullscreen'])['display']);
    }

    #[Test]
    #[DataProvider('orientations')]
    public function uses_the_configured_orientation(?string $orientation, string $expected): void
    {
        $this->assertSame($expected, $this->build(['fof-pwa.orientation' => $orientation])['orientation']);
    }

    public static function orientations(): array
    {
        return [
            'missing'             => [null, 'any'],
            'empty'               => ['', 'any'],
            'any'                 => ['any', 'any'],
            'natural'             => ['natural', 'natural'],
            'portrait'            => ['portrait', 'portrait'],
            'portrait-primary'    => ['portrait-primary', 'portrait-primary'],
            'portrait-secondary'  => ['portrait-secondary', 'portrait-secondary'],
            'landscape'           => ['landscape', 'landscape'],
            'landscape-primary'   => ['landscape-primary', 'landscape-primary'],
            'landscape-secondary' => ['landscape-secondary', 'landscape-secondary'],
        ];
    }

    /**
     * @param array<string, mixed> $values
     *
     * @return array<string, mixed>
     */
    private function build(array $values): array
    {
        $settings = Mockery::mock(SettingsRepositoryInterface::class);
        $settings->shouldReceive('get')->andReturnUsing(fn (string $key, mixed $default = null) => $values[$key] ?? $default);

        return (new ManifestBuilder($settings))(self::CORE);
    }
}
