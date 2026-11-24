import app from 'flarum/admin/app';
import Component, { type ComponentAttrs } from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import extractText from 'flarum/common/utils/extractText';
import type { Children } from 'mithril';
import { resetVapidKeys, vapidResetPending } from '../utils/vapidReset';

export interface IPWAResetVapidAttrs extends ComponentAttrs {}

export default class PWAResetVapid<CustomAttrs extends IPWAResetVapidAttrs = IPWAResetVapidAttrs> extends Component<CustomAttrs> {
  view(): Children {
    return (
      <div className="Form-group">
        <Button className="Button" loading={!!vapidResetPending()} onclick={this.reset.bind(this)}>
          {app.translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_button')}
        </Button>
        <div className="helpText">{app.translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_text')}</div>
      </div>
    );
  }

  reset(): void {
    if (vapidResetPending() || !confirm(extractText(app.translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_confirm')))) return;

    resetVapidKeys()
      .then((count) => {
        app.alerts.show({ type: 'success' }, app.translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_success', { count }));
      })
      .catch(() => {})
      .finally(() => m.redraw());
  }
}
