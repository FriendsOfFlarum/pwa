import app from 'flarum/admin/app';
import Component, { ComponentAttrs } from 'flarum/common/Component';
import type { Children } from 'mithril';
import FieldSet from 'flarum/common/components/FieldSet';

export default class PWAUploadFirebaseConfigForm extends Component<ComponentAttrs> {
  view(): Children {
    return (
      <form onsubmit={(e: SubmitEvent) => this.updateFirebaseConfig(e)}>
        <FieldSet
          label={app.translator.trans('fof-pwa.admin.pwa.firebase_config.heading')}
          description={app.translator.trans('fof-pwa.admin.pwa.firebase_config.help_text', {
            a: <a href="https://docs.pwabuilder.com/#/builder/app-store?id=push-notifications" target="_blank" rel="noopener noreferrer" />,
          })}
        >
          <label className="Button">
            {app.translator.trans('fof-pwa.admin.pwa.firebase_config.upload_file')}
            <input type="file" accept=".json" hidden onchange={(e: Event) => this.updateFirebaseConfig(e)} />
          </label>
        </FieldSet>
      </form>
    );
  }

  updateFirebaseConfig(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const body = new FormData();
    body.append('file', file);

    app
      .request({
        method: 'POST',
        url: `${app.forum.attribute<string>('apiUrl')}/pwa/firebase-config`,
        body,
      })
      .then(() => {
        app.alerts.show({ type: 'success' }, app.translator.trans('fof-pwa.admin.pwa.firebase_config.upload_successful'));
        input.value = '';
      });
  }
}
