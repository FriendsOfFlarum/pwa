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

/**
 * The page the installed app opens, as a path under the forum's base path.
 */
class StartUrl
{
    public const SETTING = 'fof-pwa.startUrl';

    /**
     * Returns the path without its leading slash ('' for the forum's home page),
     * or null if it could leave the forum: a full URL, a protocol-relative URL,
     * or a `.` or `..` segment.
     */
    public static function normalize(?string $value): ?string
    {
        $value = trim($value ?? '');

        if ($value === '') {
            return '';
        }

        if (preg_match('/[\s\\\\\x00-\x1F\x7F]/', $value)
            || str_starts_with($value, '//')
            || preg_match('/^[a-z][a-z0-9+.-]*:/i', $value)) {
            return null;
        }

        $value = ltrim($value, '/');
        $path = rawurldecode(strtok($value, '?#') ?: '');

        foreach (explode('/', $path) as $segment) {
            if ($segment === '.' || $segment === '..') {
                return null;
            }
        }

        return $value;
    }
}
