import type { Children } from 'mithril';
export interface ShareData {
    title: string | Children;
    url: string;
}
export default function addShareControls(): void;
