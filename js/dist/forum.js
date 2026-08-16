/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	var __webpack_modules__ = ({

/***/ "./src/forum/addPushNotifications.tsx"
/*!********************************************!*\
  !*** ./src/forum/addPushNotifications.tsx ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ addPushNotifications),
/* harmony export */   refreshSubscription: () => (/* binding */ refreshSubscription)
/* harmony export */ });
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/common/components/Alert */ "flarum/common/components/Alert");
/* harmony import */ var flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/common/components/Button */ "flarum/common/components/Button");
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/components/Link */ "flarum/common/components/Link");
/* harmony import */ var flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var flarum_common_components_Page__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! flarum/common/components/Page */ "flarum/common/components/Page");
/* harmony import */ var flarum_common_components_Page__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Page__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var flarum_common_components_Icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! flarum/common/components/Icon */ "flarum/common/components/Icon");
/* harmony import */ var flarum_common_components_Icon__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Icon__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _use_pwa_builder__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./use-pwa-builder */ "./src/forum/use-pwa-builder.ts");








const subscribeUser = async save => {
  if (!(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().sw)?.pushManager) return;
  const subscription = await flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('vapidPublicKey')
  });
  if (!save) return;
  await flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().request({
    method: 'POST',
    url: flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('apiUrl') + '/push_subscriptions',
    body: {
      data: {
        attributes: subscription
      }
    }
  });
};
const pushEnabled = () => {
  if (!(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session).user) return false;
  const preferences = flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session.user.preferences();
  for (const key in preferences) {
    if (typeof key === 'string' && key.startsWith('notify_') && key.endsWith('_push') && preferences[key]) {
      return true;
    }
  }
  return false;
};
const supportsBrowserNotifications = () => 'Notification' in window;
const refreshSubscription = async sw => {
  if ((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().cache).pwaRefreshed || !supportsBrowserNotifications() || window.Notification.permission !== 'granted' || !pushEnabled()) {
    (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().cache).pwaRefreshed = true;
    return;
  }
  try {
    await subscribeUser(true);
  } catch (e) {
    if (!sw.pushManager) {
      return;
    }
    const subscription = await sw.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await subscribeUser(true);
    }
  }
  ;(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().cache).pwaRefreshed = true;
};
const pushConfigured = () => {
  return !!flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('vapidPublicKey');
};
const {
  registerFirebasePushNotificationListeners,
  removeFirebasePushNotificationListeners,
  hasFirebasePushState
} = (0,_use_pwa_builder__WEBPACK_IMPORTED_MODULE_7__.usePWABuilder)();
function addPushNotifications() {
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)((flarum_common_components_Page__WEBPACK_IMPORTED_MODULE_5___default().prototype), 'oncreate', () => {
    if (!pushConfigured()) return;
    const dismissAlert = () => {
      localStorage.setItem('fof-pwa.notif-alert.dismissed', JSON.stringify({
        timestamp: new Date().getTime()
      }));
    };
    flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().alerts.dismiss((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().cache).pwaNotifsAlert);
    if (!localStorage.getItem('fof-pwa.notif-alert.dismissed') && supportsBrowserNotifications() && window.Notification.permission === 'default' && pushEnabled()) {
      (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().cache).pwaNotifsAlert = flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().alerts.show({
        controls: [m((flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_4___default()), {
          className: "Button Button--link",
          href: flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().route('settings'),
          onclick: dismissAlert
        }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.alerts.optin_button'))],
        // @ts-ignore - `ondismiss` is not working here because of bug in Flarum core
        onremove: dismissAlert
      }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.alerts.optin'));
    }
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)('flarum/forum/components/NotificationGrid', 'notificationMethods', function (items) {
    if (!pushConfigured()) return;
    items.add('push', {
      name: 'push',
      icon: 'fas fa-mobile',
      label: flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.push_header')
    });
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)('flarum/forum/components/SettingsPage', 'notificationsItems', function (items) {
    if ((0,_use_pwa_builder__WEBPACK_IMPORTED_MODULE_7__.usingAppleWebview)() || !pushConfigured()) return;
    if (!supportsBrowserNotifications()) {
      items.add('push-no-browser-support', m((flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2___default()), {
        dismissible: false,
        controls: [m("a", {
          className: "Button Button--link",
          href: "https://developer.mozilla.org/en-US/docs/Web/API/Push_API",
          target: "_blank",
          rel: "noopener noreferrer"
        }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.pwa_notifications.no_browser_support_button'))]
      }, m((flarum_common_components_Icon__WEBPACK_IMPORTED_MODULE_6___default()), {
        name: "fas fa-exclamation-triangle"
      }), flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.pwa_notifications.no_browser_support')), 10);
      return;
    }
    if (window.Notification.permission === 'default') {
      items.add('push-optin-default', m((flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2___default()), {
        dismissible: false,
        className: "pwa-setting-alert",
        controls: [m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3___default()), {
          className: "Button Button--link",
          onclick: () => {
            const requestPermission = window.Notification.requestPermission();
            if (requestPermission instanceof Promise) {
              requestPermission.then(res => {
                m.redraw();
                if (res === 'granted') {
                  subscribeUser(true);
                }
              });
            } else {
              // Legacy callback API
              window.Notification.requestPermission(res => {
                m.redraw();
                if (res === 'granted') {
                  subscribeUser(true);
                }
              });
            }
          }
        }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default_button'))]
      }, m((flarum_common_components_Icon__WEBPACK_IMPORTED_MODULE_6___default()), {
        name: "fas fa-exclamation-circle"
      }), flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default')), 10);
    } else if (window.Notification.permission === 'denied') {
      items.add('push-optin-denied', m((flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2___default()), {
        type: "error",
        dismissible: false,
        className: "pwa-setting-alert",
        controls: [m("a", {
          className: "Button Button--link",
          href: "https://support.humblebundle.com/hc/en-US/articles/360008513933-Enabling-and-Disabling-Browser-Notifications-in-Various-Browsers",
          target: "_blank",
          rel: "noopener noreferrer"
        }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.pwa_notifications.access_denied_button'))]
      }, m((flarum_common_components_Icon__WEBPACK_IMPORTED_MODULE_6___default()), {
        name: "fas fa-exclamation-triangle"
      }), flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.pwa_notifications.access_denied')), 10);
    }
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)('flarum/forum/components/SettingsPage', 'notifi cationsItems', function (items) {
    if (!(0,_use_pwa_builder__WEBPACK_IMPORTED_MODULE_7__.usingAppleWebview)()) return;
    if (!hasFirebasePushState('authorized')) {
      items.add('firebase-push-optin-default', m((flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2___default()), {
        dismissible: false,
        className: "pwa-setting-alert",
        controls: [m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3___default()), {
          className: "Button Button--link",
          onclick: () => (0,_use_pwa_builder__WEBPACK_IMPORTED_MODULE_7__.requestPushPermissions)()
        }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default_button'))]
      }, m((flarum_common_components_Icon__WEBPACK_IMPORTED_MODULE_6___default()), {
        name: "fas fa-exclamation-circle"
      }), flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default')), 10);
    }
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)('flarum/forum/components/SettingsPage', 'oncreate', function () {
    registerFirebasePushNotificationListeners();
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)('flarum/forum/components/SettingsPage', 'onremove', function () {
    removeFirebasePushNotificationListeners();
  });
}

/***/ },

/***/ "./src/forum/addShareButtons.tsx"
/*!***************************************!*\
  !*** ./src/forum/addShareButtons.tsx ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ addShareButtons)
/* harmony export */ });
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/common/utils/extractText */ "flarum/common/utils/extractText");
/* harmony import */ var flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_forum_utils_DiscussionControls__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/forum/utils/DiscussionControls */ "flarum/forum/utils/DiscussionControls");
/* harmony import */ var flarum_forum_utils_DiscussionControls__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_utils_DiscussionControls__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_forum_utils_PostControls__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/forum/utils/PostControls */ "flarum/forum/utils/PostControls");
/* harmony import */ var flarum_forum_utils_PostControls__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_utils_PostControls__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var flarum_forum_utils_UserControls__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! flarum/forum/utils/UserControls */ "flarum/forum/utils/UserControls");
/* harmony import */ var flarum_forum_utils_UserControls__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_utils_UserControls__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! flarum/common/components/Button */ "flarum/common/components/Button");
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_6__);







async function shareContent(data) {
  try {
    const title = flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_2___default()(data.title);
    await navigator.share({
      title,
      url: data.url
    });
  } catch (err) {
    console.error('Share error:', err);
  }
}
function addShareButtons() {
  ;(0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)((flarum_forum_utils_DiscussionControls__WEBPACK_IMPORTED_MODULE_3___default()), 'userControls', function (items, discussion) {
    if (!navigator.share) return;
    items.add('share', m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_6___default()), {
      icon: "fas fa-share-square",
      onclick: () => shareContent({
        title: discussion.title(),
        url: window.location.protocol + '//' + window.location.hostname + flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().route.discussion(discussion)
      })
    }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.discussion_controls.share_button')), -1);
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)((flarum_forum_utils_PostControls__WEBPACK_IMPORTED_MODULE_4___default()), 'userControls', function (items, post) {
    if (!navigator.share || !post.user() || !post.discussion()) return;
    items.add('share', m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_6___default()), {
      icon: "fas fa-share-square",
      onclick: () => shareContent({
        title: flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_2___default()(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.post_controls.share_api.title', {
          username: post.user().displayName(),
          title: post.discussion().title()
        })),
        url: window.location.protocol + '//' + window.location.hostname + flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().route.post(post)
      })
    }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.post_controls.share_button')), 100);
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)((flarum_forum_utils_UserControls__WEBPACK_IMPORTED_MODULE_5___default()), 'userControls', function (items, user) {
    if (!navigator.share || !user) return;
    items.add('share', m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_6___default()), {
      icon: "fas fa-share-square",
      onclick: () => shareContent({
        title: user.displayName(),
        url: window.location.protocol + '//' + window.location.hostname + flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().route.user(user)
      })
    }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.forum.user_controls.share_button')), 100);
  });
}

/***/ },

/***/ "./src/forum/index.tsx"
/*!*****************************!*\
  !*** ./src/forum/index.tsx ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var idb__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! idb */ "./node_modules/.pnpm/idb@8.0.3/node_modules/idb/build/index.js");
/* harmony import */ var flarum_common_components_Page__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/common/components/Page */ "flarum/common/components/Page");
/* harmony import */ var flarum_common_components_Page__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Page__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_common_components_LinkButton__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/components/LinkButton */ "flarum/common/components/LinkButton");
/* harmony import */ var flarum_common_components_LinkButton__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_LinkButton__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var flarum_forum_components_SessionDropdown__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! flarum/forum/components/SessionDropdown */ "flarum/forum/components/SessionDropdown");
/* harmony import */ var flarum_forum_components_SessionDropdown__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_SessionDropdown__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _addShareButtons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./addShareButtons */ "./src/forum/addShareButtons.tsx");
/* harmony import */ var _addPushNotifications__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./addPushNotifications */ "./src/forum/addPushNotifications.tsx");








flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().initializers.add('fof-pwa', () => {
  const isInStandaloneMode = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)((flarum_common_components_Page__WEBPACK_IMPORTED_MODULE_3___default().prototype), 'oninit', () => {
    const basePath = flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('basePath').replace(/\/$/, '');
    const registerSW = async () => {
      const dbPromise = (0,idb__WEBPACK_IMPORTED_MODULE_2__.openDB)('keyval-store', 1, {
        upgrade(db) {
          db.createObjectStore('keyval');
        }
      });
      const db = await dbPromise;
      await db.put('keyval', (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().forum).data.attributes, 'flarum.forumPayload');
      if ('serviceWorker' in navigator) {
        const sw = await navigator.serviceWorker.register(basePath + '/sw', {
          scope: basePath + '/'
        });
        await navigator.serviceWorker.ready;
        (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().sw) = sw;
        await (0,_addPushNotifications__WEBPACK_IMPORTED_MODULE_7__.refreshSubscription)((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().sw));
      }
    };
    registerSW();
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_1__.extend)((flarum_forum_components_SessionDropdown__WEBPACK_IMPORTED_MODULE_5___default().prototype), 'items', function (items) {
    if (isInStandaloneMode() && items.has('administration')) {
      items.setContent('administration', m((flarum_common_components_LinkButton__WEBPACK_IMPORTED_MODULE_4___default()), {
        icon: "fas fa-wrench",
        href: flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('adminUrl'),
        target: "_self",
        external: true
      }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('core.forum.header.admin_button')));
    }
  });
  (0,_addShareButtons__WEBPACK_IMPORTED_MODULE_6__["default"])();
  (0,_addPushNotifications__WEBPACK_IMPORTED_MODULE_7__["default"])();
});

/***/ },

/***/ "./src/forum/use-pwa-builder.ts"
/*!**************************************!*\
  !*** ./src/forum/use-pwa-builder.ts ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PushPermissionRequest: () => (/* binding */ PushPermissionRequest),
/* harmony export */   PushPermissionState: () => (/* binding */ PushPermissionState),
/* harmony export */   PushToken: () => (/* binding */ PushToken),
/* harmony export */   requestPushPermissionState: () => (/* binding */ requestPushPermissionState),
/* harmony export */   requestPushPermissions: () => (/* binding */ requestPushPermissions),
/* harmony export */   requestPushToken: () => (/* binding */ requestPushToken),
/* harmony export */   usePWABuilder: () => (/* binding */ usePWABuilder),
/* harmony export */   usingAppleWebview: () => (/* binding */ usingAppleWebview)
/* harmony export */ });
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__);


