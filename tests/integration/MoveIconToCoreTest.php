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

use Flarum\Extend;
use Flarum\Forum\Branding\ThemeImages;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Testing\integration\TestCase;
use Illuminate\Contracts\Filesystem\Cloud;
use Illuminate\Contracts\Filesystem\Factory;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use PHPUnit\Framework\Attributes\Test;

class MoveIconToCoreTest extends TestCase
{
    /** @var list<string> */
    private array $written = [];

    /** @var list<string> */
    private array $localFiles = [];

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
        array_map(unlink(...), array_filter($this->localFiles, file_exists(...)));

        parent::tearDown();
    }

    #[Test]
    public function the_512_icon_becomes_the_app_icon(): void
    {
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->setting('fof-pwa.icon_196_path', 'pwa-icon-196x196-test.png');
        $this->icon('pwa-icon-512x512-test.png');
        $this->icon('pwa-icon-196x196-test.png');

        $this->migrate();

        $settings = $this->settings();
        $this->assertStringStartsWith('app-icon-', $settings->get('app_icon_path'));
        $this->assertTrue($this->assets()->exists($settings->get('app_icon_path')));
        $this->assertArrayHasKey('icon-maskable-512.png', json_decode($settings->get('app_icon_paths'), true));
        $this->assertFalse($this->database()->table('settings')->where('key', 'like', 'fof-pwa.icon_%')->exists());
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

        $this->migrate();

        $settings = $this->settings();
        $this->assertNull($settings->get('app_icon_path'));
        $this->assertNull($settings->get('app_icon_paths'));
        $this->assertFalse($this->database()->table('settings')->where('key', 'fof-pwa.icon_512_path')->exists());
        $this->assertFalse($this->database()->table('settings')->where('key', 'fof-pwa.icon_256_path')->exists());
        $this->assertFalse($this->database()->table('settings')->where('key', 'fof-pwa.icon_96_path')->exists());
        $this->assertFalse($this->assets()->exists('pwa-icon-256x256-test.png'));
        $this->assertFalse($this->assets()->exists('pwa-icon-96x96-test.png'));
    }

    #[Test]
    public function running_again_changes_nothing(): void
    {
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->icon('pwa-icon-512x512-test.png');

        $this->migrate();
        $appIcon = $this->settings()->get('app_icon_path');
        $this->migrate();

        $this->assertSame($appIcon, $this->settings()->get('app_icon_path'));
        $this->assertTrue($this->assets()->exists($appIcon));
    }

    #[Test]
    public function an_existing_app_icon_is_kept(): void
    {
        $this->setting('app_icon_path', 'app-icon-existing.png');
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->icon('app-icon-existing.png');
        $this->icon('pwa-icon-512x512-test.png');

        $this->migrate();

        $this->assertSame('app-icon-existing.png', $this->settings()->get('app_icon_path'));
        $this->assertFalse($this->database()->table('settings')->where('key', 'fof-pwa.icon_512_path')->exists());
        $this->assertFalse($this->assets()->exists('pwa-icon-512x512-test.png'));
    }

    #[Test]
    public function an_unreadable_icon_is_left_on_disk_for_the_admin(): void
    {
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->setting('fof-pwa.icon_196_path', 'pwa-icon-196x196-test.png');
        $this->assets()->put('pwa-icon-512x512-test.png', 'not an image');
        $this->written[] = 'pwa-icon-512x512-test.png';
        $this->icon('pwa-icon-196x196-test.png', 196);

        $this->migrate();

        $this->assertNull($this->settings()->get('app_icon_path'));
        $this->assertNull($this->settings()->get('app_icon_paths'));
        $this->assertTrue($this->assets()->exists('pwa-icon-512x512-test.png'));
        $this->assertFalse($this->assets()->exists('pwa-icon-196x196-test.png'));
        $this->assertFalse($this->database()->table('settings')->where('key', 'like', 'fof-pwa.icon_%')->exists());
    }

    #[Test]
    public function icons_renamed_after_the_settings_were_cached_are_moved(): void
    {
        // As askvortsov-pwa's keys are renamed by an earlier migration in the same process.
        $this->settings()->all();
        $this->database()->table('settings')->insert(['key' => 'fof-pwa.icon_512_path', 'value' => 'pwa-icon-512x512-test.png']);
        $this->icon('pwa-icon-512x512-test.png');

        $this->migrate();

        $this->assertStringStartsWith('app-icon-', $this->settings()->get('app_icon_path'));
        $this->assertFalse($this->assets()->exists('pwa-icon-512x512-test.png'));
        $this->assertFalse($this->database()->table('settings')->where('key', 'fof-pwa.icon_512_path')->exists());
    }

    #[Test]
    public function an_app_icon_set_by_a_theme_is_kept(): void
    {
        $this->localFiles[] = $file = sys_get_temp_dir().'/pwa-theme-icon-'.uniqid().'.png';
        file_put_contents($file, (string) (new ImageManager(new Driver()))->create(512, 512)->fill('#336699')->toPng());
        $this->extend((new Extend\Theme())->appIcon($file));
        $this->setting('fof-pwa.icon_512_path', 'pwa-icon-512x512-test.png');
        $this->icon('pwa-icon-512x512-test.png');

        $this->migrate();
        array_push($this->written, ...array_values($this->app()->getContainer()->make(ThemeImages::class)->paths('app_icon')));

        $this->assertNull($this->settings()->get('app_icon_path'));
        $this->assertFalse($this->assets()->exists('pwa-icon-512x512-test.png'));
    }

    #[Test]
    public function nothing_happens_without_old_icons(): void
    {
        $this->migrate();

        $this->assertNull($this->settings()->get('app_icon_path'));
    }

    private function migrate(): void
    {
        $this->app();

        $migration = require __DIR__.'/../../migrations/2026_10_30_000001_move_icon_to_core.php';
        $migration['up']($this->database()->getSchemaBuilder());
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
