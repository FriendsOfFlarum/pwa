import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';
import Link from 'flarum/common/components/Link';
import PWAStatus from './components/PWAStatus';
import PWAResetVapid from './components/PWAResetVapid';
import PWAUploadFirebaseConfigForm from './components/PWAUploadFirebaseConfigForm';

export default [
  new Extend.Admin()
    .tab(() => ({ id: 'app', label: app.translator.trans('fof-pwa.admin.tabs.app'), icon: 'fas fa-mobile-alt' }), 20)
    .tab(() => ({ id: 'push', label: app.translator.trans('fof-pwa.admin.tabs.push'), icon: 'fas fa-bell' }), 10)
    .section(
      () => ({
        id: 'status',
        tab: 'app',
        icon: 'fas fa-heartbeat',
        label: app.translator.trans('fof-pwa.admin.sections.status.label'),
        description: app.translator.trans('fof-pwa.admin.sections.status.description'),
      }),
      30
    )
    .section(
      () => ({
        id: 'home-screen',
        tab: 'app',
        icon: 'fas fa-mobile-alt',
        label: app.translator.trans('fof-pwa.admin.sections.home_screen.label'),
        description: app.translator.trans('fof-pwa.admin.sections.home_screen.description', {
          appearance: <Link href={app.route('appearance')} />,
          basics: <Link href={app.route('basics')} />,
        }),
      }),
      20
    )
    .section(
      () => ({
        id: 'sharing',
        tab: 'app',
        icon: 'fas fa-share-alt',
        label: app.translator.trans('fof-pwa.admin.sections.sharing.label'),
      }),
      10
    )
    .section(
      () => ({
        id: 'delivery',
        tab: 'push',
        icon: 'fas fa-paper-plane',
        label: app.translator.trans('fof-pwa.admin.sections.delivery.label'),
      }),
      40
    )
    .section(
      () => ({
        id: 'keys',
        tab: 'push',
        icon: 'fas fa-key',
        label: app.translator.trans('fof-pwa.admin.sections.keys.label'),
      }),
      30
    )
    .section(
      () => ({
        id: 'firebase',
        tab: 'push',
        icon: 'fab fa-apple',
        label: app.translator.trans('fof-pwa.admin.pwa.firebase_config.heading'),
        description: app.translator.trans('fof-pwa.admin.pwa.firebase_config.help_text', {
          a: <a href="https://docs.pwabuilder.com/#/builder/app-store?id=push-notifications" target="_blank" rel="noopener noreferrer" />,
        }),
      }),
      20
    )
    .section(
      () => ({
        id: 'troubleshooting',
        tab: 'push',
        icon: 'fas fa-bug',
        label: app.translator.trans('fof-pwa.admin.sections.troubleshooting.label'),
      }),
      10
    )
    .customSetting(() => <PWAStatus />, 0, 'status')
    .setting(() => ({
      setting: 'fof-pwa.orientation',
      section: 'home-screen',
      label: app.translator.trans('fof-pwa.admin.pwa.other.orientation_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.orientation_text'),
      type: 'select',
      options: {
        any: app.translator.trans('fof-pwa.admin.pwa.other.orientation_options.any'),
        natural: app.translator.trans('fof-pwa.admin.pwa.other.orientation_options.natural'),
        portrait: app.translator.trans('fof-pwa.admin.pwa.other.orientation_options.portrait'),
        'portrait-primary': app.translator.trans('fof-pwa.admin.pwa.other.orientation_options.portrait_primary'),
        'portrait-secondary': app.translator.trans('fof-pwa.admin.pwa.other.orientation_options.portrait_secondary'),
        landscape: app.translator.trans('fof-pwa.admin.pwa.other.orientation_options.landscape'),
        'landscape-primary': app.translator.trans('fof-pwa.admin.pwa.other.orientation_options.landscape_primary'),
        'landscape-secondary': app.translator.trans('fof-pwa.admin.pwa.other.orientation_options.landscape_secondary'),
      },
    }))
    .setting(() => ({
      setting: 'fof-pwa.windowControlsOverlay',
      section: 'home-screen',
      label: app.translator.trans('fof-pwa.admin.pwa.other.window_controls_overlay_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.window_controls_overlay_text', {
        compatibilitylink: <a href="https://caniuse.com/mdn-api_windowcontrolsoverlay" target="_blank" rel="noopener noreferrer" />,
        learnlink: (
          <a
            href="https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/window-controls-overlay"
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
      }),
      type: 'bool',
    }))
    .setting(() => ({
      setting: 'fof-pwa.pushNotifPreferenceDefaultToEmail',
      section: 'delivery',
      label: app.translator.trans('fof-pwa.admin.pwa.other.push_notif_preference_default_to_email_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.push_notif_preference_default_to_email_text'),
      type: 'boolean',
    }))
    .setting(() => ({
      setting: 'fof-pwa.userMaxSubscriptions',
      section: 'delivery',
      label: app.translator.trans('fof-pwa.admin.pwa.other.user_max_subscriptions_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.user_max_subscriptions_text'),
      type: 'number',
      placeholder: 20,
      min: 1,
    }))
    .setting(() => ({
      setting: 'fof-pwa.pushNotificationTtl',
      section: 'delivery',
      label: app.translator.trans('fof-pwa.admin.pwa.other.push_notification_ttl_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.push_notification_ttl_text'),
      type: 'number',
      placeholder: 86400,
      min: 1,
    }))
    .setting(() => ({
      setting: 'fof-pwa.shareButtons',
      section: 'sharing',
      label: app.translator.trans('fof-pwa.admin.pwa.other.share_buttons_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.share_buttons_text'),
      type: 'boolean',
    }))
    .customSetting(() => <PWAResetVapid />, 0, 'keys')
    .customSetting(() => <PWAUploadFirebaseConfigForm />, 0, 'firebase')
    .setting(() => ({
      setting: 'fof-pwa.debug',
      section: 'troubleshooting',
      label: app.translator.trans('fof-pwa.admin.pwa.maintenance.debug_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.maintenance.debug_text'),
      type: 'boolean',
    })),
];
