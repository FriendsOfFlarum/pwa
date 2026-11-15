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

use Flarum\Http\RouteCollection;
use Flarum\Http\RouteCollectionUrlGenerator;
use Flarum\Http\UrlGenerator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Testing\unit\TestCase;
use FoF\PWA\IconProvider;
use FoF\PWA\ManifestBuilder;
use FoF\PWA\StartUrl;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

class ManifestBuilderTest extends TestCase
{
    #[Test]
    #[DataProvider('forumUrls')]
    public function builds_defaults_without_a_global_container(string $forumUrl, string $basePath): void
    {
        $settings = Mockery::mock(SettingsRepositoryInterface::class);
        $settings->shouldReceive('get')->andReturnUsing(fn (string $key, mixed $default = null) => [
            'forum_title'         => 'Test forum',
            'theme_primary_color' => '#123456',
        ][$key] ?? $default);

        $url = Mockery::mock(UrlGenerator::class);
        $url->shouldReceive('to')->with('forum')->andReturn(new RouteCollectionUrlGenerator($forumUrl, new RouteCollection()));

        $icons = Mockery::mock(IconProvider::class);
        $icons->shouldReceive('get')->andReturn([]);

        $builder = new ManifestBuilder($settings, $url, $icons);

        $this->assertSame([
            'name'        => 'Test forum',
            'description' => '',
            'id'          => $basePath,
            'start_url'   => $basePath,
            'scope'       => $basePath,
            'theme_color' => '#123456',
            'display'     => 'standalone',
            'orientation' => 'any',
            'icons'       => [],
        ], $builder->build());
    }

    public static function forumUrls(): array
    {
        return [
            'root'                    => ['https://example.com', '/'],
            'root with slash'         => ['https://example.com/', '/'],
            'subdirectory'            => ['https://example.com/community', '/community/'],
            'subdirectory with slash' => ['https://example.com/community/', '/community/'],
        ];
    }

    #[Test]
    #[DataProvider('orientations')]
    public function uses_the_configured_orientation(?string $orientation, string $expected): void
    {
        $settings = Mockery::mock(SettingsRepositoryInterface::class);
        $settings->shouldReceive('get')->andReturnUsing(fn (string $key, mixed $default = null) => [
            'fof-pwa.orientation' => $orientation,
        ][$key] ?? $default);

        $url = Mockery::mock(UrlGenerator::class);
        $url->shouldReceive('to')->with('forum')->andReturn(new RouteCollectionUrlGenerator('https://example.com', new RouteCollection()));

        $icons = Mockery::mock(IconProvider::class);
        $icons->shouldReceive('get')->andReturn([]);

        $manifest = (new ManifestBuilder($settings, $url, $icons))->build();

        $this->assertSame($expected, $manifest['orientation']);
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

    #[Test]
    public function uses_the_configured_display_mode(): void
    {
        $settings = Mockery::mock(SettingsRepositoryInterface::class);
        $settings->shouldReceive('get')->andReturnUsing(fn (string $key, mixed $default = null) => [
            'fof-pwa.display' => 'fullscreen',
        ][$key] ?? $default);

        $url = Mockery::mock(UrlGenerator::class);
        $url->shouldReceive('to')->with('forum')->andReturn(new RouteCollectionUrlGenerator('https://example.com', new RouteCollection()));

        $icons = Mockery::mock(IconProvider::class);
        $icons->shouldReceive('get')->andReturn([]);

        $manifest = (new ManifestBuilder($settings, $url, $icons))->build();

        $this->assertSame('fullscreen', $manifest['display']);
    }

    #[Test]
    #[DataProvider('startUrls')]
    public function opens_the_configured_start_url_under_the_base_path(?string $startUrl, string $expected): void
    {
        $settings = Mockery::mock(SettingsRepositoryInterface::class);
        $settings->shouldReceive('get')->andReturnUsing(fn (string $key, mixed $default = null) => [
            'fof-pwa.startUrl' => $startUrl,
        ][$key] ?? $default);

        $url = Mockery::mock(UrlGenerator::class);
        $url->shouldReceive('to')->with('forum')->andReturn(new RouteCollectionUrlGenerator('https://example.com/community', new RouteCollection()));

        $icons = Mockery::mock(IconProvider::class);
        $icons->shouldReceive('get')->andReturn([]);

        $manifest = (new ManifestBuilder($settings, $url, $icons))->build();

        $this->assertSame($expected, $manifest['start_url']);
        $this->assertSame('/community/', $manifest['id']);
        $this->assertSame('/community/', $manifest['scope']);
    }

    public static function startUrls(): array
    {
        return [
            'missing'               => [null, '/community/'],
            'empty'                 => ['', '/community/'],
            'path'                  => ['all', '/community/all'],
            'path with query'       => ['all?sort=newest', '/community/all?sort=newest'],
            'invalid stored value'  => ['https://example.org/', '/community/'],
        ];
    }

    #[Test]
    #[DataProvider('normalizedStartUrls')]
    public function normalizes_start_urls_inside_the_forum(?string $value, ?string $expected): void
    {
        $this->assertSame($expected, StartUrl::normalize($value));
    }

    public static function normalizedStartUrls(): array
    {
        return [
            'null'                    => [null, ''],
            'empty'                   => ['', ''],
            'spaces'                  => ['  ', ''],
            'root'                    => ['/', ''],
            'path'                    => ['all', 'all'],
            'leading slash'           => ['/all', 'all'],
            'nested path'             => ['t/general', 't/general'],
            'query and fragment'      => ['all?sort=top#x', 'all?sort=top#x'],
            'dots in a segment'       => ['d/1-v1..2', 'd/1-v1..2'],
            'dots in the query'       => ['all?q=../x', 'all?q=../x'],
            'full URL'                => ['https://example.org/all', null],
            'other scheme'            => ['javascript:alert(1)', null],
            'protocol-relative'       => ['//example.org/all', null],
            'parent segment'          => ['../other', null],
            'nested parent segment'   => ['t/../../other', null],
            'encoded parent segment'  => ['%2e%2e/other', null],
            'current segment'         => ['./all', null],
            'backslash'               => ['\\example.org', null],
            'whitespace inside'       => ['all discussions', null],
            'control character'       => ["al\x01l", null],
        ];
    }
}
