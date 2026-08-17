import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';
import PWAPage from './components/PWAPage';
import FormGroup from 'flarum/common/components/FormGroup';

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
      setting: 'fof-pwa.shortName',
      placeholder: app.forum.attribute<string>('title'),
      label: app.translator.trans('fof-pwa.admin.pwa.about.short_name_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.about.short_name_text'),
      type: 'text',
    }))
    .setting(() => ({
      setting: 'fof-pwa.longName',
      placeholder: app.forum.attribute<string>('title'),
      label: app.translator.trans('fof-pwa.admin.pwa.about.long_name_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.about.long_name_text'),
      type: 'text',
    }))
    .setting(() => () => (
      <FormGroup
        type="textarea"
        help={app.translator.trans('fof-pwa.admin.pwa.about.description_text')}
        placeholder={app.forum.attribute<string>('description')}
        disabled
      />
    ))
    .setting(() => ({
      setting: 'fof-pwa.themeColor',
      placeholder: app.forum.attribute<string>('themePrimaryColor'),
      default: app.forum.attribute<string>('themePrimaryColor'),
      label: app.translator.trans('fof-pwa.admin.pwa.colors.theme_color_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.colors.theme_color_text'),
      type: 'color-preview',
    }))
    .setting(() => ({
      setting: 'fof-pwa.backgroundColor',
      label: app.translator.trans('fof-pwa.admin.pwa.colors.background_color_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.colors.background_color_text'),
      type: 'color-preview',
    }))
    .setting(() => ({
      setting: 'fof-pwa.forcePortrait',
      label: app.translator.trans('fof-pwa.admin.pwa.other.force_portrait_text'),
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
      setting: 'fof-pwa.windowControlsOverlay',
      label: app.translator.trans('fof-pwa.admin.pwa.other.window_controls_overlay_label'),
      help: app.translator.trans('fof-pwa.admin.pwa.other.window_controls_overlay_text', {
        compatibilitylink: <a href="https://caniuse.com/mdn-api_windowcontrolsoverlay" tabindex="-1" />,
        learnlink: (
          <a href="https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/window-controls-overlay" tabindex="-1" />
        ),
      }),
      type: 'bool',
    })),
];
