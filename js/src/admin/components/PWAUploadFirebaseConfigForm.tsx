import app from 'flarum/admin/app';
import Component, { ComponentAttrs } from 'flarum/common/Component';
import type Mithril from 'mithril';

export default class PWAUploadFirebaseConfigForm extends Component<ComponentAttrs> {
  view(): Mithril.Children {
    return (
      <form action="/pwa/firebase-config" method="POST" onsubmit={(e: SubmitEvent) => this.updateFirebaseConfig(e)}>
        <fieldset>
          <fieldset>
            <legend>{app.translator.trans('fof-pwa.admin.pwa.firebase_config.heading')}</legend>
            <div className="helpText">
              <span>{app.translator.trans('fof-pwa.admin.pwa.firebase_config.help_text')}</span>

              <a href="https://docs.pwabuilder.com/#/builder/app-store?id=push-notifications" target="_blank" rel="noopener noreferrer">
                {app.translator.trans('fof-pwa.admin.pwa.firebase_config.see_documentation_here')}
              </a>
            </div>

            <button
              type="button"
              className="Button"
              onclick={() => {
                const input = document.querySelector<HTMLInputElement>('#flarum-pwa-upload-button');
                input?.click();
              }}
            >
              {app.translator.trans('fof-pwa.admin.pwa.firebase_config.upload_file')}
            </button>

            <input id="flarum-pwa-upload-button" type="file" onchange={(e: Event) => this.updateFirebaseConfig(e)} style={{ opacity: 0 }} />
          </fieldset>
        </fieldset>
      </form>
    );
  }

  updateFirebaseConfig(event: Event): void {
    event.preventDefault();

    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    const body = new FormData();
    body.append('file', file);

    app
      .request({
        method: 'POST',
        url: app.forum.attribute<string>('apiUrl') + '/pwa/firebase-config',
        body: body,
      })
      .then(() => {
        app.alerts.show(
          {
            type: 'success',
          },
          app.translator.trans('fof-pwa.admin.pwa.firebase_config.upload_successful')
        );
      });
  }
}
