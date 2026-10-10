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

## For Developers

### Extending the manifest

Customize the manifest in your extension's or forum's `extend.php`:

```php
use FoF\PWA\Extend as PwaExtend;

return [
    (new PwaExtend\Manifest())
        ->modify(function (array $manifest): array {
            $manifest['categories'] = ['social'];
            return $manifest;
        }),
];
```

Callbacks receive the completed manifest and must return the modified array.
They run in registration order and also apply to the admin preview.
`modify()` also accepts an invokable class with constructor dependency injection.

## Credit

- [Billy Wilcosky](https://discuss.flarum.org/d/21487-pwa-progressive-web-app) – for starting PWA support for Flarum.
- [Alexander Skvortsov](https://discuss.flarum.org/d/23219-progressive-web-app-pwa-and-push-notifications) – for reviving and expanding the extension with push notification support.
- [FriendsOfFlarum](https://github.com/FriendsOfFlarum) – current maintainers.

## Links

- [GitHub](https://github.com/FriendsOfFlarum/pwa)
- [Packagist](https://packagist.org/packages/fof/pwa)