/**
 * Triggered when the push token is generated by the device.
 */
const PushToken = 'push-token';

/**
 * Triggered when the user requests permission on the push event.
 */
const PushPermissionRequest = 'push-permission-request';

/**
 * Returns the state of the push request of the device.
 */
const PushPermissionState = 'push-permission-state';
/**
 * Check if the client is a webview in an iOS or iPadOS device.
 */
const usingAppleWebview = () => !!(window.webkit && window.webkit.messageHandlers);
const requestPushPermissionState = () => {
  if (usingAppleWebview()) {
    window.webkit.messageHandlers[PushPermissionState].postMessage(PushPermissionState);
  }
};
const requestPushPermissions = () => {
  if (usingAppleWebview()) {
    window.webkit.messageHandlers[PushPermissionRequest].postMessage(PushPermissionRequest);
  }
};
const requestPushToken = () => {
  if (usingAppleWebview()) {
    window.webkit.messageHandlers[PushToken].postMessage(PushToken);
  }
};
const usePWABuilder = () => {
  let permissionState = 'granted';
  const handlePushPermissionRequest = event => {
    const customEvent = event;
    if (customEvent.detail !== 'granted') {
      return;
    }
    permissionState = 'granted';
    requestPushToken();
  };
  const handlePushToken = event => {
    const customEvent = event;
    flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().request({
      method: 'POST',
      url: flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('apiUrl') + '/pwa/firebase_push_subscriptions',
      body: {
        data: {
          attributes: {
            token: customEvent.detail
          }
        }
      }
    });
  };
  const handlePushPermissionState = event => {
    const customEvent = event;
    permissionState = customEvent.detail;
    m.redraw();
  };
  const hasFirebasePushState = state => state === permissionState;
  function registerFirebasePushNotificationListeners() {
    if (!usingAppleWebview()) {
      return;
    }
    requestPushPermissionState();
    window.addEventListener(PushPermissionRequest, handlePushPermissionRequest);
    window.addEventListener(PushPermissionState, handlePushPermissionState);
    window.addEventListener(PushToken, handlePushToken);
  }
  function removeFirebasePushNotificationListeners() {
    if (!usingAppleWebview()) {
      return;
    }
    window.removeEventListener(PushPermissionRequest, handlePushPermissionRequest);
    window.removeEventListener(PushPermissionState, handlePushPermissionState);
    window.removeEventListener(PushToken, handlePushToken);
  }
  return {
    hasFirebasePushState,
    registerFirebasePushNotificationListeners,
    removeFirebasePushNotificationListeners
  };
};

