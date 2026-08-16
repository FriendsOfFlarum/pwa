/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/components/PWALogoUploadButton.tsx"
/*!******************************************************!*\
  !*** ./src/admin/components/PWALogoUploadButton.tsx ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PWALogoUploadButton)
/* harmony export */ });
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/admin/app */ "flarum/admin/app");
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var flarum_common_components_UploadImageButton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/components/UploadImageButton */ "flarum/common/components/UploadImageButton");
/* harmony import */ var flarum_common_components_UploadImageButton__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_UploadImageButton__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/common/components/Button */ "flarum/common/components/Button");
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_common_utils_classList__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/common/utils/classList */ "flarum/common/utils/classList");
/* harmony import */ var flarum_common_utils_classList__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_common_utils_classList__WEBPACK_IMPORTED_MODULE_3__);




class PWALogoUploadButton extends (flarum_common_components_UploadImageButton__WEBPACK_IMPORTED_MODULE_1___default()) {
  get size() {
    return this.attrs.size;
  }
  get name() {
    return `pwa-icon-${this.size}x${this.size}`;
  }
  oninit(vnode) {
    super.oninit(vnode);
  }
  upload() {
    if (this.loading) return;
    const $input = $('<input type="file">');
    $input.appendTo('body').hide().trigger('click').on('change', e => {
      const body = new FormData();
      body.append(this.name, $(e.target)[0].files[0]);
      this.loading = true;
      m.redraw();
      flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().request({
        method: 'POST',
        url: this.resourceUrl(),
        body
      }).then(() => this.success({}), () => this.failure({}));
    });
  }
  view() {
    const attrs = this.attrs;
    attrs.loading = this.loading;
    attrs.className = flarum_common_utils_classList__WEBPACK_IMPORTED_MODULE_3___default()(attrs.className, 'Button');
    const settingKey = `fof-pwa.icon_${this.size}_path`;
    const hasImage = (flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().data).settings[settingKey];
    if (hasImage) {
      attrs.onclick = this.remove.bind(this);
      return m("div", null, m("p", null, m("img", {
        src: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute(`pwa-icon-${this.size}x${this.size}Url`),
        alt: ""
      })), m("p", null, m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_2___default()), attrs, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('core.admin.upload_image.remove_button'))));
    }
    attrs.onclick = this.upload.bind(this);
    return m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_2___default()), attrs, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('core.admin.upload_image.upload_button'));
  }
  resourceUrl() {
    return flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('apiUrl') + '/pwa/logo/' + this.size;
  }
}
flarum.reg.add('fof-pwa', 'admin/components/PWALogoUploadButton', PWALogoUploadButton);

/***/ },

/***/ "./src/admin/components/PWAPage.tsx"
/*!******************************************!*\
  !*** ./src/admin/components/PWAPage.tsx ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PWAPage)
/* harmony export */ });
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/admin/app */ "flarum/admin/app");
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var flarum_admin_components_ExtensionPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/admin/components/ExtensionPage */ "flarum/admin/components/ExtensionPage");
/* harmony import */ var flarum_admin_components_ExtensionPage__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_components_ExtensionPage__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/common/components/Alert */ "flarum/common/components/Alert");
/* harmony import */ var flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/common/components/Button */ "flarum/common/components/Button");
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_common_components_LoadingIndicator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/components/LoadingIndicator */ "flarum/common/components/LoadingIndicator");
/* harmony import */ var flarum_common_components_LoadingIndicator__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_LoadingIndicator__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _PWALogoUploadButton__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PWALogoUploadButton */ "./src/admin/components/PWALogoUploadButton.tsx");
/* harmony import */ var _PWAUploadFirebaseConfigForm__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./PWAUploadFirebaseConfigForm */ "./src/admin/components/PWAUploadFirebaseConfigForm.tsx");
/* harmony import */ var flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! flarum/common/utils/extractText */ "flarum/common/utils/extractText");
/* harmony import */ var flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_7__);








