# Flarum Progressive Web App

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/fof/flarum-pwa.svg)](https://packagist.org/packages/fof/flarum-pwa)

A [Flarum](http://flarum.org) extension. Progressive Web App support for Flarum. Configure a progressive web app for your flarum installation, all from your admin dashboard! Also now supports push notifications!

Please see resources like <https://medium.com/pynk/what-is-a-pwa-and-how-to-install-add-to-home-screen-progressive-web-apps-e6e8087d9ad0> for more information on how to install this.

### Credit

Thank you to Billy Wilcosky (https://github.com/zerosonesfun) for starting PWA support for Flarum. This extension uses his original ServiceWorker and offline html page code.

His original Discuss thread has been linked here: <https://discuss.flarum.org/d/21487-pwa-progressive-web-app>

## TODO

- Verify Support for subdirectory installations
- Caching and expanded offline support
- Support configuration of ALL webmanifest attributes, especially:
  - Related Applications
  - Categories
  - Language
- Bugfixes and minor improvements

### Installation

```sh
composer require fof/pwa
```

### Updating

```sh
composer update fof/pwa
```

### Links

- [Github](https://github.com/FriendsOfFlarum/pwa)
- [Packagist](https://packagist.org/packages/fof/pwa)
