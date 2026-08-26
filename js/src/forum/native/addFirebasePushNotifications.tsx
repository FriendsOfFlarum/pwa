import app from 'flarum/forum/app';
import Alert from 'flarum/common/components/Alert';
import Button from 'flarum/common/components/Button';
import Icon from 'flarum/common/components/Icon';
import { extend } from 'flarum/common/extend';
import ItemList from 'flarum/common/utils/ItemList';
import { type Children } from 'mithril';
import {
  PUSH_PERMISSION_REQUEST,
  PUSH_PERMISSION_STATE,
  PUSH_TOKEN,
  requestPushPermissions,
  requestPushPermissionState,
  requestPushToken,
  usingAppleWebview,
} from './appleWebView';

type PushPermissionState = 'notDetermined' | 'denied' | 'authorized' | 'ephemeral' | 'provisional' | 'unknown' | 'granted';

const AUTHORIZED_STATES: PushPermissionState[] = ['authorized', 'ephemeral', 'provisional', 'granted'];

let permissionState: PushPermissionState | undefined;
let listenersRegistered = false;

function isAuthorized(state: PushPermissionState): boolean {
  return AUTHORIZED_STATES.includes(state);
}

function handlePushPermissionRequest(event: Event): void {
  const state = (event as CustomEvent<PushPermissionState>).detail;

  permissionState = state;

  if (isAuthorized(state)) {
    requestPushToken();
  }

  m.redraw();
}

function handlePushPermissionState(event: Event): void {
  const state = (event as CustomEvent<PushPermissionState>).detail;

  permissionState = state;

  if (isAuthorized(state)) {
    requestPushToken();
  }

  m.redraw();
}

function handlePushToken(event: Event): void {
  const token = (event as CustomEvent<string>).detail;

  void app
    .request({
      method: 'POST',
      url: `${app.forum.attribute<string>('apiUrl')}/pwa/firebase_push_subscriptions`,
      body: {
        data: {
          attributes: {
            token,
          },
        },
      },
    })
    .catch((error) => {
      console.error('[fof-pwa] Firebase push token sync failed:', error);
    });
}

function registerListeners(): void {
  if (!usingAppleWebview() || listenersRegistered) return;

  listenersRegistered = true;

  window.addEventListener(PUSH_PERMISSION_REQUEST, handlePushPermissionRequest);
  window.addEventListener(PUSH_PERMISSION_STATE, handlePushPermissionState);
  window.addEventListener(PUSH_TOKEN, handlePushToken);

  requestPushPermissionState();
}

function removeListeners(): void {
  if (!listenersRegistered) return;

  listenersRegistered = false;

  window.removeEventListener(PUSH_PERMISSION_REQUEST, handlePushPermissionRequest);
  window.removeEventListener(PUSH_PERMISSION_STATE, handlePushPermissionState);
  window.removeEventListener(PUSH_TOKEN, handlePushToken);
}

export default function addFirebasePushNotifications(): void {
  extend('flarum/forum/components/SettingsPage', 'notificationsItems', function (items: ItemList<Children>) {
    if (!usingAppleWebview() || permissionState === undefined || isAuthorized(permissionState)) return;

    items.add(
      'firebase-push-optin-default',
      <Alert
        dismissible={false}
        className="pwa-setting-alert"
        controls={[
          <Button className="Button Button--link" onclick={requestPushPermissions}>
            {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default_button')}
          </Button>,
        ]}
      >
        <Icon name="fas fa-exclamation-circle" />
        {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default')}
      </Alert>,
      10
    );
  });

  extend('flarum/forum/components/SettingsPage', 'oncreate', function () {
    registerListeners();
  });

  extend('flarum/forum/components/SettingsPage', 'onremove', function () {
    removeListeners();
  });
}
