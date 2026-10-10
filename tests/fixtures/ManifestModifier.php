<?php

namespace FoF\PWA\Tests\fixtures;

use Flarum\Settings\SettingsRepositoryInterface;

class ManifestModifier
{
    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    public function __invoke(array $manifest): array
    {
        $manifest['name'] .= ' '.$this->settings->get('forum_title');
        $manifest['categories'][] = 'news';

        return $manifest;
    }
}
