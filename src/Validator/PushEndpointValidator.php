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

namespace FoF\PWA\Validator;

use Closure;
use Flarum\Foundation\AbstractValidator;
use Illuminate\Support\Str;

class PushEndpointValidator extends AbstractValidator
{
    /**
     * Taken from https://github.com/pushpad/known-push-services/blob/master/whitelist.
     *
     * @var string[]
     */
    public const array PUSH_HOST_ALLOWLIST = [
        'android.googleapis.com',
        'fcm.googleapis.com',
        'jmt17.google.com',
        'updates.push.services.mozilla.com',
        'updates-autopush.stage.mozaws.net',
        'updates-autopush.dev.mozaws.net',
        'notify.windows.com',
        'push.apple.com',
    ];

    protected function getRules(): array
    {
        return [
            'endpoint' => [
                'bail',
                'required',
                'string',
                'max:2048',
                function (string $attribute, string $value, Closure $fail): void {
                    $url = parse_url($value);
                    $host = strtolower($url['host'] ?? '');
                    $scheme = strtolower($url['scheme'] ?? '');
                    $subdomains = array_map(fn (string $domain) => '.'.$domain, static::PUSH_HOST_ALLOWLIST);

                    if (!$host || $scheme !== 'https') {
                        $fail($this->translator->trans('fof-pwa.api.endpoint_https_required', ['url' => $value]));

                        return;
                    }

                    if (!(in_array($host, static::PUSH_HOST_ALLOWLIST, true) || Str::endsWith($host, $subdomains))) {
                        $fail($this->translator->trans('fof-pwa.api.endpoint_host_not_allowed', ['host' => $host]));
                    }
                },
            ],
        ];
    }
}
