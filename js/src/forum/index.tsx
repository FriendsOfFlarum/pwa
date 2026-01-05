import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import { openDB, IDBPDatabase } from 'idb';
import Page from 'flarum/common/components/Page';
import LinkButton from 'flarum/common/components/LinkButton';
import SessionDropdown from 'flarum/forum/components/SessionDropdown';
import addShareButtons from './addShareButtons';
import addPushNotifications, { refreshSubscription } from './addPushNotifications';
import ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';
import type { ServiceWorkerWithPush } from './types';

app.initializers.add('fof-pwa', () => {
  const isInStandaloneMode = (): boolean =>
    window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');

  extend(Page.prototype, 'oninit', () => {
    const basePath = app.forum.attribute<string>('basePath').replace(/\/$/, '');

    const registerSW = async (): Promise<void> => {
      const dbPromise: Promise<IDBPDatabase> = openDB('keyval-store', 1, {
        upgrade(db) {
          db.createObjectStore('keyval');
        },
      });

      const db = await dbPromise;
      await db.put('keyval', app.forum.data.attributes, 'flarum.forumPayload');

      if ('serviceWorker' in navigator) {
        const sw = await navigator.serviceWorker.register(basePath + '/sw', {
          scope: basePath + '/',
        });

        await navigator.serviceWorker.ready;
        app.sw = sw as ServiceWorkerWithPush;
        await refreshSubscription(app.sw);
      }
    };

    registerSW();
  });

  extend(SessionDropdown.prototype, 'items', function (items: ItemList<Mithril.Children>) {
    if (isInStandaloneMode() && items.has('administration')) {
      items.setContent(
        'administration',
        <LinkButton icon="fas fa-wrench" href={app.forum.attribute<string>('adminUrl')} target="_self" external>
          {app.translator.trans('core.forum.header.admin_button')}
        </LinkButton>
      );
    }
  });

  addShareButtons();
  addPushNotifications();
});
