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

namespace FoF\PWA\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\BasicUserSerializer;
use FoF\PWA\FirebasePushSubscription;
use InvalidArgumentException;
use Tobscure\JsonApi\Relationship;

class FirebasePushSubscriptionSerializer extends AbstractSerializer
{
    /**
     * {@inheritdoc}
     */
    protected $type = 'firebase_push_subscriptions';

    /**
     * {@inheritdoc}
     */
    protected function getDefaultAttributes($subscription): array
    {
        if (!($subscription instanceof FirebasePushSubscription)) {
            throw new InvalidArgumentException(
                get_class($this).' can only serialize instances of '.FirebasePushSubscription::class
            );
        }

        return [
            'token' => $subscription->token,
        ];
    }

    protected function user($subscription): Relationship
    {
        return $this->hasOne($subscription, BasicUserSerializer::class);
    }
}
