import Component, { ComponentAttrs } from 'flarum/common/Component';
import type { Children } from 'mithril';
export default class PWAUploadFirebaseConfigForm extends Component<ComponentAttrs> {
    loading: boolean;
    view(): Children;
    pickFile(event: MouseEvent): void;
    updateFirebaseConfig(event: Event): void;
}
