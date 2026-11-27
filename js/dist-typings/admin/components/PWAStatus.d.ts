import Component, { type ComponentAttrs } from 'flarum/common/Component';
import type { Children, Vnode } from 'mithril';
interface StatusMessage {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}
export interface IPWAStatusAttrs extends ComponentAttrs {
}
export default class PWAStatus<CustomAttrs extends IPWAStatusAttrs = IPWAStatusAttrs> extends Component<CustomAttrs> {
    loading: boolean;
    failed: boolean;
    messages: StatusMessage[];
    oninit(vnode: Vnode<CustomAttrs, this>): void;
    view(): Children;
    refresh(): void;
}
export {};