class PWAPage extends (flarum_admin_components_ExtensionPage__WEBPACK_IMPORTED_MODULE_1___default()) {
  loading = false;
  saving = false;
  status_messages = [];
  manifest = {};
  sizes = [];
  oninit(vnode) {
    super.oninit(vnode);
    this.saving = false;
    this.refresh();
  }
  refresh() {
    this.loading = true;
    this.status_messages = [];
    this.manifest = {};
    this.sizes = [];
    flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().request({
      method: 'GET',
      url: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('apiUrl') + '/pwa/settings'
    }).then(response => {
      this.manifest = response.manifest;
      this.sizes = response.sizes;
      this.status_messages = response.status_messages;
      this.loading = false;
      m.redraw();
    });
  }
  content() {
    if (this.loading || this.saving) {
      return m("div", {
        className: "PWAPage"
      }, m("div", {
        className: "container"
      }, m((flarum_common_components_LoadingIndicator__WEBPACK_IMPORTED_MODULE_4___default()), null)));
    }
    return m("div", {
      className: "PWAPage"
    }, m("div", {
      className: "container"
    }, m("form", null, m("h2", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.heading')), m("div", {
      className: "helpText"
    }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.text')), m("div", {
      className: "statusCheck"
    }, m("legend", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.status_check_heading')), this.status_messages.map(message => m((flarum_common_components_Alert__WEBPACK_IMPORTED_MODULE_2___default()), {
      type: message.type,
      dismissible: false
    }, [message.message]))), m("fieldset", {
      className: "parent"
    }, m("legend", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.maintenance.heading')), this.buildSettingComponent({
      setting: 'fof-pwa.debug',
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.maintenance.debug_label'),
      help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.maintenance.debug_text'),
      type: 'boolean'
    }), this.buildSettingComponent(() => {
      return m("div", null, m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3___default()), {
        className: "Button",
        onclick: this.resetVapid.bind(this)
      }, "Reset VAPID keys"), m("div", {
        className: "helpText"
      }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_text')));
    })), m("fieldset", {
      className: "parent"
    }, m("fieldset", null, m("legend", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.about.heading')), this.buildSettingComponent({
      setting: 'fof-pwa.shortName',
      placeholder: this.setting('forum_title')(),
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.about.short_name_label'),
      help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.about.short_name_text'),
      type: 'text'
    })), m("fieldset", null, this.buildSettingComponent({
      setting: 'fof-pwa.longName',
      placeholder: this.setting('forum_title')(),
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.about.long_name_label'),
      help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.about.long_name_text'),
      type: 'text'
    })), m("fieldset", null, m("div", {
      className: "helpText"
    }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.about.description_text')), m("textarea", {
      className: "FormControl",
      value: this.manifest.description,
      disabled: true
    }, this.manifest.description))), m("fieldset", {
      className: "parent"
    }, m("fieldset", null, m("legend", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.colors.heading')), this.buildSettingComponent({
      setting: 'fof-pwa.themeColor',
      placeholder: this.setting('theme_primary_color')(),
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.colors.theme_color_label'),
      help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.colors.theme_color_text'),
      type: 'color-preview'
    })), m("fieldset", null, this.buildSettingComponent({
      setting: 'fof-pwa.backgroundColor',
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.colors.background_color_label'),
      help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.colors.background_color_text'),
      type: 'color-preview'
    }))), m("fieldset", {
      className: "parent"
    }, m("fieldset", null, m("legend", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.other.heading')), this.buildSettingComponent({
      setting: 'fof-pwa.forcePortrait',
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.other.force_portrait_text'),
      type: 'boolean'
    })), m("fieldset", null, this.buildSettingComponent({
      setting: 'fof-pwa.userMaxSubscriptions',
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.other.user_max_subscriptions_label'),
      help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.other.user_max_subscriptions_text'),
      type: 'number',
      placeholder: 20
    })), m("fieldset", null, this.buildSettingComponent({
      setting: 'fof-pwa.pushNotifPreferenceDefaultToEmail',
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.other.push_notif_preference_default_to_email_label'),
      help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.other.push_notif_preference_default_to_email_text'),
      type: 'bool'
    })), m("fieldset", null, this.buildSettingComponent({
      setting: 'fof-pwa.windowControlsOverlay',
      label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.other.window_controls_overlay_label'),
      help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.other.window_controls_overlay_text', {
        compatibilitylink: m("a", {
          href: "https://caniuse.com/mdn-api_windowcontrolsoverlay",
          tabindex: "-1"
        }),
        learnlink: m("a", {
          href: "https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/window-controls-overlay",
          tabindex: "-1"
        })
      }),
      type: 'bool'
    }))), this.submitButton(), m("fieldset", null, m("legend", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.logo_heading')), m("div", {
      className: "helpText"
    }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.logo_text')), this.sizes.map(size => {
      return m("fieldset", {
        className: "logoFieldset"
      }, m(_PWALogoUploadButton__WEBPACK_IMPORTED_MODULE_5__["default"], {
        size: size
      }), m("div", {
        className: "helpText"
      }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.logo_size_text', {
        size
      })));
    }))), m(_PWAUploadFirebaseConfigForm__WEBPACK_IMPORTED_MODULE_6__["default"], null)));
  }
  resetVapid() {
    if (confirm(flarum_common_utils_extractText__WEBPACK_IMPORTED_MODULE_7___default()(flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_confirm')))) {
      flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().request({
        method: 'POST',
        url: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('apiUrl') + '/reset_vapid'
      }).then(response => {
        flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().alerts.show({
          type: 'success'
        }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.maintenance.reset_vapid_success', {
          count: response.deleted
        }));
      });
    }
  }
  saveSettings(e) {
    const hex = /^(#[0-9a-f]{3}([0-9a-f]{3})?)?$/i;
    if (!hex.test(this.setting('fof-pwa.backgroundColor')())) {
      alert(flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('core.admin.appearance.enter_hex_message'));
      return Promise.resolve();
    }
    return super.saveSettings(e);
  }
}
flarum.reg.add('fof-pwa', 'admin/components/PWAPage', PWAPage);

