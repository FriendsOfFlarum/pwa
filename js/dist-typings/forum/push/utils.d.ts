export declare const supportsWebPush: () => boolean;
/**
 * Flarum registers the forum's service worker, which runs fof/pwa's push
 * handlers after its own.
 */
export declare function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined>;
export declare const getVapidPublicKey: () => string;
export declare function getApplicationServerKey(subscription: PushSubscription): string | undefined;
export declare const pushConfigured: () => boolean;
export declare const hasEnabledPushPreference: () => boolean;