/***/ },

/***/ "flarum/common/components/Alert"
/*!********************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/components/Alert')" ***!
  \********************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/components/Alert');

/***/ },

/***/ "flarum/common/components/Button"
/*!*********************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/components/Button')" ***!
  \*********************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/components/Button');

/***/ },

/***/ "flarum/common/components/Icon"
/*!*******************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/components/Icon')" ***!
  \*******************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/components/Icon');

/***/ },

/***/ "flarum/common/components/Link"
/*!*******************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/components/Link')" ***!
  \*******************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/components/Link');

/***/ },

/***/ "flarum/common/components/LinkButton"
/*!*************************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/components/LinkButton')" ***!
  \*************************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/components/LinkButton');

/***/ },

/***/ "flarum/common/components/Page"
/*!*******************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/components/Page')" ***!
  \*******************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/components/Page');

/***/ },

/***/ "flarum/common/extend"
/*!**********************************************************!*\
  !*** external "flarum.reg.get('core', 'common/extend')" ***!
  \**********************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/extend');

/***/ },

/***/ "flarum/common/utils/extractText"
/*!*********************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/utils/extractText')" ***!
  \*********************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/utils/extractText');

/***/ },

/***/ "flarum/forum/app"
/*!******************************************************!*\
  !*** external "flarum.reg.get('core', 'forum/app')" ***!
  \******************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'forum/app');

/***/ },

