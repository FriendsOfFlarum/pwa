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

enum IconSize: int
{
    case SIZE_48 = 48;
    case SIZE_72 = 72;
    case SIZE_96 = 96;
    case SIZE_144 = 144;
    case SIZE_196 = 196;
    case SIZE_256 = 256;
    case SIZE_512 = 512;

    public function getSettingsKey(): string
    {
        return "fof-pwa.icon_{$this->value}_path";
    }
}
