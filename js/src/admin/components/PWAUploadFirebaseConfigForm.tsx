import app from 'flarum/admin/app';
import Component, { ComponentAttrs } from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import type { Children } from 'mithril';

export default class PWAUploadFirebaseConfigForm extends Component<ComponentAttrs> {
  loading = false;

  view(): Children {
    return (
      <div className="Form-group">
        <Button className="Button" loading={this.loading} onclick={(e: MouseEvent) => this.pickFile(e)}>
          {app.translator.trans('fof-pwa.admin.pwa.firebase_config.upload_file')}
        </Button>
        <input type="file" accept=".json" hidden onchange={(e: Event) => this.updateFirebaseConfig(e)} />
      </div>
    );
  }

  pickFile(event: MouseEvent): void {
    ((event.currentTarget as HTMLElement).nextElementSibling as HTMLInputElement).click();
  }

  updateFirebaseConfig(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const body = new FormData();
    body.append('file', file);
    this.loading = true;

    app
      .request({
        method: 'POST',
        url: `${app.forum.attribute<string>('apiUrl')}/pwa/firebase-config`,
        body,
      })
      .then(() => {
        app.alerts.show({ type: 'success' }, app.translator.trans('fof-pwa.admin.pwa.firebase_config.upload_successful'));
      })
      .catch(() => {})
      .finally(() => {
        // So picking the same file again uploads it again.
        input.value = '';
        this.loading = false;
        m.redraw();
      });
  }
}
