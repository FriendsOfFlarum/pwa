import Component, { ComponentAttrs } from 'flarum/common/Component';
import type Mithril from 'mithril';
export default class PWAUploadFirebaseConfigForm extends Component<ComponentAttrs> {
    view(): Mithril.Children;
    updateFirebaseConfig(event: Event): void;
}