/***/ "flarum/forum/components/SessionDropdown"
/*!*****************************************************************************!*\
  !*** external "flarum.reg.get('core', 'forum/components/SessionDropdown')" ***!
  \*****************************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'forum/components/SessionDropdown');

/***/ },

/***/ "flarum/forum/utils/DiscussionControls"
/*!***************************************************************************!*\
  !*** external "flarum.reg.get('core', 'forum/utils/DiscussionControls')" ***!
  \***************************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'forum/utils/DiscussionControls');

/***/ },

/***/ "flarum/forum/utils/PostControls"
/*!*********************************************************************!*\
  !*** external "flarum.reg.get('core', 'forum/utils/PostControls')" ***!
  \*********************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'forum/utils/PostControls');

/***/ },

/***/ "flarum/forum/utils/UserControls"
/*!*********************************************************************!*\
  !*** external "flarum.reg.get('core', 'forum/utils/UserControls')" ***!
  \*********************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'forum/utils/UserControls');

/***/ },

/***/ "./node_modules/.pnpm/idb@8.0.3/node_modules/idb/build/index.js"
/*!**********************************************************************!*\
  !*** ./node_modules/.pnpm/idb@8.0.3/node_modules/idb/build/index.js ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deleteDB: () => (/* binding */ deleteDB),
