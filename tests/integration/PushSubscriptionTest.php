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
use Flarum\User\User;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Psr\Http\Message\ResponseInterface;

class PushSubscriptionTest extends TestCase
{
    private const string ENDPOINT = 'https://fcm.googleapis.com/fcm/send/test-token';
    private const array KEYS = ['p256dh' => 'test-key', 'auth' => 'test-auth'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->extension('fof-pwa');
        $this->setting('fof-pwa.vapid.public', 'test-public-key');
        $this->setting('fof-pwa.vapid.private', 'test-private-key');
        $this->setting('fof-pwa.userMaxSubscriptions', 2);
        $this->prepareDatabase([User::class => [
            ['id' => 2, 'username' => 'user2', 'email' => 'user2@machine.local', 'is_email_confirmed' => 1],
        ]]);

        // The test extension manager can resolve locales before registering extension extenders.
        $this->app()->getContainer()->make(LocaleManager::class)
            ->addTranslations('en', __DIR__.'/../../resources/locale/en.yml');
    }

    #[Test]
    public function firebase_registration_assigns_the_actor_and_reuses_the_token(): void
    {
        for ($attempt = 0; $attempt < 2; $attempt++) {
            $response = $this->send($this->request('POST', '/api/firebase_push_subscriptions', [
                'authenticatedAs' => 1,
                'json'            => ['data' => ['attributes' => ['token' => 'test-firebase-token']]],
            ]));

            $this->assertSame(201, $response->getStatusCode(), (string) $response->getBody());
            $this->assertSame(1, $this->database()->table('firebase_push_subscriptions')->count());
            $this->assertSame(1, (int) $this->database()->table('firebase_push_subscriptions')->value('user_id'));
        }
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
    public function matching_keys_transfer_the_existing_subscription_to_the_current_user(): void
    {
        $original = $this->registerSubscription(1);
        $this->assertSame(201, $original->getStatusCode(), (string) $original->getBody());
        $id = json_decode((string) $original->getBody(), true)['data']['id'];

        $response = $this->registerSubscription(2, attributes: [
            'keys'           => ['auth' => 'test-auth', 'p256dh' => 'test-key'],
            'expirationTime' => 1893456000000,
        ]);

        $this->assertSame(201, $response->getStatusCode(), (string) $response->getBody());
        $data = json_decode((string) $response->getBody(), true)['data'];
        $this->assertSame($id, $data['id']);
        $this->assertSame('2', $data['relationships']['user']['data']['id']);
        $this->assertArrayNotHasKey('keys', $data['attributes']);
        $this->assertSame(1, $this->database()->table('push_subscriptions')->count());
        $row = $this->database()->table('push_subscriptions')->first();
        $this->assertSame(2, (int) $row->user_id);
        $this->assertEquals(self::KEYS, json_decode($row->keys, true));
        $this->assertSame('2030-01-01 00:00:00', $row->expires_at);
        $this->assertSame('test-public-key', $row->vapid_public_key);
    }

    #[Test]
    public function the_same_owner_can_register_again_at_the_subscription_limit(): void
    {
        $this->assertRegistered(1);
        $this->assertRegistered(1, self::ENDPOINT.'-other');
        $this->database()->table('push_subscriptions')->where('endpoint', self::ENDPOINT)
            ->update(['last_used' => '2026-01-01 00:00:00']);
        $this->database()->table('push_subscriptions')->where('endpoint', self::ENDPOINT.'-other')
            ->update(['last_used' => '2026-01-02 00:00:00']);
        $before = $this->database()->table('push_subscriptions')->orderBy('id')->get()->all();

        $this->assertRegistered(1);

        $this->assertEquals($before, $this->database()->table('push_subscriptions')->orderBy('id')->get()->all());
    }

    #[Test]
    #[DataProvider('conflictingKeys')]
    public function conflicting_keys_leave_all_subscriptions_unchanged(array $attributes): void
    {
        $this->assertRegistered(1);
        $this->assertRegistered(2, self::ENDPOINT.'-old');
        $this->assertRegistered(2, self::ENDPOINT.'-new');
        $this->database()->table('push_subscriptions')->where('endpoint', self::ENDPOINT)->update([
            'vapid_public_key' => 'previous-public-key',
            'expires_at'       => '2027-01-01 00:00:00',
            'last_used'        => '2026-01-01 00:00:00',
        ]);
        $before = $this->database()->table('push_subscriptions')->orderBy('id')->get()->all();

        // Neither the owner nor another account may replace the encryption keys.
        foreach ([1, 2] as $userId) {
            $response = $this->send($this->request('POST', '/api/push_subscriptions', [
                'authenticatedAs' => $userId,
                'json'            => ['data' => ['attributes' => array_merge([
                    'endpoint'       => self::ENDPOINT,
                    'expirationTime' => 1893456000000,
                ], $attributes)]],
            ]));

            $this->assertSame(409, $response->getStatusCode(), (string) $response->getBody());
            $error = json_decode((string) $response->getBody(), true)['errors'][0];
            $this->assertSame('/data/attributes/keys', $error['source']['pointer']);
            $this->assertEquals($before, $this->database()->table('push_subscriptions')->orderBy('id')->get()->all());
        }
    }

    public static function conflictingKeys(): array
    {
        return [
            'different p256dh' => [['keys' => ['p256dh' => 'other-key', 'auth' => 'test-auth']]],
            'different auth'   => [['keys' => ['p256dh' => 'test-key', 'auth' => 'other-auth']]],
            'different both'   => [['keys' => ['p256dh' => 'other-key', 'auth' => 'other-auth']]],
            'omitted keys'     => [[]],
            'null keys'        => [['keys' => null]],
            'missing p256dh'   => [['keys' => ['auth' => 'test-auth']]],
            'missing auth'     => [['keys' => ['p256dh' => 'test-key']]],
        ];
    }

    #[Test]
    public function a_transfer_evicts_only_the_new_owners_least_recently_used_subscription(): void
    {
        $this->assertRegistered(1);
        $this->assertRegistered(1, self::ENDPOINT.'-other');
        $this->assertRegistered(2, self::ENDPOINT.'-old');
        $this->assertRegistered(2, self::ENDPOINT.'-new');
        foreach (['', '-other', '-old', '-new'] as $index => $suffix) {
            $this->database()->table('push_subscriptions')->where('endpoint', self::ENDPOINT.$suffix)
                ->update(['last_used' => '2026-01-0'.($index + 1).' 00:00:00']);
        }
        $before = $this->database()->table('push_subscriptions')->get()->keyBy('endpoint');

        $this->assertRegistered(2);

        $after = $this->database()->table('push_subscriptions')->get()->keyBy('endpoint');
        $this->assertCount(3, $after);
        $this->assertSame(2, $after->where('user_id', 2)->count());
        $this->assertSame(1, $after->where('user_id', 1)->count());
        $this->assertArrayNotHasKey(self::ENDPOINT.'-old', $after->all());
        $this->assertEquals($before[self::ENDPOINT.'-new'], $after[self::ENDPOINT.'-new']);
        $this->assertEquals($before[self::ENDPOINT.'-other'], $after[self::ENDPOINT.'-other']);
        $transferred = clone $before[self::ENDPOINT];
        $transferred->user_id = 2;
        $this->assertEquals($transferred, $after[self::ENDPOINT]);
    }

    #[Test]
    public function registering_a_new_endpoint_still_enforces_the_subscription_limit(): void
    {
        $this->assertRegistered(1, self::ENDPOINT.'-old');
        $this->assertRegistered(1, self::ENDPOINT.'-new');
        $this->database()->table('push_subscriptions')->where('endpoint', self::ENDPOINT.'-old')
            ->update(['last_used' => '2026-01-01 00:00:00']);
        $this->database()->table('push_subscriptions')->where('endpoint', self::ENDPOINT.'-new')
            ->update(['last_used' => '2026-01-02 00:00:00']);

        $this->assertRegistered(1);

        $this->assertEqualsCanonicalizing([self::ENDPOINT.'-new', self::ENDPOINT],
            $this->database()->table('push_subscriptions')->where('user_id', 1)->pluck('endpoint')->all());
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

    private function registerSubscription(int $userId, string $endpoint = self::ENDPOINT, array $attributes = []): ResponseInterface
    {
        return $this->send($this->request('POST', '/api/push_subscriptions', [
            'authenticatedAs' => $userId,
            'json'            => ['data' => ['attributes' => array_merge([
                'endpoint' => $endpoint,
                'keys'     => self::KEYS,
            ], $attributes)]],
        ]));
    }

    private function assertRegistered(int $userId, string $endpoint = self::ENDPOINT): void
    {
        $response = $this->registerSubscription($userId, $endpoint);
        $this->assertSame(201, $response->getStatusCode(), (string) $response->getBody());
    }
}
