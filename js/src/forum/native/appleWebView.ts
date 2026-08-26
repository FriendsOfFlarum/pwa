export const PUSH_TOKEN = 'push-token';
export const PUSH_PERMISSION_REQUEST = 'push-permission-request';
export const PUSH_PERMISSION_STATE = 'push-permission-state';

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

export const usingAppleWebview = (): boolean => Boolean(window.webkit?.messageHandlers);

export function requestPushPermissionState(): void {
  window.webkit?.messageHandlers[PUSH_PERMISSION_STATE]?.postMessage(PUSH_PERMISSION_STATE);
}

export function requestPushPermissions(): void {
  window.webkit?.messageHandlers[PUSH_PERMISSION_REQUEST]?.postMessage(PUSH_PERMISSION_REQUEST);
}

export function requestPushToken(): void {
  window.webkit?.messageHandlers[PUSH_TOKEN]?.postMessage(PUSH_TOKEN);
}
