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

use Flarum\Extend\Conditional;
use Flarum\Testing\integration\TestCase;
use FoF\PWA\Extend\Manifest;
use FoF\PWA\Tests\fixtures\ManifestModifier;
use PHPUnit\Framework\Attributes\Test;

class ManifestTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('fof-pwa');
        $this->setting('forum_title', 'Test forum');
    }

    #[Test]
    public function applies_the_configured_fields_to_cores_manifest(): void
    {
        $this->setting('fof-pwa.orientation', 'portrait');
        $this->setting('forum_description', 'My community');
        $this->setting('fof-pwa.windowControlsOverlay', true);

        $manifest = $this->manifest();

        $this->assertSame('Test forum', $manifest['name']);
        $this->assertSame('My community', $manifest['description']);
        $this->assertSame('portrait', $manifest['orientation']);
        $this->assertSame(['window-controls-overlay'], $manifest['display_override']);
    }

    #[Test]
    public function leaves_cores_fields_without_settings(): void
    {
        $this->setting('theme_primary_color', '#abcdef');

        $manifest = $this->manifest();

        $this->assertSame('Test forum', $manifest['name']);
        $this->assertSame('#abcdef', $manifest['theme_color']);
        $this->assertSame('any', $manifest['orientation']);
        $this->assertArrayNotHasKey('display_override', $manifest);
    }

    #[Test]
    public function does_not_decide_the_display_mode(): void
    {
        $this->setting('fof-pwa.display', 'fullscreen');

        $this->assertNotSame('fullscreen', $this->manifest()['display'] ?? null);
    }

    #[Test]
    public function pages_link_cores_manifest_only(): void
    {
        $body = (string) $this->send($this->request('GET', '/'))->getBody();

        $this->assertStringContainsString('<link rel="manifest"', $body);
        $this->assertStringNotContainsString('/webmanifest', $body);
        $this->assertSame(404, $this->send($this->request('GET', '/webmanifest'))->getStatusCode());
    }

    #[Test]
    public function chains_modifiers_and_resolves_dependencies_for_every_build(): void
    {
        $this->setting('fof-pwa.orientation', 'portrait');
        $calls = 0;
        $this->extend(
            (new Manifest())->modify(function (array $manifest) use (&$calls): array {
                $calls++;
                $this->assertSame('Test forum', $manifest['name']);
                $this->assertSame('portrait', $manifest['orientation']);
                $manifest['name'] = 'Custom';
                $manifest['categories'] = ['social'];
                unset($manifest['orientation']);

                return $manifest;
            })->modify(function (array $manifest): array {
                $manifest['display'] = 'minimal-ui';

                return $manifest;
            }),
            (new Manifest())->modify(ManifestModifier::class)
        );

        $manifest = $this->manifest();
        $this->assertSame('Custom Test forum', $manifest['name']);
        $this->assertSame(['social', 'news'], $manifest['categories']);
        $this->assertSame('minimal-ui', $manifest['display']);
        $this->assertArrayNotHasKey('orientation', $manifest);
        $this->assertSame(1, $calls);

        // The settings controller checks the server globals, which are absent in CLI.
        $_SERVER['SERVER_PORT'] = 80;
        $response = $this->send($this->request('GET', '/api/pwa/settings', ['authenticatedAs' => 1]));
        $this->assertSame(200, $response->getStatusCode(), (string) $response->getBody());
        $this->assertSame(2, $calls);

        // Building again does not accumulate manifest changes.
        $this->assertSame($manifest, $this->manifest());
        $this->assertSame(3, $calls);
    }

    #[Test]
    public function supports_conditional_registration_when_pwa_is_enabled(): void
    {
        $this->extend(
            (new Conditional())->whenExtensionEnabled('fof-pwa', fn () => [
                (new Manifest())->modify(fn (array $manifest): array => array_replace($manifest, ['name' => 'Conditional'])),
            ])
        );

        $this->assertSame('Conditional', $this->manifest()['name']);
    }

    #[Test]
    public function skips_optional_integration_when_pwa_is_disabled(): void
    {
        $this->extensions = [];
        $this->setting('fof-pwa.orientation', 'portrait');
        $this->extend(
            (new Conditional())->whenExtensionEnabled('fof-pwa', function (): array {
                $this->fail('The optional integration should not be instantiated.');
            })
        );

        $this->assertArrayNotHasKey('orientation', $this->manifest());
    }

    /**
     * @return array<string, mixed>
     */
    private function manifest(): array
    {
        $response = $this->send($this->request('GET', '/manifest'));

        $this->assertSame(200, $response->getStatusCode());

        return json_decode((string) $response->getBody(), true);
    }
}
