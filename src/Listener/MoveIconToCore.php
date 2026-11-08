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

namespace FoF\PWA\Listener;

use Flarum\Foundation\Event\ClearingCache;
use FoF\PWA\LegacyIcons;

/**
 * Upgrades end with a cache clear, so that is when an upgraded forum's old
 * icons move. MoveIconOnEnable covers a forum that had the extension disabled.
 */
class MoveIconToCore
{
    public function __construct(
        protected LegacyIcons $icons
    ) {
    }

    public function handle(ClearingCache $event): void
    {
        $this->icons->moveToAppIcon();
    }
}
