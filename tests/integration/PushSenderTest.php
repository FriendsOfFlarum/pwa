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

use Flarum\Database\AbstractModel;
use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;
use FoF\PWA\PushSender;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Database\ConnectionInterface;
use Laminas\Diactoros\Request;
use Laminas\Diactoros\Response;
use Minishlink\WebPush\MessageSentReport;
use Minishlink\WebPush\SubscriptionInterface;
use Minishlink\WebPush\WebPush;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

class PushSenderTest extends TestCase
{
    private const string ENDPOINT = 'https://fcm.googleapis.com/fcm/send/test-token';

    protected function setUp(): void
    {
        parent::setUp();
        $this->extension('fof-pwa');
        $this->setting('fof-pwa.vapid.public', 'test-public-key');
        $this->setting('fof-pwa.vapid.private', 'test-private-key');
    }

    #[Test]
    #[DataProvider('notificationIcons')]
    public function selects_the_largest_pwa_icon_or_falls_back_to_the_forum_logo(array $settings, ?string $expectedIcon): void
    {
        foreach ($settings as $key => $value) {
            $this->setting($key, $value);
        }

        $this->setting('favicon_path', 'favicon.png');
        $container = $this->app()->getContainer();
        $payload = $container->make(PayloadPushSender::class)->payload();
        $assets = $container->make(Factory::class)->disk('flarum-assets');

        $this->assertSame($assets->url('favicon.png'), $payload['badge']);

        if ($expectedIcon === null) {
            $this->assertArrayNotHasKey('icon', $payload);
        } else {
            $this->assertSame($assets->url($expectedIcon), $payload['icon']);
        }
    }

    public static function notificationIcons(): array
    {
        return [
            'largest PWA icon' => [[
                'fof-pwa.icon_196_path' => 'small.png',
                'fof-pwa.icon_512_path' => 'large.png',
                'logo_path'            => 'logo.png',
            ], 'large.png'],
            'forum logo' => [['logo_path' => 'logo.png'], 'logo.png'],
            'no icon'    => [[], null],
        ];
    }

    #[Test]
    #[DataProvider('failures')]
    public function only_expired_subscriptions_are_deleted(?int $status, bool $deleted): void
    {
        $this->prepareDatabase(['push_subscriptions' => [$this->subscription(1, 1, self::ENDPOINT)]]);

        $this->notifyRecipients([1], new FakeWebPush([self::ENDPOINT => $status]));

        $this->assertSame($deleted ? 0 : 1, $this->database()->table('push_subscriptions')->count());
        if (!$deleted) {
            $this->assertNull($this->database()->table('push_subscriptions')->value('last_used'));
        }
    }

    public static function failures(): array
    {
        return [
            'connection failure' => [null, false],
            'unauthorized'       => [401, false],
            'forbidden'          => [403, false],
            'not found'          => [404, true],
            'gone'               => [410, true],
            'rate limited'       => [429, false],
            'service failure'    => [503, false],
        ];
    }

    #[Test]
    public function successful_delivery_updates_last_used(): void
    {
        $this->prepareDatabase(['push_subscriptions' => [$this->subscription(1, 1, self::ENDPOINT)]]);

        $this->notifyRecipients([1], new FakeWebPush());

        $this->assertNotNull($this->database()->table('push_subscriptions')->value('last_used'));
    }

    #[Test]
    public function successful_delivery_tolerates_a_subscription_deleted_in_the_meantime(): void
    {
        $this->prepareDatabase(['push_subscriptions' => [$this->subscription(1, 1, self::ENDPOINT)]]);

        $this->notifyRecipients([1], new FakeWebPush(beforeReports: fn () => $this->database()->table('push_subscriptions')->delete()));

        $this->assertSame(0, $this->database()->table('push_subscriptions')->count());
    }

    #[Test]
    public function sends_to_every_subscription_of_every_recipient(): void
    {
        $this->prepareRecipients();
        $webPush = new FakeWebPush();

        $this->notifyRecipients([2, 3, 4], $webPush);

        $this->assertEqualsCanonicalizing($this->endpoints([2, 3, 4]), $webPush->queued);
    }

    // Recording the outcome of a send used to cost a lookup and a write for
    // each subscription, and loading them a query for each recipient.
    #[Test]
    public function recording_deliveries_does_not_query_once_per_subscription(): void
    {
        $this->prepareRecipients();
        [$expired, $failed] = [$this->endpoint(2, 1), $this->endpoint(3, 1)];

        $queries = $this->queriesDuring(fn () => $this->notifyRecipients([2, 3, 4], new FakeWebPush([$expired => 410, $failed => 503])));

        $this->assertSame([], $this->repeatedQueries($queries, 3), 'Queries were run once per recipient or subscription.');

        $rows = $this->database()->table('push_subscriptions')->get()->keyBy('endpoint');
        $this->assertArrayNotHasKey($expired, $rows->all(), 'The expired subscription should be deleted.');
        $this->assertNull($rows[$failed]->last_used, 'A failed delivery should not count as a use.');
        $this->assertCount(4, $rows->filter(fn ($row) => $row->last_used !== null), 'Every delivered subscription should be marked as used.');
    }

