<?php

namespace FoF\PWA\Tests\unit;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Testing\unit\TestCase;
use FoF\PWA\IconProvider;
use Illuminate\Contracts\Filesystem\Cloud;
use Illuminate\Contracts\Filesystem\Factory;
use Mockery;
use PHPUnit\Framework\Attributes\Test;

class IconProviderTest extends TestCase
{
    #[Test]
    public function returns_only_configured_icons_in_size_order_with_asset_urls(): void
    {
        $settings = Mockery::mock(SettingsRepositoryInterface::class);
        $settings->shouldReceive('get')->andReturnUsing(fn (string $key) => [
            'fof-pwa.icon_512_path' => 'large.png',
            'fof-pwa.icon_196_path' => 'small.png',
        ][$key] ?? null);

        $assets = Mockery::mock(Cloud::class);
        $assets->shouldReceive('url')->with('small.png')->andReturn('https://cdn.example.com/small.png');
        $assets->shouldReceive('url')->with('large.png')->andReturn('https://cdn.example.com/large.png');

        $factory = Mockery::mock(Factory::class);
        $factory->shouldReceive('disk')->with('flarum-assets')->andReturn($assets);

        $icons = new IconProvider($settings, $factory);

        $this->assertSame([
            ['src' => 'https://cdn.example.com/small.png', 'sizes' => '196x196', 'type' => 'image/png'],
            ['src' => 'https://cdn.example.com/large.png', 'sizes' => '512x512', 'type' => 'image/png'],
        ], $icons->get());
    }
}
