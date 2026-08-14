import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import type Mithril from 'mithril';
interface StatusMessage {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}
interface PWAManifest {
    description?: string;
    [key: string]: any;
}
export default class PWAPage extends ExtensionPage {
    loading: boolean;
    saving: boolean;
    status_messages: StatusMessage[];
    manifest: PWAManifest;
    sizes: number[];
    oninit(vnode: Mithril.Vnode): void;
    refresh(): void;
    checkExistence(url: string): boolean;
    content(): JSX.Element;
    resetVapid(): void;
    saveSettings(e: SubmitEvent): Promise<void>;
}
export {};
