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
use FoF\PWA\Model\PushSubscription;
use FoF\PWA\Validator\PushEndpointValidator;
use FoF\PWA\Validator\PushKeysValidator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Tobyz\JsonApiServer\Context as OriginalContext;
use Tobyz\JsonApiServer\Exception\ConflictException;

/**
 * @extends Resource\AbstractDatabaseResource<PushSubscription>
 */
class PushSubscriptionResource extends Resource\AbstractDatabaseResource
{
    public function __construct(
        protected SettingsRepositoryInterface $settings,
        protected PushEndpointValidator $endpointValidator,
        protected PushKeysValidator $keysValidator,
    ) {
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
                ->rule(fn () => $this->endpointValidator),

            // Read-only: always set server-side in creating(), never trusted from the client.
            Schema\Str::make('vapidPublicKey'),

            Schema\Integer::make('expirationTime')
                ->nullable()
                ->writable()
                ->set(function (PushSubscription $model, ?int $value) {
                    $model->expires_at = $value ? Carbon::createFromTimestampMs($value) : null;
                }),

            // Hidden: write-only encryption material for the push service.
            // Not meant to be read back via the API.
            Schema\Arr::make('keys')
                ->hidden()
                ->requiredOnCreate()
                ->writableOnCreate()
                ->rule(fn () => $this->keysValidator),

            Schema\Relationship\ToOne::make('user')
                ->includable()
                ->type('users'),
        ];
    }

    /**
     * Endpoints are effectively unique per browser registration.
     * Reuse an existing row only when the browser proves it has the same encryption keys.
     */
    public function newModel(OriginalContext $context): object
    {
        if ($context->creating(self::class)) {
            $endpoint = Arr::get($context->body(), 'data.attributes.endpoint');

            if ($endpoint && $existing = PushSubscription::query()->where('endpoint', $endpoint)->first()) {
                // Check before the API assigns request fields to the existing model.
                foreach (['p256dh', 'auth'] as $key) {
                    $value = Arr::get($context->body(), 'data.attributes.keys.'.$key);

                    if (!is_string($value) || $value !== ($existing->keys[$key] ?? null)) {
                        throw (new ConflictException('The push subscription keys do not match the existing endpoint.'))
                            ->setSource(['pointer' => '/data/attributes/keys']);
                    }
                }

                return $existing;
            }
        }

        return parent::newModel($context);
    }

    public function creating(object $model, OriginalContext $context): ?object
    {
        $actor = $context->getActor();

        // A transfer takes a slot for the new owner, just like a new subscription.
        if (!$model->exists || $model->user_id != $actor->id) {
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