/***/ },

/***/ "./src/admin/components/PWAUploadFirebaseConfigForm.tsx"
/*!**************************************************************!*\
  !*** ./src/admin/components/PWAUploadFirebaseConfigForm.tsx ***!
  \**************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PWAUploadFirebaseConfigForm)
/* harmony export */ });
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/admin/app */ "flarum/admin/app");
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/Component */ "flarum/common/Component");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__);


class PWAUploadFirebaseConfigForm extends (flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default()) {
  view() {
    return m("form", {
      action: "/pwa/firebase-config",
      method: "POST",
      onsubmit: e => this.updateFirebaseConfig(e)
    }, m("fieldset", null, m("fieldset", null, m("legend", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.firebase_config.heading')), m("div", {
      className: "helpText"
    }, m("span", null, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.firebase_config.help_text')), m("a", {
      href: "https://docs.pwabuilder.com/#/builder/app-store?id=push-notifications",
      target: "_blank",
      rel: "noopener noreferrer"
    }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.firebase_config.see_documentation_here'))), m("button", {
      type: "button",
      className: "Button",
      onclick: () => {
        const input = document.querySelector('#flarum-pwa-upload-button');
        input?.click();
      }
    }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.firebase_config.upload_file')), m("input", {
      id: "flarum-pwa-upload-button",
      type: "file",
      onchange: e => this.updateFirebaseConfig(e),
      style: {
        opacity: 0
      }
    }))));
  }
  updateFirebaseConfig(event) {
    event.preventDefault();
    const target = event.target;
    const file = target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().request({
      method: 'POST',
      url: flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().forum.attribute('apiUrl') + '/pwa/firebase-config',
      body: body
    }).then(() => {
      flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().alerts.show({
        type: 'success'
      }, flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans('fof-pwa.admin.pwa.firebase_config.upload_successful'));
    });
  }
}
flarum.reg.add('fof-pwa', 'admin/components/PWAUploadFirebaseConfigForm', PWAUploadFirebaseConfigForm);

/***/ },

/***/ "./src/admin/extend.tsx"
/*!******************************!*\
  !*** ./src/admin/extend.tsx ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/common/extenders */ "flarum/common/extenders");
/* harmony import */ var flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_PWAPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/PWAPage */ "./src/admin/components/PWAPage.tsx");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([new (flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0___default().Admin)().page(_components_PWAPage__WEBPACK_IMPORTED_MODULE_1__["default"])]);

/***/ },

/***/ "./src/admin/index.ts"
/*!****************************!*\
  !*** ./src/admin/index.ts ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extend: () => (/* reexport safe */ _extend__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _extend__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./extend */ "./src/admin/extend.tsx");


/***/ },

/***/ "flarum/admin/app"
/*!******************************************************!*\
  !*** external "flarum.reg.get('core', 'admin/app')" ***!
  \******************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'admin/app');

/***/ },

/***/ "flarum/admin/components/ExtensionPage"
/*!***************************************************************************!*\
  !*** external "flarum.reg.get('core', 'admin/components/ExtensionPage')" ***!
  \***************************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'admin/components/ExtensionPage');

/***/ },

/***/ "flarum/common/Component"
/*!*************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/Component')" ***!
  \*************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/Component');

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

/***/ "flarum/common/components/LoadingIndicator"
/*!*******************************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/components/LoadingIndicator')" ***!
  \*******************************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/components/LoadingIndicator');

/***/ },

/***/ "flarum/common/components/UploadImageButton"
/*!********************************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/components/UploadImageButton')" ***!
  \********************************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/components/UploadImageButton');

/***/ },

/***/ "flarum/common/extenders"
/*!*************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/extenders')" ***!
  \*************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/extenders');

/***/ },

/***/ "flarum/common/utils/classList"
/*!*******************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/utils/classList')" ***!
  \*******************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/utils/classList');

/***/ },

/***/ "flarum/common/utils/extractText"
/*!*********************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/utils/extractText')" ***!
  \*********************************************************************/
(module) {

"use strict";
module.exports = flarum.reg.get('core', 'common/utils/extractText');

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
  !*** ./admin.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extend: () => (/* reexport safe */ _src_admin__WEBPACK_IMPORTED_MODULE_0__.extend)
/* harmony export */ });
/* harmony import */ var _src_admin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/admin */ "./src/admin/index.ts");

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=admin.js.map