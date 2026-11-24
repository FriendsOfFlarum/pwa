import app from 'flarum/admin/app';
import Component, { type ComponentAttrs } from 'flarum/common/Component';
import Alert from 'flarum/common/components/Alert';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import type { Children, Vnode } from 'mithril';
import { vapidResetPending } from '../utils/vapidReset';

interface StatusMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface PWASettingsResponse {
  status_messages: StatusMessage[];
}

export interface IPWAStatusAttrs extends ComponentAttrs {}

export default class PWAStatus<CustomAttrs extends IPWAStatusAttrs = IPWAStatusAttrs> extends Component<CustomAttrs> {
  loading = true;
  failed = false;
  messages: StatusMessage[] = [];

  oninit(vnode: Vnode<CustomAttrs, this>) {
    super.oninit(vnode);

    this.refresh();
  }

  view(): Children {
    if (this.loading) {
      return (
        <div className="Form-group PWAStatus">
          <LoadingIndicator display="inline" />
        </div>
      );
    }

    return (
      <div className="Form-group PWAStatus">
        {this.failed ? (
          <Alert type="error" dismissible={false}>
            {app.translator.trans('fof-pwa.admin.status.check_failed')}
          </Alert>
        ) : (
          this.messages.map((message) => (
            <Alert key={message.message} type={message.type} dismissible={false}>
              {message.message}
            </Alert>
          ))
        )}
      </div>
    );
  }

  refresh(): void {
    this.loading = true;
    this.failed = false;

    // Checked after a reset in progress, so the keys it makes are seen.
    Promise.resolve(vapidResetPending())
      .catch(() => {})
      .then(() =>
        app.request<PWASettingsResponse>({
          method: 'GET',
          url: app.forum.attribute<string>('apiUrl') + '/pwa/settings',
        })
      )
      .then((response) => {
        this.messages = response.status_messages;
      })
      .catch(() => {
        this.failed = true;
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }
}
