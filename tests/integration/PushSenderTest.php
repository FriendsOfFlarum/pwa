<?php

namespace FoF\PWA\Tests\integration;

use Flarum\Testing\integration\TestCase;
use FoF\PWA\PushSender;
use Laminas\Diactoros\Request;
use Laminas\Diactoros\Response;
use Minishlink\WebPush\MessageSentReport;
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
        $this->prepareDatabase([
            'push_subscriptions' => [[
                'id' => 1,
                'user_id' => 1,
                'endpoint' => self::ENDPOINT,
                'vapid_public_key' => 'test-public-key',
                'keys' => '{}',
                'last_used' => null,
            ]],
        ]);
    }

    #[Test]
    #[DataProvider('failures')]
    public function only_expired_subscriptions_are_deleted(?int $status, bool $deleted): void
    {
        $report = new MessageSentReport(
            new Request(self::ENDPOINT, 'POST'),
            $status === null ? null : new Response(status: $status),
            false,
            'Delivery failed',
        );

        $sender = $this->app()->getContainer()->make(TestablePushSender::class);
        $this->assertFalse($sender->processReport($report));
        $this->assertSame($deleted ? 0 : 1, $this->database()->table('push_subscriptions')->count());
        if (!$deleted) {
            $this->assertNull($this->database()->table('push_subscriptions')->value('last_used'));
        }
    }

    public static function failures(): array
    {
        return [
            'connection failure' => [null, false],
            'unauthorized' => [401, false],
            'forbidden' => [403, false],
            'not found' => [404, true],
            'gone' => [410, true],
            'rate limited' => [429, false],
            'service failure' => [503, false],
        ];
    }

    #[Test]
    public function successful_delivery_updates_last_used(): void
    {
        $sender = $this->app()->getContainer()->make(TestablePushSender::class);
        $report = new MessageSentReport(new Request(self::ENDPOINT, 'POST'), new Response(status: 201));

        $this->assertTrue($sender->processReport($report));
        $this->assertNotNull($this->database()->table('push_subscriptions')->value('last_used'));
    }

    #[Test]
    public function successful_delivery_tolerates_a_subscription_deleted_in_the_meantime(): void
    {
        $sender = $this->app()->getContainer()->make(TestablePushSender::class);
        $this->database()->table('push_subscriptions')->delete();
        $report = new MessageSentReport(new Request(self::ENDPOINT, 'POST'), new Response(status: 201));

        $this->assertTrue($sender->processReport($report));
        $this->assertSame(0, $this->database()->table('push_subscriptions')->count());
    }
}

class TestablePushSender extends PushSender
{
    public function processReport(MessageSentReport $report): bool
    {
        return $this->handleReport($report);
    }
}
