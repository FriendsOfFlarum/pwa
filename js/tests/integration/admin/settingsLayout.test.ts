import { beforeAll, describe, expect, test } from '@jest/globals';
import bootstrapAdmin from '@flarum/jest-config/src/bootstrap/admin';
import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import extenders from '../../../src/admin/extend';

beforeAll(() => {
  bootstrapAdmin({
    extensions: {
      'fof-pwa': {
        id: 'fof-pwa',
        version: '2.x-dev',
        description: '',
        icon: { name: 'fas fa-mobile-alt' },
        links: {},
        extra: { 'flarum-extension': { title: 'FoF PWA' } },
      },
    },
    settings: { extensions_enabled: JSON.stringify(['fof-pwa']) },
  });

  extenders.forEach((extender) => extender.extend(app, { name: 'fof-pwa', exports: {} }));
  app.boot();
});

describe('fof/pwa admin settings', () => {
  test('are laid out in an App tab and a Push notifications tab', () => {
    expect(app.registry.getTabs('fof-pwa').map((tab) => tab.id)).toEqual(['app', 'push']);
  });

  test('put every section on the tab it belongs to', () => {
    const tabs = Object.fromEntries(app.registry.getSections('fof-pwa').map((section) => [section.id, section.tab]));

    expect(tabs).toEqual({
      status: 'app',
      'home-screen': 'app',
      sharing: 'app',
      delivery: 'push',
      keys: 'push',
      firebase: 'push',
      troubleshooting: 'push',
    });
  });

  test('put every setting in a section', () => {
    const settings = app.registry.getSettings('fof-pwa') ?? [];
    const sections = new Set(app.registry.getSections('fof-pwa').map((section) => section.id));

    expect(settings.length).toBe(10);
    settings.forEach((setting) => expect(sections.has(setting.section!)).toBe(true));
  });

  test('render the push settings on their own tab', () => {
    const root = document.createElement('div');
    m.render(root, m(ExtensionPage, { id: 'fof-pwa', tab: 'push' }));

    expect([...root.querySelectorAll('[role=tab]')].map((el) => el.getAttribute('data-tab'))).toEqual(['app', 'push']);
    expect(root.textContent).toContain('fof-pwa.admin.pwa.maintenance.reset_vapid_button');
    expect(root.querySelector('input[type=file][accept=".json"]')).not.toBeNull();
    expect(root.textContent).not.toContain('fof-pwa.admin.pwa.other.orientation_label');
  });
});
