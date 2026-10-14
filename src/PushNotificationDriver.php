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

use Flarum\Notification\AlertableInterface;
use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Notification\Driver\NotificationDriverInterface;
use Flarum\Notification\Event\Sent;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use FoF\PWA\Job\SendPushNotificationsJob;
use Illuminate\Contracts\Queue\Queue;
use Illuminate\Support\Arr;
use ReflectionException;

class PushNotificationDriver implements NotificationDriverInterface
{
    public function __construct(protected Queue $queue, protected SettingsRepositoryInterface $settings, protected NotificationBuilder $notifications)
    {
    }

    /**
     * {@inheritDoc}
     *
     * @throws ReflectionException
     */
    public function registerType(string $blueprintClass, array $enabled): void
    {
        $defaultPrefToEmail = $this->settings->get('fof-pwa.pushNotifPreferenceDefaultToEmail');

        if ($this->notifications->supports($blueprintClass)) {
            User::registerPreference(
                User::getNotificationPreferenceKey($blueprintClass::getType(), 'push'),
                'boolval',
                $defaultPrefToEmail && in_array('email', $enabled)
            );
        }
    }

    /**
     * {@inheritDoc}
     *
     * @throws ReflectionException
     */
    public function send(BlueprintInterface $blueprint, array $users): void
    {
        // An alert is pushed once core has saved it (see sent()), so the
        // push's unread count for the app icon's badge includes it.
        if ($blueprint instanceof AlertableInterface) {
            return;
        }

        $this->push($blueprint, $users);
    }

    /**
     * Pushes an alert to the recipients core has just saved it for.
     */
    public function sent(Sent $event): void
    {
        $this->push($event->blueprint, $event->recipients);
    }

    /**
     * @param User[] $users
     */
    protected function push(BlueprintInterface $blueprint, array $users): void
    {
        if (!$this->notifications->supports(get_class($blueprint))) {
            return;
        }

        $users = array_filter($users, function ($user) use ($blueprint) {
            return $user->getPreference(User::getNotificationPreferenceKey($blueprint->getType(), 'push'));
        });

        $userIds = Arr::pluck($users, 'id');

        $this->queue->push(new SendPushNotificationsJob($blueprint, $userIds));
    }
}
