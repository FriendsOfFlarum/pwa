import type { ServiceWorkerWithPush } from './types';
declare global {
    interface Window {
        Notification: NotificationConstructor;
    }
    interface NotificationConstructor {
        permission: NotificationPermission;
        requestPermission(): Promise<NotificationPermission>;
        requestPermission(callback: (permission: NotificationPermission) => void): void;
    }
}
export declare const refreshSubscription: (sw: ServiceWorkerWithPush) => Promise<void>;
export default function addPushNotifications(): void;
