# Flarum Progressive Web App

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/fof/pwa.svg)](https://packagist.org/packages/fof/pwa)

A [Flarum](https://flarum.org) extension that lets users install your forum as an app, adding a shortcut to their home screen or desktop. It also adds push notification support. Configure both from your admin dashboard.

## Installation

```sh
composer require fof/pwa
```

## Updating

```sh
composer update fof/pwa
```

### Flarum 2.1

From Flarum 2.1, Flarum makes the forum installable itself: it has the app icon, the web app manifest, the service worker, the offline page and pull-to-refresh on iPhone and iPad. fof/pwa builds on them, adding push notifications, share buttons and its own manifest settings. Push notifications show the app icon, or the favicon without one.

Upload the app icon under Appearance. When upgrading from an earlier version, the 512 by 512 pixel icon uploaded to fof/pwa becomes the app icon if the forum has none. Smaller icons aren't used, as they would look small on home screens, so a forum without a 512 pixel icon needs a new one uploaded. The old icons are deleted either way. This happens the next time the cache is cleared, or when the extension is enabled.

The short name (Basics), the splash screen background colour and whether the forum opens as an app (Appearance) are also Flarum's own settings now. Upgrading moves fof/pwa's short name and background colour into them, unless they are already set or Flarum wouldn't accept them.

fof/pwa's long name and theme colour settings are gone: the app takes its name from the forum title (Basics) and its theme colour from the primary colour (Appearance), which the browser already used for the forum's pages. Upgrading deletes the old values.

Flarum keeps forums that upgrade from 2.0 opening in the browser. A forum that used fof/pwa without choosing a display mode opened as an app, so upgrading turns "Open as an app" on for it, which also turns on Flarum's splash screens. A forum where an admin chose a display mode, of any kind, keeps Flarum's setting: turn it on under Appearance to open as an app. Display modes other than opening as an app or in the browser are no longer available.

## For Developers

### Extending the manifest

fof/pwa adds its settings to Flarum's own web app manifest. To change the manifest, use core's `Theme` extender in your extension's or forum's `extend.php`:

```php
use Flarum\Extend;

return [
    (new Extend\Theme())
        ->manifest(function (array $manifest): array {
            $manifest['categories'] = ['social'];
            return $manifest;
        }),
];
```

`FoF\PWA\Extend\Manifest::modify()` still works, but is deprecated in favour of `Extend\Theme::manifest()`.

## Credit

- [Billy Wilcosky](https://discuss.flarum.org/d/21487-pwa-progressive-web-app) – for starting PWA support for Flarum.
- [Alexander Skvortsov](https://discuss.flarum.org/d/23219-progressive-web-app-pwa-and-push-notifications) – for reviving and expanding the extension with push notification support.
- [FriendsOfFlarum](https://github.com/FriendsOfFlarum) – current maintainers.

## Links

- [GitHub](https://github.com/FriendsOfFlarum/pwa)
- [Packagist](https://packagist.org/packages/fof/pwa)
