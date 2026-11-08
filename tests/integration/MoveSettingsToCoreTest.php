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

use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

/**
 * Migrations run before a test's settings are applied, so these write the
 * settings table themselves and run the migration again.
 */
class MoveSettingsToCoreTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('fof-pwa');
    }

    #[Test]
    public function moves_the_short_name_and_background_colour_to_core(): void
    {
        $this->migrate([
            'fof-pwa.shortName'       => 'Acme',
            'fof-pwa.backgroundColor' => '#112233',
            'fof-pwa.display'         => 'fullscreen',
        ]);

        $this->assertSame('Acme', $this->value('forum_short_name'));
        $this->assertSame('#112233', $this->value('splash_screen_background'));
        $this->assertNull($this->value('fof-pwa.shortName'));
        $this->assertNull($this->value('fof-pwa.backgroundColor'));
        $this->assertNull($this->value('fof-pwa.display'));
    }

    #[Test]
    public function drops_the_long_name_and_theme_colour_core_now_takes_from_its_own_settings(): void
    {
        $this->migrate([
            'forum_title'         => 'Acme Forum',
            'theme_primary_color' => '#445566',
            'fof-pwa.longName'    => 'Acme',
            'fof-pwa.themeColor'  => '#112233',
        ]);

        $this->assertNull($this->value('fof-pwa.longName'));
        $this->assertNull($this->value('fof-pwa.themeColor'));
        $this->assertSame('Acme Forum', $this->value('forum_title'));
        $this->assertSame('#445566', $this->value('theme_primary_color'));
    }

    #[Test]
    public function keeps_what_an_admin_set_in_core(): void
    {
        $this->migrate([
            'fof-pwa.shortName'        => 'Acme',
            'fof-pwa.backgroundColor'  => '#112233',
            'forum_short_name'         => 'Core',
            'splash_screen_background' => '#445566',
        ]);

        $this->assertSame('Core', $this->value('forum_short_name'));
        $this->assertSame('#445566', $this->value('splash_screen_background'));
        $this->assertNull($this->value('fof-pwa.shortName'));
    }

    #[Test]
    public function fills_a_core_setting_that_was_cleared(): void
    {
        $this->migrate(['fof-pwa.shortName' => 'Acme', 'forum_short_name' => '']);

        $this->assertSame('Acme', $this->value('forum_short_name'));
    }

    #[Test]
    public function does_not_move_a_short_name_core_would_reject(): void
    {
        $this->migrate(['fof-pwa.shortName' => 'Seventeen letters']);

        $this->assertNull($this->value('forum_short_name'));
        $this->assertNull($this->value('fof-pwa.shortName'));
    }

    #[Test]
    #[DataProvider('rejectedColours')]
    public function does_not_move_a_background_colour_core_would_reject(string $colour): void
    {
        $this->migrate(['fof-pwa.backgroundColor' => $colour]);

        $this->assertNull($this->value('splash_screen_background'));
        $this->assertNull($this->value('fof-pwa.backgroundColor'));
    }

    public static function rejectedColours(): array
    {
        return [
            'named'       => ['red'],
            'rgb'         => ['rgb(17, 34, 51)'],
            'translucent' => ['#11223380'],
        ];
    }

    #[Test]
    public function an_upgraded_forum_at_the_default_display_mode_opens_as_an_app(): void
    {
        $this->migrate(['open_as_app' => '0', 'fof-pwa.icon_512_path' => 'pwa-icon-512x512.png']);

        $this->assertSame('1', $this->value('open_as_app'));
    }

    #[Test]
    public function a_forum_that_only_sent_push_notifications_opens_as_an_app(): void
    {
        $this->database()->table('push_subscriptions')->insert([
            'user_id'          => 1,
            'endpoint'         => 'https://fcm.googleapis.com/fcm/send/test-token',
            'vapid_public_key' => 'test-public-key',
            'keys'             => '{}',
        ]);

        $this->migrate(['open_as_app' => '0']);

        $this->assertSame('1', $this->value('open_as_app'));
    }

    #[Test]
    #[DataProvider('displayModes')]
    public function a_chosen_display_mode_leaves_open_as_app_alone(string $display): void
    {
        $this->migrate(['open_as_app' => '0', 'fof-pwa.display' => $display, 'fof-pwa.longName' => 'Acme']);

        $this->assertSame('0', $this->value('open_as_app'));
        $this->assertNull($this->value('fof-pwa.display'));
    }

    public static function displayModes(): array
    {
        return [
            'browser'    => ['browser'],
            'standalone' => ['standalone'],
        ];
    }

    #[Test]
    public function a_first_install_leaves_open_as_app_alone(): void
    {
        // An earlier migration makes the push keys on install.
        $this->migrate(['open_as_app' => '0', 'fof-pwa.vapid.public' => 'key', 'fof-pwa.vapid.success' => '1']);

        $this->assertSame('0', $this->value('open_as_app'));
    }

    /**
     * @param array<string, string> $settings
     */
    private function migrate(array $settings): void
    {
        foreach ($settings as $key => $value) {
            $this->database()->table('settings')->updateOrInsert(['key' => $key], ['value' => $value]);
        }

        $migration = require __DIR__.'/../../migrations/2026_10_30_000000_move_settings_to_core.php';
        $migration['up']($this->database()->getSchemaBuilder());
    }

    private function value(string $key): ?string
    {
        return $this->database()->table('settings')->where('key', $key)->value('value');
    }
}