    /**
     * Three users with two subscriptions each.
     */
    private function prepareRecipients(): void
    {
        $users = [];
        $subscriptions = [];

        foreach ([2, 3, 4] as $userId) {
            $users[] = ['id' => $userId, 'username' => "user$userId", 'email' => "user$userId@machine.local", 'is_email_confirmed' => 1];

            foreach ([1, 2] as $device) {
                $subscriptions[] = $this->subscription($userId * 10 + $device, $userId, $this->endpoint($userId, $device));
            }
        }

        $this->prepareDatabase([User::class => $users, 'push_subscriptions' => $subscriptions]);
    }

    private function subscription(int $id, int $userId, string $endpoint): array
    {
        return [
            'id'               => $id,
            'user_id'          => $userId,
            'endpoint'         => $endpoint,
            'vapid_public_key' => 'test-public-key',
            'keys'             => '{}',
            'last_used'        => null,
        ];
    }

    private function endpoint(int $userId, int $device): string
    {
        return self::ENDPOINT."-$userId-$device";
    }

    /**
     * @return string[]
     */
    private function endpoints(array $userIds): array
    {
        return array_merge(...array_map(fn (int $userId) => [$this->endpoint($userId, 1), $this->endpoint($userId, 2)], $userIds));
    }

    private function notifyRecipients(array $userIds, FakeWebPush $webPush): void
    {
        $sender = $this->app()->getContainer()->make(TestablePushSender::class);
        $sender->webPush = $webPush;

        $sender->notify(new TestBlueprint(), $userIds);
    }

    /**
     * @return string[] the SQL run while the callback executed
     */
    private function queriesDuring(callable $callback): array
    {
        $queries = [];
        $listening = true;

        $this->app()->getContainer()->make(ConnectionInterface::class)
            ->listen(function ($query) use (&$queries, &$listening) {
                if ($listening) {
                    $queries[] = $query->sql;
                }
            });

        $callback();
        $listening = false;

        return $queries;
    }

    /**
     * @param string[] $queries
     *
     * @return array<string, int> the queries run at least $times times, with their counts
     */
    private function repeatedQueries(array $queries, int $times): array
    {
        // Lists of bound values vary in length between otherwise identical queries.
        $shapes = array_map(fn (string $sql) => preg_replace('/\bin \([?, ]+\)/i', 'in (?)', $sql), $queries);

        return array_filter(array_count_values($shapes), fn (int $count) => $count >= $times);
    }
}

class PayloadPushSender extends PushSender
{
    public function payload(): array
    {
        return $this->getPayload(new PayloadBlueprint());
    }
}

class TestablePushSender extends PushSender
{
    public FakeWebPush $webPush;

    protected function newWebPush(array $auth, array $options): WebPush
    {
        return $this->webPush;
    }

    // What a notification says isn't under test here.
    protected function getPayload(BlueprintInterface $blueprint): array
    {
        return ['title' => 'Title', 'content' => 'Content', 'link' => 'https://example.com'];
    }
}

/**
 * Stands in for the push services: records what was queued and reports the
 * given status for each endpoint (201 when not given), without sending anything.
 */
class FakeWebPush extends WebPush
{
    /** @var string[] */
    public array $queued = [];

    /**
     * @param array<string, int|null> $statuses null for an endpoint that couldn't be reached
     */
    public function __construct(private readonly array $statuses = [], private readonly ?\Closure $beforeReports = null)
    {
        // The parent validates the VAPID keys and finds an HTTP client, neither of which is needed.
    }

    public function queueNotification(SubscriptionInterface $subscription, ?string $payload = null, array $options = [], array $auth = []): void
    {
        $this->queued[] = $subscription->getEndpoint();
    }

    public function flush(?int $batchSize = null): \Generator
    {
        if ($this->beforeReports) {
            ($this->beforeReports)();
        }

        foreach ($this->queued as $endpoint) {
            $status = array_key_exists($endpoint, $this->statuses) ? $this->statuses[$endpoint] : 201;
            $success = $status !== null && $status < 300;

            yield new MessageSentReport(
                new Request($endpoint, 'POST'),
                $status === null ? null : new Response(status: $status),
                $success,
                $success ? 'OK' : 'Delivery failed',
            );
        }
    }
}

class TestBlueprint implements BlueprintInterface
{
    public function getFromUser(): ?User
    {
        return null;
    }

    public function getSubject(): ?AbstractModel
    {
        return null;
    }

    public function getData(): mixed
    {
        return null;
    }

    public static function getType(): string
    {
        return 'pwaTest';
    }

    public static function getSubjectModel(): string
    {
        return User::class;
    }
}

class PayloadBlueprint extends TestBlueprint
{
    public static function getSubjectModel(): string
    {
        return '';
    }
}
