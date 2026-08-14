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

namespace FoF\PWA\Api\Resource;

use Flarum\Api\Endpoint;
use Flarum\Api\Resource;
use Flarum\Api\Schema;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Exception\PermissionDeniedException;
use FoF\PWA\Model\PushSubscription;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Tobyz\JsonApiServer\Context as OriginalContext;

/**
 * @extends Resource\AbstractDatabaseResource<PushSubscription>
 */
class PushSubscriptionResource extends Resource\AbstractDatabaseResource
{
    /**
     * Taken from https://github.com/pushpad/known-push-services/blob/master/whitelist.
     *
     * @var string[]
     */
    public const array PUSH_HOST_ALLOWLIST = [
        'android.googleapis.com',
        'fcm.googleapis.com',
        'updates.push.services.mozilla.com',
        'updates-autopush.stage.mozaws.net',
        'updates-autopush.dev.mozaws.net',
        'notify.windows.com',
        'push.apple.com',
    ];

    public function __construct(protected SettingsRepositoryInterface $settings)
    {
    }

    public function type(): string
    {
        return 'push_subscriptions';
    }

    public function model(): string
    {
        return PushSubscription::class;
    }

    public function scope(Builder $query, OriginalContext $context): void
    {
        $query->whereVisibleTo($context->getActor());
    }

    public function endpoints(): array
    {
        return [
            Endpoint\Create::make()
                ->authenticated()
                ->defaultInclude(['user']),
        ];
    }

    public function fields(): array
    {
        return [
            Schema\Str::make('endpoint')
                ->writableOnCreate()
                ->requiredOnCreate()
                ->set(function (PushSubscription $subscription, string $value) {
                    $host = parse_url($value, PHP_URL_HOST);
                    if (!Str::endsWith($host, static::PUSH_HOST_ALLOWLIST)) {
                        throw new PermissionDeniedException();
                    }
                    $subscription->endpoint = $value;
                }),

            // Read-only: always set server-side in creating(), never trusted from the client.
            Schema\Str::make('vapidPublicKey'),

            Schema\DateTime::make('expiresAt')
                ->nullable()
                ->writableOnCreate(),

            // Hidden: write-only encryption material for the push service.
            // Not meant to be read back via the API.
            Schema\Arr::make('keys')
                ->hidden()
                ->nullable()
                ->writableOnCreate(),

            Schema\Relationship\ToOne::make('user')
                ->includable()
                ->type('users'),
        ];
    }

    /**
     * Endpoints are effectively unique per browser registration.
     * If a subscription for this endpoint already exists, reuse that row instead of creating a duplicate.
     */
    public function newModel(OriginalContext $context): object
    {
        if ($context->creating(self::class)) {
            $endpoint = Arr::get($context->body(), 'data.attributes.endpoint');

            if ($endpoint && $existing = PushSubscription::query()->where('endpoint', $endpoint)->first()) {
                return $existing;
            }
        }

        return parent::newModel($context);
    }

    public function creating(object $model, OriginalContext $context): ?object
    {
        $actor = $context->getActor();

        // Only enforce the per-user subscription cap and (re)assign ownership for a genuinely new row.
        // When newModel() returned an existing subscription (dedup match above), the original owner and cap bookkeeping are left untouched.
        if (!$model->exists) {
            $subscriptions = $actor->pushSubscriptions();
            $subscriptionCount = $subscriptions->count() + 1;
            $maxSubscriptionCount = $this->settings->get('fof-pwa.userMaxSubscriptions');

            if ($subscriptionCount > $maxSubscriptionCount) {
                $subscriptions->orderBy('last_used')->take($subscriptionCount - $maxSubscriptionCount)->delete();
            }

            $model->user_id = $actor->id;
        }

        $model->vapid_public_key = $this->settings->get('fof-pwa.vapid.public');

        return $model;
    }
}