/* harmony export */   openDB: () => (/* binding */ openDB),
/* harmony export */   unwrap: () => (/* binding */ unwrap),
/* harmony export */   wrap: () => (/* binding */ wrap)
/* harmony export */ });
const instanceOfAny = (object, constructors) => constructors.some(c => object instanceof c);
let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction]);
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [IDBCursor.prototype.advance, IDBCursor.prototype.continue, IDBCursor.prototype.continuePrimaryKey]);
}
const transactionDoneMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
  const promise = new Promise((resolve, reject) => {
    const unlisten = () => {
      request.removeEventListener('success', success);
      request.removeEventListener('error', error);
    };
    const success = () => {
      resolve(wrap(request.result));
      unlisten();
    };
    const error = () => {
      reject(request.error);
      unlisten();
    };
    request.addEventListener('success', success);
    request.addEventListener('error', error);
  });
  // This mapping exists in reverseTransformCache but doesn't exist in transformCache. This
  // is because we create many promises from a single IDBRequest.
  reverseTransformCache.set(promise, request);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  // Early bail if we've already created a done promise for this transaction.
  if (transactionDoneMap.has(tx)) return;
  const done = new Promise((resolve, reject) => {
    const unlisten = () => {
      tx.removeEventListener('complete', complete);
      tx.removeEventListener('error', error);
      tx.removeEventListener('abort', error);
    };
    const complete = () => {
      resolve();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException('AbortError', 'AbortError'));
      unlisten();
    };
    tx.addEventListener('complete', complete);
    tx.addEventListener('error', error);
    tx.addEventListener('abort', error);
  });
  // Cache it for later retrieval.
  transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      // Special handling for transaction.done.
      if (prop === 'done') return transactionDoneMap.get(target);
      // Make tx.store return the only store in the transaction, or undefined if there are many.
      if (prop === 'store') {
        return receiver.objectStoreNames[1] ? undefined : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    // Else transform whatever we get back.
    return wrap(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === 'done' || prop === 'store')) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  // Due to expected object equality (which is enforced by the caching in `wrap`), we
  // only create one new func per func.
  // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
  // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
  // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
  // with real promises, so each advance methods returns a new promise for the cursor object, or
  // undefined if the end of the cursor has been reached.
  if (getCursorAdvanceMethods().includes(func)) {
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
      // the original object.
      func.apply(unwrap(this), args);
      return wrap(this.request);
    };
  }
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
    // the original object.
    return wrap(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === 'function') return wrapFunction(value);
  // This doesn't return, it just creates a 'done' promise for the transaction,
  // which is later returned for transaction.done (see idbObjectHandler).
  if (value instanceof IDBTransaction) cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes())) return new Proxy(value, idbProxyTraps);
  // Return the same value back if we're not going to transform it.
  return value;
}
function wrap(value) {
  // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
  // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
  if (value instanceof IDBRequest) return promisifyRequest(value);
  // If we've already transformed this value before, reuse the transformed value.
  // This is faster, but it also provides object equality.
  if (transformCache.has(value)) return transformCache.get(value);
  const newValue = transformCachableValue(value);
  // Not all types are transformed.
  // These may be primitive types, so they can't be WeakMap keys.
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
const unwrap = value => reverseTransformCache.get(value);

/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version, _temp) {
  let {
    blocked,
    upgrade,
    blocking,
    terminated
  } = _temp === void 0 ? {} : _temp;
  const request = indexedDB.open(name, version);
  const openPromise = wrap(request);
  if (upgrade) {
    request.addEventListener('upgradeneeded', event => {
      upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
    });
  }
  if (blocked) {
    request.addEventListener('blocked', event => blocked(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    event.oldVersion, event.newVersion, event));
  }
  openPromise.then(db => {
    if (terminated) db.addEventListener('close', () => terminated());
    if (blocking) {
      db.addEventListener('versionchange', event => blocking(event.oldVersion, event.newVersion, event));
    }
  }).catch(() => {});
  return openPromise;
}
/**
 * Delete a database.
 *
 * @param name Name of the database.
 */
