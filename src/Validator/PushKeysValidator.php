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

use Base64Url\Base64Url;
use Closure;
use Flarum\Locale\TranslatorInterface;
use Illuminate\Contracts\Validation\ValidationRule;

class PushKeysValidator implements ValidationRule
{
    public function __construct(protected TranslatorInterface $translator)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_array($value)) {
            $fail($this->translator->trans('fof-pwa.api.keys_invalid'));

            return;
        }

        $publicKey = $this->decodeKey($value['p256dh'] ?? null, 65);
        $auth = $this->decodeKey($value['auth'] ?? null, 16);

        if ($publicKey === null || $auth === null || $publicKey[0] !== "\x04") {
            $fail($this->translator->trans('fof-pwa.api.keys_invalid'));

            return;
        }

        // The browser's p256dh contains only a raw 65-byte P-256 public key.
        // OpenSSL needs a SubjectPublicKeyInfo wrapper (RFC 5480) to identify its format.
        // This fixed DER header says: "EC public key, P-256 curve, 65 bytes follow".
        // It is the same for every forum and subscription; the actual key is appended below.
        // hex2bin converts the header's hexadecimal notation into binary bytes.
        $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200').$publicKey;
        // Encode the complete structure as PEM so OpenSSL can read it.
        $pem = "-----BEGIN PUBLIC KEY-----\n".chunk_split(base64_encode($der), 64, "\n")."-----END PUBLIC KEY-----\n";

        // Importing also rejects points that do not lie on P-256, even with the correct length.
        if (openssl_pkey_get_public($pem) === false) {
            $fail($this->translator->trans('fof-pwa.api.keys_invalid'));
        }
    }

    private function decodeKey(mixed $value, int $length): ?string
    {
        if (!is_string($value) || strlen($value) > 4 * ceil($length / 3) || !preg_match('/\A[A-Za-z0-9_-]+={0,2}\z/', $value)) {
            return null;
        }

        $decoded = base64_decode(strtr($value, '-_', '+/'), true);

        if ($decoded === false || strlen($decoded) !== $length || Base64Url::encode($decoded) !== rtrim($value, '=')) {
            return null;
        }

        return $decoded;
    }
}
