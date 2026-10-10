<?php

namespace FoF\PWA\Tests\unit;

use Flarum\Http\RouteCollection;
use Flarum\Http\RouteCollectionUrlGenerator;
use Flarum\Http\UrlGenerator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Testing\unit\TestCase;
use FoF\PWA\IconProvider;
use FoF\PWA\ManifestBuilder;
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
            'start_url'   => $basePath,
            'scope'       => $basePath,
            'dir'         => 'auto',
            'theme_color' => '#123456',
            'display'     => 'standalone',
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
}
