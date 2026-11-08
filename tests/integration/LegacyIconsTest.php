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

namespace FoF\PWA\Tests\integration;

use Flarum\Extension\ExtensionManager;
use Flarum\Foundation\Event\ClearingCache;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Testing\integration\TestCase;
use FoF\PWA\MoveIconOnEnable;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Contracts\Filesystem\Cloud;
use Illuminate\Contracts\Filesystem\Factory;
use Intervention\Image\ImageManager;
use PHPUnit\Framework\Attributes\Test;

class LegacyIconsTest extends TestCase
{
    /** @var list<string> */
    private array $written = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('fof-pwa');
    }

    protected function tearDown(): void
    {
        // Files on the assets disk outlive the test's database transaction.
        $settings = $this->settings();
        $drawn = json_decode((string) $settings->get('app_icon_paths'), true) ?: [];

        $this->assets()->delete([...$this->written, ...array_values($drawn), ...array_filter([$settings->get('app_icon_path')])]);

        parent::tearDown();
    }

    #[Test]
    public function the_512_icon_becomes_the_app_icon_on_cache_clear(): void
    {
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->setting('fof-pwa.icon_196_path', 'pwa-icon-196x196-test.png');
        $this->icon('pwa-icon-512x512-test.png');
        $this->icon('pwa-icon-196x196-test.png');

        $this->clearCache();

        $settings = $this->settings();
        $this->assertStringStartsWith('app-icon-', $settings->get('app_icon_path'));
        $this->assertTrue($this->assets()->exists($settings->get('app_icon_path')));
        $this->assertArrayHasKey('icon-maskable-512.png', json_decode($settings->get('app_icon_paths'), true));
        $this->assertNull($settings->get('fof-pwa.icon_512_path'));
        $this->assertNull($settings->get('fof-pwa.icon_196_path'));
        $this->assertFalse($this->assets()->exists('pwa-icon-512x512-test.png'));
        $this->assertFalse($this->assets()->exists('pwa-icon-196x196-test.png'));
    }

    #[Test]
    public function without_a_512_icon_no_app_icon_is_made_and_the_old_icons_go(): void
    {
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-missing.png');
        $this->setting('fof-pwa.icon_256_path', 'pwa-icon-256x256-test.png');
        $this->setting('fof-pwa.icon_96_path', 'pwa-icon-96x96-test.png');
        $this->icon('pwa-icon-256x256-test.png', 256);
        $this->icon('pwa-icon-96x96-test.png', 96);

        $this->clearCache();

        $settings = $this->settings();
        $this->assertNull($settings->get('app_icon_path'));
        $this->assertNull($settings->get('app_icon_paths'));
        $this->assertNull($settings->get('fof-pwa.icon_512_path'));
        $this->assertNull($settings->get('fof-pwa.icon_256_path'));
        $this->assertNull($settings->get('fof-pwa.icon_96_path'));
        $this->assertFalse($this->assets()->exists('pwa-icon-256x256-test.png'));
        $this->assertFalse($this->assets()->exists('pwa-icon-96x96-test.png'));
    }

    #[Test]
    public function moving_again_changes_nothing(): void
    {
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->icon('pwa-icon-512x512-test.png');

        $this->clearCache();
        $appIcon = $this->settings()->get('app_icon_path');
        $this->clearCache();

        $this->assertSame($appIcon, $this->settings()->get('app_icon_path'));
        $this->assertTrue($this->assets()->exists($appIcon));
    }

    #[Test]
    public function enabling_the_extension_moves_the_icons(): void
    {
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->icon('pwa-icon-512x512-test.png');
        $container = $this->app()->getContainer();

        (new MoveIconOnEnable())->onEnable($container, $container->make(ExtensionManager::class)->getExtension('fof-pwa'));

        $this->assertStringStartsWith('app-icon-', $this->settings()->get('app_icon_path'));
        $this->assertNull($this->settings()->get('fof-pwa.icon_512_path'));
        $this->assertFalse($this->assets()->exists('pwa-icon-512x512-test.png'));
    }

    #[Test]
    public function an_existing_app_icon_is_kept(): void
    {
        $this->setting('app_icon_path', 'app-icon-existing.png');
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->icon('app-icon-existing.png');
        $this->icon('pwa-icon-512x512-test.png');

        $this->clearCache();

        $this->assertSame('app-icon-existing.png', $this->settings()->get('app_icon_path'));
        $this->assertNull($this->settings()->get('fof-pwa.icon_512_path'));
        $this->assertFalse($this->assets()->exists('pwa-icon-512x512-test.png'));
    }

    #[Test]
    public function an_unreadable_icon_is_kept_for_another_attempt(): void
    {
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->assets()->put('pwa-icon-512x512-test.png', 'not an image');
        $this->written[] = 'pwa-icon-512x512-test.png';

        $this->clearCache();

        $this->assertNull($this->settings()->get('app_icon_path'));
        $this->assertSame('pwa-icon-512x512-test.png', $this->settings()->get('fof-pwa.icon_512_path'));
    }

    #[Test]
    public function nothing_happens_without_old_icons(): void
    {
        $this->clearCache();

        $this->assertNull($this->settings()->get('app_icon_path'));
    }

    private function clearCache(): void
    {
        $this->app()->getContainer()->make(Dispatcher::class)->dispatch(new ClearingCache());
    }

    private function icon(string $path, int $size = 512): void
    {
        $image = $this->app()->getContainer()->make(ImageManager::class)->create($size, $size)->fill('#e74c3c')->toPng();

        $this->assets()->put($path, (string) $image);
        $this->written[] = $path;
    }

    private function assets(): Cloud
    {
        return $this->app()->getContainer()->make(Factory::class)->disk('flarum-assets');
    }

    private function settings(): SettingsRepositoryInterface
    {
        return $this->app()->getContainer()->make(SettingsRepositoryInterface::class);
    }
}
