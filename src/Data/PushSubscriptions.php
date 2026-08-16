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

namespace FoF\PWA\Data;

use Flarum\Gdpr\Data\Type;
use FoF\PWA\Model\FirebasePushSubscription;
use FoF\PWA\Model\PushSubscription;
use Illuminate\Support\Arr;

class PushSubscriptions extends Type
{
    public function export(): ?array
    {
        $webPush = PushSubscription::query()
            ->where('user_id', $this->user->id)
            ->get()
            ->map(fn ($sub) => Arr::except($sub->toArray(), ['id', 'user_id']))
            ->toArray();

        $firebase = FirebasePushSubscription::query()
            ->where('user_id', $this->user->id)
            ->get()
            ->map(fn ($sub) => Arr::except($sub->toArray(), ['id', 'user_id']))
            ->toArray();

        if (empty($webPush) && empty($firebase)) {
            return null;
        }

        return [
            'pwa/subscriptions.json' => $this->encodeForExport([
                'web_push' => $webPush,
                'firebase' => $firebase,
            ]),
        ];
    }

    public static function anonymizeDescription(): string
    {
        return self::deleteDescription();
    }

    public function anonymize(): void
    {
        $this->delete();
    }

    public function delete(): void
    {
        PushSubscription::where('user_id', $this->user->id)->delete();
        FirebasePushSubscription::where('user_id', $this->user->id)->delete();
    }
}
