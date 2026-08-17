import app from 'flarum/admin/app';
import ExtensionPage, { ExtensionPageAttrs } from 'flarum/admin/components/ExtensionPage';
import Alert from 'flarum/common/components/Alert';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';

import PWALogoUploadButton from './PWALogoUploadButton';
import PWAUploadFirebaseConfigForm from './PWAUploadFirebaseConfigForm';

import type { Children, Vnode, VnodeDOM } from 'mithril';
import extractText from 'flarum/common/utils/extractText';
import FieldSet from 'flarum/common/components/FieldSet';
import Form from 'flarum/common/components/Form';

interface StatusMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface PWAManifest {
  description?: string;
  [key: string]: any;
}

interface PWASettingsResponse {
  manifest: PWAManifest;
  sizes: number[];
  status_messages: StatusMessage[];
}

export default class PWAPage extends ExtensionPage {
  loadingApi: boolean = false;
  statusMessages: StatusMessage[] = [];
  manifest: PWAManifest = {};
  sizes: number[] = [];

  oninit(vnode: Vnode) {
    super.oninit(vnode);
    this.refresh();
  }

  refresh(): void {
    this.loadingApi = true;
    this.statusMessages = [];
    this.manifest = {};
    this.sizes = [];

    app
      .request<PWASettingsResponse>({
        method: 'GET',
        url: app.forum.attribute<string>('apiUrl') + '/pwa/settings',
      })
      .then((response) => {
        this.manifest = response.manifest;
        this.sizes = response.sizes;
        this.statusMessages = response.status_messages;
        this.loadingApi = false;
        m.redraw();
      });
  }

  sections(vnode: VnodeDOM<ExtensionPageAttrs, this>) {
    const items = super.sections(vnode);

    items.add('intro', this.introSection(), 40);
    items.add('maintenance', this.maintenanceSection(), 30);
    items.setPriority('content', 20);
    items.add('logo', this.logoSection(), 20);
    items.add('firebase', this.firebaseSection(), 10);

    return items;
  }

  introSection(): Children {
    return (
      <div className="PWAPage-section PWAPage-intro container">
        <h2>{app.translator.trans('fof-pwa.admin.pwa.heading')}</h2>
        <div className="helpText">{app.translator.trans('fof-pwa.admin.pwa.text')}</div>
      </div>
    );
  }

  maintenanceSection(): Children {
    return (
      <FieldSet className="PWAPage-section PWAPage-maintenance container" label={app.translator.trans('fof-pwa.admin.pwa.maintenance.heading')}>
        <div className="statusCheck">
          {this.loadingApi ? (
            <LoadingIndicator />
          ) : (
            this.statusMessages.map((message) => (
              <Alert key={message.message} type={message.type} dismissible={false}>
                {message.message}
              </Alert>
            ))
          )}
        </div>

        <div className="Form-group">
          <Button className="Button" onclick={this.resetVapid}>
            {app.translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_button')}
          </Button>
          <div className="helpText">{app.translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_text')}</div>
        </div>
      </FieldSet>
    );
  }

  logoSection(): Children {
    if (this.loadingApi) return <LoadingIndicator />;

    return (
      <Form className="PWAPage-section PWAPage-logo container">
        <FieldSet label={app.translator.trans('fof-pwa.admin.pwa.logo_heading')} description={app.translator.trans('fof-pwa.admin.pwa.logo_text')}>
          {this.sizes.map((size) => (
            <FieldSet key={size} className="logoFieldset">
              <PWALogoUploadButton size={size} />
              <div className="helpText">
                {app.translator.trans('fof-pwa.admin.pwa.logo_size_text', {
                  size,
                })}
              </div>
            </FieldSet>
          ))}
        </FieldSet>
      </Form>
    );
  }

  firebaseSection(): Children {
    return (
      <div className="PWAPage-section PWAPage-firebase container">
        <PWAUploadFirebaseConfigForm />
      </div>
    );
  }

  resetVapid(): void {
    if (confirm(extractText(app.translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_confirm')))) {
      app
        .request<{ deleted: number }>({
          method: 'POST',
          url: app.forum.attribute<string>('apiUrl') + '/reset_vapid',
        })
        .then((response) => {
          app.alerts.show(
            {
              type: 'success',
            },
            app.translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_success', { count: response.deleted })
          );
        });
    }
  }
}
