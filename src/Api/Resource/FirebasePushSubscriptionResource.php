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
use FoF\PWA\Model\FirebasePushSubscription;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Tobyz\JsonApiServer\Context as OriginalContext;

/**
 * @extends Resource\AbstractDatabaseResource<FirebasePushSubscription>
 */
class FirebasePushSubscriptionResource extends Resource\AbstractDatabaseResource
{
    public function type(): string
    {
        return 'firebase_push_subscriptions';
    }

    public function model(): string
    {
        return FirebasePushSubscription::class;
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
            Schema\Str::make('token')
                ->requiredOnCreate()
                ->writableOnCreate(),
            Schema\Relationship\ToOne::make('user')
                ->includable()
                ->type('users'),
        ];
    }

    public function newModel(OriginalContext $context): object
    {
        if ($context->creating(self::class)) {
            $actor = $context->getActor();
            $body = $context->body();
            $token = Arr::get($body, 'data.attributes.token');

            if ($token) {
                return FirebasePushSubscription::query()->firstOrNew([
                    'user_id' => $actor->id,
                    'token' => $token,
                ]);
            }
        }

        return parent::newModel($context);
    }

    public function creating(object $model, OriginalContext $context): ?object
    {
        $model->user_id = $context->getActor()->id;

        return $model;
    }
}
