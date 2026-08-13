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

class NotificationMessage
{
    public function __construct(
        protected string $title,
        protected string $body,
        protected ?string $url = null,
    ) {
    }

    public function title(): string
    {
        return $this->excerpt($this->title, 30);
    }

    public function body(): string
    {
        return $this->excerpt($this->body, 200);
    }

    private function excerpt(string $text, int $max): string
    {
        $text = html_entity_decode(strip_tags($text), ENT_QUOTES, 'UTF-8');

        if (mb_strlen($text) > $max) {
            $text = mb_substr($text, 0, $max);

            $text .= '...';
        }

        return $text;
    }

    public function url(): ?string
    {
        return $this->url;
    }
}
