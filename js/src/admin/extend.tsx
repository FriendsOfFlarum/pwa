import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';
import PWAPage from './components/PWAPage';

export default [
  new Extend.Admin()
    .page(PWAPage)
    .setting(() => ({
      setting: 'fof-pwa.debug',
      label: app.translator.trans('fof-pwa.admin.pwa.maintenance.debug_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.maintenance.debug_text'),
      type: 'boolean',
    }))
    .setting(() => ({
      setting: 'fof-pwa.orientation',
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
      label: app.translator.trans('fof-pwa.admin.pwa.other.push_notif_preference_default_to_email_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.push_notif_preference_default_to_email_text'),
      type: 'boolean',
    }))
    .setting(() => ({
      setting: 'fof-pwa.userMaxSubscriptions',
      label: app.translator.trans('fof-pwa.admin.pwa.other.user_max_subscriptions_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.user_max_subscriptions_text'),
      type: 'number',
      placeholder: 20,
      min: 1,
    }))
    .setting(() => ({
      setting: 'fof-pwa.pushNotificationTtl',
      label: app.translator.trans('fof-pwa.admin.pwa.other.push_notification_ttl_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.push_notification_ttl_text'),
      type: 'number',
      placeholder: 86400,
      min: 1,
    }))
    .setting(() => ({
      setting: 'fof-pwa.shareButtons',
      label: app.translator.trans('fof-pwa.admin.pwa.other.share_buttons_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.share_buttons_text'),
      type: 'boolean',
    })),
];
