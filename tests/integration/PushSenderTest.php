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
use Flarum\Discussion\Discussion;
use Flarum\Notification\AlertableInterface;
use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;
use FoF\PWA\PushSender;
use Illuminate\Contracts\Cache\Repository as Cache;
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
                'logo_path'             => 'logo.png',
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

    #[Test]
    public function each_recipient_is_sent_their_own_unread_count(): void
    {
        $this->prepareRecipients();
        $this->prepareDatabase(['notifications' => [
            // user 3: two unread; a read one and a deleted one don't count
            $this->notification(1, 3), $this->notification(2, 3),
            $this->notification(3, 3, read: true), $this->notification(4, 3, deleted: true),
            // user 4: one unread; one of a type nothing registers isn't alertable
            $this->notification(5, 4), $this->notification(6, 4, type: 'notRegistered'),
        ]]);
        $webPush = new FakeWebPush();

        $this->notifyRecipients([2, 3, 4], $webPush);

        $this->assertSame(
            [2 => 0, 3 => 2, 4 => 1],
            $this->unreadCountsSent($webPush, [2, 3, 4]),
        );
    }

    #[Test]
    public function an_alert_not_saved_yet_is_counted_once(): void
    {
        $this->prepareRecipients();
        // user 2's alert for this notification is already saved; user 3's job hasn't run yet
        $this->prepareDatabase(['notifications' => [$this->notification(1, 2)]]);
        // user 4 has alerts for this type turned off, so it isn't counted
        $this->database()->table('users')->where('id', 4)->update(['preferences' => json_encode(['notify_discussionRenamed_alert' => false])]);
        $webPush = new FakeWebPush();

        $this->notifyRecipients([2, 3, 4], $webPush, new AlertBlueprint());

        $this->assertSame([2 => 1, 3 => 1, 4 => 0], $this->unreadCountsSent($webPush, [2, 3, 4]));
    }

    #[Test]
    public function cores_cached_count_is_used_when_it_has_one(): void
    {
        $this->prepareRecipients();
        $this->prepareDatabase(['notifications' => [$this->notification(1, 2)]]);
        $cache = $this->app()->getContainer()->make(Cache::class);
        $cache->put('user.2.unread_notification_count', 7, 300);
        // Redis hands a stored number back as a string.
        $cache->put('user.3.unread_notification_count', '4', 300);
        $webPush = new FakeWebPush();

        $this->notifyRecipients([2, 3, 4], $webPush);

        $this->assertSame([2 => 7, 3 => 4, 4 => 0], $this->unreadCountsSent($webPush, [2, 3, 4]));
    }

    #[Test]
    public function counting_unread_notifications_costs_the_same_for_one_recipient_as_for_many(): void
    {
        $this->prepareRecipients();
        $this->prepareDatabase(['notifications' => [
            $this->notification(1, 2), $this->notification(2, 3), $this->notification(3, 4), $this->notification(4, 4),
        ]]);

        // A first send loads what any send needs once (settings, preferences), so neither measured run pays for it.
        $this->notifyRecipients([2], new FakeWebPush(), new AlertBlueprint());
        // One recipient's count is cached, so both ways of counting are measured.
        $this->app()->getContainer()->make(Cache::class)->put('user.4.unread_notification_count', 2, 300);

        $one = $this->queriesDuring(fn () => $this->notifyRecipients([2], new FakeWebPush(), new AlertBlueprint()));
        $many = $this->queriesDuring(fn () => $this->notifyRecipients([2, 3, 4], new FakeWebPush(), new AlertBlueprint()));

        $this->assertCount(count($one), $many, 'Queries grew with the number of recipients.');
        $this->assertSame([], $this->repeatedQueries($many, 2), 'A query was run once per recipient.');
    }

    /**
     * @return array<int, int> user id => the unread count every one of their devices was sent
     */
    private function unreadCountsSent(FakeWebPush $webPush, array $userIds): array
    {
        $counts = [];

        foreach ($userIds as $userId) {
            $sent = array_unique(array_map(
                fn (int $device) => json_decode($webPush->payloads[$this->endpoint($userId, $device)], true)['unreadCount'],
                [1, 2]
            ));
            $this->assertCount(1, $sent, "User $userId's devices were sent different counts.");
            $counts[$userId] = $sent[0];
        }

        return $counts;
    }

    private function notification(int $id, int $userId, bool $read = false, bool $deleted = false, string $type = 'discussionRenamed'): array
    {
        return [
            'id'           => $id,
            'user_id'      => $userId,
            'from_user_id' => null,
            'type'         => $type,
            'subject_id'   => $id <= 6 ? $id : 1,
            'data'         => null,
            'created_at'   => '2026-10-01 00:00:00',
            'read_at'      => $read ? '2026-10-02 00:00:00' : null,
            'is_deleted'   => $deleted,
        ];
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

        // Real, visible subjects for the notifications: core's own count leaves out any it can't see.
        $discussions = array_map(fn (int $id) => ['id' => $id, 'title' => "Discussion $id", 'user_id' => 2, 'created_at' => '2026-10-01 00:00:00', 'comment_count' => 1, 'participant_count' => 1, 'is_private' => false], range(1, 6));

        $this->prepareDatabase([User::class => $users, Discussion::class => $discussions, 'push_subscriptions' => $subscriptions]);
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

    private function notifyRecipients(array $userIds, FakeWebPush $webPush, ?BlueprintInterface $blueprint = null): void
    {
        $sender = $this->app()->getContainer()->make(TestablePushSender::class);
        $sender->webPush = $webPush;

        $sender->notify($blueprint ?? new TestBlueprint(), $userIds);
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

    /** @var array<string, string|null> endpoint => payload */
    public array $payloads = [];

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
        $this->payloads[$subscription->getEndpoint()] = $payload;
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

/**
 * An alert of a type core registers (so it is alertable), about discussion 1.
 */
class AlertBlueprint extends TestBlueprint implements AlertableInterface
{
    public function getSubject(): ?AbstractModel
    {
        return (new Discussion())->forceFill(['id' => 1]);
    }

    public static function getType(): string
    {
        return 'discussionRenamed';
    }

    public static function getSubjectModel(): string
    {
        return Discussion::class;
    }
}
