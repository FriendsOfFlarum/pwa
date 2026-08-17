import Component, { ComponentAttrs } from 'flarum/common/Component';
import type { Children } from 'mithril';
export default class PWAUploadFirebaseConfigForm extends Component<ComponentAttrs> {
    view(): Children;
    updateFirebaseConfig(event: Event): void;
}
