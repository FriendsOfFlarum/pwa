import app from 'flarum/admin/app';
import UploadImageButton from 'flarum/admin/components/UploadImageButton';
import Button from 'flarum/common/components/Button';
import classList from 'flarum/common/utils/classList';
import type Mithril from 'mithril';

export interface PWALogoUploadButtonAttrs {
  size: number;
  name?: string;
}

export default class PWALogoUploadButton extends UploadImageButton {
  get size(): number {
    return (this.attrs as PWALogoUploadButtonAttrs).size;
  }

  get name(): string {
    return `pwa-icon-${this.size}x${this.size}`;
  }

  oninit(vnode: Mithril.Vnode<PWALogoUploadButtonAttrs>) {
    super.oninit(vnode);
  }

  upload() {
    if (this.loading) return;

    const $input = $('<input type="file">');

    $input
      .appendTo('body')
      .hide()
      .trigger('click')
      .on('change', (e) => {
        const body = new FormData();
        body.append(this.name, ($(e.target) as JQuery<HTMLInputElement>)[0].files![0]);

        this.loading = true;
        m.redraw();

        app
          .request({
            method: 'POST',
            url: this.resourceUrl(),
            serialize: (raw: any) => raw,
            body,
          })
          .then(
            () => this.success({}),
            () => this.failure({})
          );
      });
  }

  view() {
    const attrs = this.attrs as any;
    attrs.loading = this.loading;
    attrs.className = classList(attrs.className, 'Button');

    const settingKey = `fof-pwa.icon_${this.size}_path`;
    const hasImage = app.data.settings[settingKey];

    if (hasImage) {
      attrs.onclick = this.remove.bind(this);

      return (
        <div>
          <p>
            <img src={app.forum.attribute(`pwa-icon-${this.size}x${this.size}Url`)} alt="" />
          </p>
          <p>
            <Button {...attrs}>{app.translator.trans('core.admin.upload_image.remove_button')}</Button>
          </p>
        </div>
      );
    }

    attrs.onclick = this.upload.bind(this);

    return <Button {...attrs}>{app.translator.trans('core.admin.upload_image.upload_button')}</Button>;
  }

  resourceUrl(): string {
    return app.forum.attribute<string>('apiUrl') + '/pwa/logo/' + this.size;
  }
}
