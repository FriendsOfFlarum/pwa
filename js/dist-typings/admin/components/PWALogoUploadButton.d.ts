import UploadImageButton from 'flarum/admin/components/UploadImageButton';
import type Mithril from 'mithril';
export interface PWALogoUploadButtonAttrs {
    size: number;
    name?: string;
}
export default class PWALogoUploadButton extends UploadImageButton {
    get size(): number;
    get name(): string;
    oninit(vnode: Mithril.Vnode<PWALogoUploadButtonAttrs>): void;
    upload(): void;
    view(): JSX.Element;
    resourceUrl(): string;
}
