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

use Flarum\Extend\ExtenderInterface;
use Flarum\Extend\LifecycleInterface;
use Flarum\Extension\Extension;
use Illuminate\Contracts\Container\Container;
use Illuminate\Database\ConnectionInterface;

/**
 * Moves the old icons when the extension is enabled, after its migrations. An
 * event listener can't: the request that enables the extension was booted
 * without it.
 *
 * Tests enable the extension on every boot, so the services that draw the app
 * icon are only resolved when there are old icons.
 */
class MoveIconOnEnable implements ExtenderInterface, LifecycleInterface
{
    public function extend(Container $container, ?Extension $extension = null): void
    {
    }

    public function onEnable(Container $container, Extension $extension): void
    {
        if (LegacyIcons::exist($container->make(ConnectionInterface::class))) {
            $container->make(LegacyIcons::class)->moveToAppIcon();
        }
    }

    public function onDisable(Container $container, Extension $extension): void
    {
    }
}
