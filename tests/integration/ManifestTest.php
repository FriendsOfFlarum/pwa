<?php

namespace FoF\PWA\Tests\integration;

use Flarum\Extend\Conditional;
use Flarum\Testing\integration\TestCase;
use FoF\PWA\Extend\Manifest;
use FoF\PWA\ManifestBuilder;
use FoF\PWA\Tests\fixtures\ManifestModifier;
use PHPUnit\Framework\Attributes\Test;

class ManifestTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('fof-pwa');
        $this->setting('forum_title', 'Test forum');
        $this->setting('fof-pwa.forcePortrait', true);
    }

    #[Test]
    public function includes_configured_fields_and_uploaded_icons(): void
    {
        $this->setting('fof-pwa.longName', 'My app');
        $this->setting('fof-pwa.shortName', 'App');
        $this->setting('forum_description', 'My community');
        $this->setting('fof-pwa.themeColor', '#123456');
        $this->setting('fof-pwa.backgroundColor', '#ffffff');
        $this->setting('fof-pwa.windowControlsOverlay', true);
        $this->setting('fof-pwa.icon_196_path', 'small.png');
        $this->setting('fof-pwa.icon_512_path', 'large.png');

        $response = $this->send($this->request('GET', '/webmanifest'));
        $this->assertSame(200, $response->getStatusCode());
        $manifest = json_decode((string) $response->getBody(), true);
        $this->assertSame('My app', $manifest['name']);
        $this->assertSame('App', $manifest['short_name']);
        $this->assertSame('My community', $manifest['description']);
        $this->assertSame('#123456', $manifest['theme_color']);
        $this->assertSame('#ffffff', $manifest['background_color']);
        $this->assertSame(['window-controls-overlay'], $manifest['display_override']);
        $this->assertSame(['196x196', '512x512'], array_column($manifest['icons'], 'sizes'));
    }

    #[Test]
    public function serves_the_default_manifest_without_modifiers(): void
    {
        $response = $this->send($this->request('GET', '/webmanifest'));

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('application/manifest+json', $response->getHeaderLine('Content-Type'));
        $manifest = json_decode((string) $response->getBody(), true);
        $this->assertSame('Test forum', $manifest['name']);
        $this->assertSame('standalone', $manifest['display']);
        $this->assertSame('portrait', $manifest['orientation']);
    }

    #[Test]
    public function chains_modifiers_and_resolves_dependencies_for_both_manifest_outputs(): void
    {
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

        $response = $this->send($this->request('GET', '/webmanifest'));
        $this->assertSame(200, $response->getStatusCode());
        $manifest = json_decode((string) $response->getBody(), true);
        $this->assertSame('Custom Test forum', $manifest['name']);
        $this->assertSame(['social', 'news'], $manifest['categories']);
        $this->assertSame('minimal-ui', $manifest['display']);
        $this->assertArrayNotHasKey('orientation', $manifest);
        $this->assertArrayHasKey('icons', $manifest);
        $this->assertSame(1, $calls);

        // The settings controller checks the server globals, which are absent in CLI.
        $_SERVER['SERVER_PORT'] = 80;
        $response = $this->send($this->request('GET', '/api/pwa/settings', ['authenticatedAs' => 1]));
        $this->assertSame(200, $response->getStatusCode(), (string) $response->getBody());
        $this->assertSame($manifest, json_decode((string) $response->getBody(), true)['manifest']);
        $this->assertSame(2, $calls);

        // Reusing a builder does not accumulate manifest changes.
        $builder = $this->app()->getContainer()->make(ManifestBuilder::class);
        $this->assertSame($manifest, $builder->build());
        $this->assertSame($manifest, $builder->build());
        $this->assertSame(4, $calls);
    }

    #[Test]
    public function supports_conditional_registration_when_pwa_is_enabled(): void
    {
        $this->extend(
            (new Conditional())->whenExtensionEnabled('fof-pwa', fn () => [
                (new Manifest())->modify(fn (array $manifest): array => array_replace($manifest, ['name' => 'Conditional'])),
            ])
        );

        $response = $this->send($this->request('GET', '/webmanifest'));
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Conditional', json_decode((string) $response->getBody(), true)['name']);
    }

    #[Test]
    public function skips_optional_integration_when_pwa_is_disabled(): void
    {
        $this->extensions = [];
        $this->extend(
            (new Conditional())->whenExtensionEnabled('fof-pwa', function (): array {
                $this->fail('The optional integration should not be instantiated.');
            })
        );

        $response = $this->send($this->request('GET', '/webmanifest'));
        $this->assertSame(404, $response->getStatusCode());
    }
}
