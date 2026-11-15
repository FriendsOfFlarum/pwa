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

use Flarum\Foundation\ValidationException;
use Flarum\Locale\TranslatorInterface;
use Flarum\Settings\Event\Saving;
use FoF\PWA\StartUrl;

class ValidateStartUrl
{
    public function __construct(
        private readonly TranslatorInterface $translator
    ) {
    }

    public function handle(Saving $event): void
    {
        if (! array_key_exists(StartUrl::SETTING, $event->settings)) {
            return;
        }

        $startUrl = StartUrl::normalize($event->settings[StartUrl::SETTING]);

        if ($startUrl === null) {
            throw new ValidationException([
                StartUrl::SETTING => $this->translator->trans('fof-pwa.admin.pwa.other.start_url_invalid'),
            ]);
        }

        $event->settings[StartUrl::SETTING] = $startUrl;
    }
}
