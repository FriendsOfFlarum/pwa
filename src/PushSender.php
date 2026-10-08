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

namespace FoF\PWA;

use Base64Url\Base64Url;
use Carbon\Carbon;
use ErrorException;
use Exception;
use Flarum\Http\UrlGenerator;
use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use FoF\PWA\Model\PushSubscription;
use Illuminate\Contracts\Filesystem\Cloud;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Minishlink\WebPush\MessageSentReport;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Psr\Log\LoggerInterface;

class PushSender
{
    use PWATrait;

    protected Cloud $assetsFilesystem;

    public function __construct(
        Factory $filesystemFactory,
        protected LoggerInterface $logger,
        protected SettingsRepositoryInterface $settings,
        protected UrlGenerator $url,
        protected NotificationBuilder $notifications,
    ) {
        $this->assetsFilesystem = $filesystemFactory->disk('flarum-assets');
    }

    /**
     * @throws ErrorException
     * @throws Exception
     */
    public function notify(BlueprintInterface $blueprint, array $userIds = []): void
    {
        $users = User::with('pushSubscriptions')->whereIn('id', $userIds)->get()->all();

        $this->log('[PWA PUSH] Notification Type: '.$blueprint::getType());
        $this->log('[PWA PUSH] Sending for users with ids: '.json_encode(Arr::pluck($users, 'id')));

        $notifications = [];

        $payload = json_encode($this->getPayload($blueprint));

        /** @var Collection<int, PushSubscription> $subscriptions */
        $subscriptions = new Collection();

        foreach ($users as $user) {
            foreach ($user->pushSubscriptions as $subscription) {
                $subscriptions->push($subscription);
                $notifications[] = [
                    'subscription' => Subscription::create([
                        'endpoint' => $subscription->endpoint,
                        'keys'     => $subscription->keys,
                    ]),
                    'payload' => $payload,
                ];
            }
        }

        $auth = [
            'VAPID' => [
                'subject'    => $this->url->to('forum')->base(),
                'publicKey'  => Util::url_encode($this->settings->get('fof-pwa.vapid.public')),
                'privateKey' => Util::url_encode($this->settings->get('fof-pwa.vapid.private')),
            ],
        ];

        // Safari web push seems to require that topic strings be a multiple of 4.
        // https://stackoverflow.com/questions/75685856/what-is-the-cause-of-badwebpushtopic-from-https-web-push-apple-com
        // As suggested, we Base64Url::encode, pad with 0s up to at least 32, and then trim down to exactly 32.
        $safariTopicLen = 32;
        $typeAndId = $blueprint->getType().strval($blueprint->getSubject()->id ?? -1);
        $topic = substr(str_pad(Base64Url::encode($typeAndId), $safariTopicLen, '0'), 0, $safariTopicLen);

        $this->log("[PWA PUSH] Attempting to send {$subscriptions->count()} notifications.\n\n");

        $webPush = $this->newWebPush($auth, [
            'topic' => $topic,
            'TTL'   => (int) $this->settings->get('fof-pwa.pushNotificationTtl'),
        ]);
        $webPush->setReuseVAPIDHeaders(true);
        $webPush->setAutomaticPadding(false);

        // send multiple notifications with payload
        foreach ($notifications as $notification) {
            $webPush->queueNotification(
                $notification['subscription'],
                $notification['payload']
            );
        }

        $delivered = [];
        $expired = [];

        /** @var MessageSentReport $report */
        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                $delivered[] = $report->getEndpoint();
            } elseif ($report->isSubscriptionExpired()) {
                $expired[] = $report->getEndpoint();
            } else {
                $this->log("[PWA PUSH] Message failed to send for subscription {$report->getEndpoint()}: {$report->getReason()}");
            }
        }

        $this->recordDeliveries($subscriptions, $delivered, $expired);

        $this->log('[PWA PUSH] Sent '.count($delivered)." notifications successfully.\n\n");
    }

    /**
     * Marks the subscriptions delivered to as used, and deletes those whose
     * endpoints the push service says have expired, in batches rather than a
     * query or two per subscription.
     *
     * @param Collection<int, PushSubscription> $subscriptions those sent to
     * @param string[]                          $delivered     endpoints delivered to
     * @param string[]                          $expired       endpoints that have expired
     */
    protected function recordDeliveries(Collection $subscriptions, array $delivered, array $expired): void
    {
        $delivered = array_flip($delivered);
        $used = $subscriptions->filter(fn (PushSubscription $subscription) => isset($delivered[$subscription->endpoint]))->modelKeys();
        $now = Carbon::now();

        // Chunked to stay within the database's limit on bound parameters.
        foreach (array_chunk($used, 1000) as $ids) {
            PushSubscription::query()->whereIn('id', $ids)->update(['last_used' => $now]);
        }

        // An expired endpoint is gone for every subscription that has it.
        foreach (array_chunk(array_unique($expired), 1000) as $endpoints) {
            PushSubscription::query()->whereIn('endpoint', $endpoints)->delete();
        }
    }

    /**
     * @throws ErrorException
     */
    protected function newWebPush(array $auth, array $options): WebPush
    {
        return new WebPush($auth, $options);
    }

    protected function getPayload(BlueprintInterface $blueprint): array
    {
        $message = $this->notifications->build($blueprint);

        $payload = [
            'title'   => $message->title(),
            'content' => $message->body(),
            'link'    => $message->url(),
        ];

        if ($faviconPath = $this->settings->get('favicon_path')) {
            $payload['badge'] = $this->assetsFilesystem->url($faviconPath);
        }

        $pwaIcons = array_reverse($this->getIcons());

        if (!empty($pwaIcons)) {
            $payload['icon'] = $pwaIcons[0]['src'];
        } elseif ($logoPath = $this->settings->get('logo_path')) {
            $payload['icon'] = $this->assetsFilesystem->url($logoPath);
        }

        return $payload;
    }

    protected function log(string $message): void
    {
        if ($this->settings->get('fof-pwa.debug', false)) {
            $this->logger->info($message);
        }
    }
}
