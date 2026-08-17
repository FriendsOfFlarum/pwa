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

namespace FoF\PWA\Api\Controller;

use Flarum\Api\JsonApiResponse;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Settings\SettingsRepositoryInterface;
use FoF\PWA\IconSize;
use FoF\PWA\PWATrait;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ShowPWASettingsController implements RequestHandlerInterface
{
    use PWATrait;

    public function __construct(
        protected SettingsRepositoryInterface $settings,
        protected TranslatorInterface $translator,
        protected UrlGenerator $url
    ) {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        $status_messages = [];

        $logo = false;

        foreach (IconSize::cases() as $size) {
            if ($size->value >= 144 && $this->settings->get($size->getSettingsKey())) {
                $logo = true;
            }
        }

        if (!isset($this->buildManifest()['name'])) {
            $status_messages[] = [
                'type'    => 'error',
                'message' => $this->translator->trans('fof-pwa.admin.status.no_name'),
            ];
        }

        if (!$logo) {
            $status_messages[] = [
                'type'    => 'error',
                'message' => $this->translator->trans('fof-pwa.admin.status.no_logo'),
            ];
        }

        if ((empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') && $_SERVER['SERVER_PORT'] != 443) {
            $status_messages[] = [
                'type'    => 'warning',
                'message' => $this->translator->trans('fof-pwa.admin.status.possible_https_disabled'),
            ];
        }

        if (parse_url($this->url->to('forum')->base(), PHP_URL_SCHEME) !== 'https') {
            $status_messages[] = [
                'type'    => 'error',
                'message' => $this->translator->trans('fof-pwa.admin.status.config_no_https'),
            ];
        }

        if (!function_exists('gmp_init')) {
            $status_messages[] = [
                'type'    => 'warning',
                'message' => $this->translator->trans('fof-pwa.admin.status.suggest_gmp'),
            ];
        }

        if (!$this->settings->get('fof-pwa.vapid.private') || !$this->settings->get('fof-pwa.vapid.public')) {
            $status_messages[] = [
                'type'    => 'error',
                'message' => $this->translator->trans('fof-pwa.admin.status.no_vapid_keys'),
            ];
        }

        if (!$this->settings->get('fof-pwa.vapid.success', true)) {
            $status_messages[] = [
                'type'    => 'error',
                'message' => $this->translator->trans(
                    'fof-pwa.admin.status.key_gen_failed',
                    ['error' => $this->settings->get('fof-pwa.vapid.error', '')]
                ),
            ];
        }

        if (empty($status_messages)) {
            $status_messages[] = [
                'type'    => 'success',
                'message' => $this->translator->trans('fof-pwa.admin.status.success'),
            ];
        }

        return new JsonApiResponse([
            'manifest'        => $this->buildManifest(),
            'sizes'           => IconSize::cases(),
            'status_messages' => $status_messages,
        ]);
    }
}
