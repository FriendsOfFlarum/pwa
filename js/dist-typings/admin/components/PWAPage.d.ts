import ExtensionPage, { ExtensionPageAttrs } from 'flarum/admin/components/ExtensionPage';
import type { Children, Vnode, VnodeDOM } from 'mithril';
interface StatusMessage {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}
interface PWAManifest {
    description?: string;
    icons?: Array<{
        src: string;
        sizes: string;
        type: string;
    }>;
    [key: string]: any;
}
export default class PWAPage extends ExtensionPage {
    loadingApi: boolean;
    statusMessages: StatusMessage[];
    manifest: PWAManifest;
    sizes: number[];
    oninit(vnode: Vnode): void;
    refresh(): void;
    sections(vnode: VnodeDOM<ExtensionPageAttrs, this>): import("flarum/common/utils/ItemList").default<unknown>;
    introSection(): Children;
    maintenanceSection(): Children;
    logoSection(): Children;
    firebaseSection(): Children;
    resetVapid(): void;
}
export {};
