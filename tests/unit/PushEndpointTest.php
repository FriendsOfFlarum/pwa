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

namespace FoF\PWA\Tests\unit;

use Flarum\Locale\Translator;
use Flarum\Testing\unit\TestCase;
use FoF\PWA\Validator\PushEndpointValidator;
use Illuminate\Validation\Factory;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

class PushEndpointTest extends TestCase
{
    #[Test]
    #[DataProvider('endpoints')]
    public function validates_push_service_urls(string $endpoint, bool $allowed): void
    {
        $translator = new Translator('en');
        $validator = new PushEndpointValidator(new Factory($translator), $translator);

        if (!$allowed) {
            $this->expectException(ValidationException::class);
        }

        $validator->assertValid(['endpoint' => $endpoint]);
        $this->addToAssertionCount(1);
    }

    public static function endpoints(): array
    {
        return [
            'FCM'                                => ['https://fcm.googleapis.com/fcm/send/token', true],
            'Google jmt17'                       => ['https://jmt17.google.com/token', true],
            'Mozilla'                            => ['https://updates.push.services.mozilla.com/wpush/v2/token', true],
            'Apple subdomain'                    => ['https://web.push.apple.com/token', true],
            'Windows subdomain'                  => ['https://wns2.notify.windows.com/token', true],
            'case insensitive host'              => ['https://FCM.GOOGLEAPIS.COM/token', true],
            'domain without label boundary'      => ['https://evilfcm.googleapis.com/token', false],
            'Apple suffix spoof'                 => ['https://evilpush.apple.com/token', false],
            'domain in path'                     => ['https://example.com/fcm.googleapis.com', false],
            'domain in user info'                => ['https://fcm.googleapis.com@example.com/token', false],
            'domain followed by attacker domain' => ['https://fcm.googleapis.com.example.com/token', false],
            'HTTP'                               => ['http://fcm.googleapis.com/token', false],
            'FTP'                                => ['ftp://fcm.googleapis.com/token', false],
            'scheme relative URL'                => ['//fcm.googleapis.com/token', false],
            'relative URL'                       => ['/token', false],
            'malformed URL'                      => ['https://[', false],
        ];
    }
}