function deleteDB(name, _temp2) {
  let {
    blocked
  } = _temp2 === void 0 ? {} : _temp2;
  const request = indexedDB.deleteDatabase(name);
  if (blocked) {
    request.addEventListener('blocked', event => blocked(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    event.oldVersion, event));
  }
  return wrap(request).then(() => undefined);
}
const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods = ['put', 'add', 'delete', 'clear'];
const cachedMethods = new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === 'string')) {
    return;
  }
  if (cachedMethods.get(prop)) return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, '');
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
  // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
  !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))) {
    return;
  }
  const method = async function (storeName) {
    // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
    const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
    let target = tx.store;
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    if (useIndex) target = target.index(args.shift());
    // Must reject if op rejects.
    // If it's a write operation, must reject if tx.done rejects.
    // Must reject with op rejection first.
    // Must resolve with op value.
    // Must handle both promises (no unhandled rejections)
    return (await Promise.all([target[targetFuncName](...args), isWrite && tx.done]))[0];
  };
  cachedMethods.set(prop, method);
  return method;
}
replaceTraps(oldTraps => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));
const advanceMethodProps = ['continue', 'continuePrimaryKey', 'advance'];
const methodMap = {};
const advanceResults = new WeakMap();
const ittrProxiedCursorToOriginalProxy = new WeakMap();
const cursorIteratorTraps = {
  get(target, prop) {
    if (!advanceMethodProps.includes(prop)) return target[prop];
    let cachedFunc = methodMap[prop];
    if (!cachedFunc) {
      cachedFunc = methodMap[prop] = function () {
        advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...arguments));
      };
    }
    return cachedFunc;
  }
};
async function* iterate() {
  // tslint:disable-next-line:no-this-assignment
  let cursor = this;
  if (!(cursor instanceof IDBCursor)) {
    cursor = await cursor.openCursor(...arguments);
  }
  if (!cursor) return;
  cursor = cursor;
  const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
  ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
  // Map this double-proxy back to the original, so other cursor methods work.
  reverseTransformCache.set(proxiedCursor, unwrap(cursor));
  while (cursor) {
    yield proxiedCursor;
    // If one of the advancing methods was not called, call continue().
    cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
    advanceResults.delete(proxiedCursor);
  }
}
function isIteratorProp(target, prop) {
  return prop === Symbol.asyncIterator && instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor]) || prop === 'iterate' && instanceOfAny(target, [IDBIndex, IDBObjectStore]);
}
replaceTraps(oldTraps => ({
  ...oldTraps,
  get(target, prop, receiver) {
    if (isIteratorProp(target, prop)) return iterate;
    return oldTraps.get(target, prop, receiver);
  },
  has(target, prop) {
    return isIteratorProp(target, prop) || oldTraps.has(target, prop);
  }
}));


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		flarum.reg._webpack_runtimes["fof-pwa"] ||= __webpack_require__;// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			const getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./forum.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_forum__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/forum */ "./src/forum/index.tsx");

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=forum.js.map