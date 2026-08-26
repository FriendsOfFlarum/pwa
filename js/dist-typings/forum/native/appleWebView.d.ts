export declare const PUSH_TOKEN = "push-token";
export declare const PUSH_PERMISSION_REQUEST = "push-permission-request";
export declare const PUSH_PERMISSION_STATE = "push-permission-state";
interface WebKitMessageHandler {
    postMessage(message: string): void;
}
interface WebKit {
    messageHandlers: Partial<Record<typeof PUSH_TOKEN | typeof PUSH_PERMISSION_REQUEST | typeof PUSH_PERMISSION_STATE, WebKitMessageHandler>>;
}
declare global {
    interface Window {
        webkit?: WebKit;
    }
}
export declare const usingAppleWebview: () => boolean;
export declare function requestPushPermissionState(): void;
export declare function requestPushPermissions(): void;
export declare function requestPushToken(): void;
export {};
