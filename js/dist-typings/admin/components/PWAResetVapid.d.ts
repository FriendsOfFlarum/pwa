import Component, { type ComponentAttrs } from 'flarum/common/Component';
import type { Children } from 'mithril';
export interface IPWAResetVapidAttrs extends ComponentAttrs {
}
export default class PWAResetVapid<CustomAttrs extends IPWAResetVapidAttrs = IPWAResetVapidAttrs> extends Component<CustomAttrs> {
    view(): Children;
    reset(): void;
}
