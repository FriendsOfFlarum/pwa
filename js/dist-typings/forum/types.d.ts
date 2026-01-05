export interface ServiceWorkerWithPush extends ServiceWorkerRegistration {
    pushManager: PushManager;
}
