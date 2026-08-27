import type { Vnode, Children } from 'mithril';
import Page, { IPageAttrs } from 'flarum/common/components/Page';
export default class NotificationsHelpPage extends Page {
    oncreate(vnode: Vnode<IPageAttrs, this>): void;
    view(vnode: Vnode<IPageAttrs, this>): Children;
    hero(): Children;
}
