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

use Flarum\Locale\LocaleManager;
use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

class PushSubscriptionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->extension('fof-pwa');
        $this->setting('fof-pwa.vapid.public', 'test-public-key');
        $this->setting('fof-pwa.vapid.private', 'test-private-key');

        // The test extension manager can resolve locales before registering extension extenders.
        $this->app()->getContainer()->make(LocaleManager::class)
            ->addTranslations('en', __DIR__.'/../../resources/locale/en.yml');
    }

    #[Test]
    public function authenticated_user_can_register_a_push_subscription(): void
    {
        $endpoint = 'https://fcm.googleapis.com/fcm/send/test-token';
        $response = $this->send($this->request('POST', '/api/push_subscriptions', [
            'authenticatedAs' => 1,
            'json'            => ['data' => ['attributes' => [
                'endpoint' => $endpoint,
                'keys'     => ['p256dh' => 'test-key', 'auth' => 'test-auth'],
            ]]],
        ]));

        $this->assertSame(201, $response->getStatusCode(), (string) $response->getBody());
        $this->assertSame(1, $this->database()->table('push_subscriptions')->where('endpoint', $endpoint)->count());
        $this->assertSame(1, (int) $this->database()->table('push_subscriptions')->where('endpoint', $endpoint)->value('user_id'));
    }

    #[Test]
    public function rejects_a_host_without_the_required_domain_boundary(): void
    {
        $response = $this->send($this->request('POST', '/api/push_subscriptions', [
            'authenticatedAs' => 1,
            'json'            => ['data' => ['attributes' => ['endpoint' => 'https://evilfcm.googleapis.com/token']]],
        ]));

        $this->assertSame(422, $response->getStatusCode());
        $error = json_decode((string) $response->getBody(), true)['errors'][0];
        $this->assertSame('Push notifications could not be enabled because the push service host "evilfcm.googleapis.com" used by your browser is not allowed. Please contact the forum administrator.', $error['detail']);
        $this->assertSame('/data/attributes/endpoint', $error['source']['pointer']);
        $this->assertSame(0, $this->database()->table('push_subscriptions')->count());
    }

    #[Test]
    public function explains_when_the_push_service_url_is_not_https(): void
    {
        $response = $this->send($this->request('POST', '/api/push_subscriptions', [
            'authenticatedAs' => 1,
            'json'            => ['data' => ['attributes' => ['endpoint' => 'http://fcm.googleapis.com/private-token']]],
        ]));

        $this->assertSame(422, $response->getStatusCode());
        $error = json_decode((string) $response->getBody(), true)['errors'][0];
        $this->assertSame('Push notifications could not be enabled because your browser provided an invalid push service URL "http://fcm.googleapis.com/private-token". A valid HTTPS URL is required.', $error['detail']);
        $this->assertSame('/data/attributes/endpoint', $error['source']['pointer']);
        $this->assertSame(0, $this->database()->table('push_subscriptions')->count());
    }
}
