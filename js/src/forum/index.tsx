import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import LinkButton from 'flarum/common/components/LinkButton';
import SessionDropdown from 'flarum/forum/components/SessionDropdown';
import addShareButtons from './addShareButtons';
import addPushNotifications from './addPushNotifications';
import ItemList from 'flarum/common/utils/ItemList';
import isInStandaloneMode from './helpers/isInStandaloneMode';
import type Mithril from 'mithril';
import { registerServiceWorker } from './registerServiceWorker';

app.initializers.add('fof-pwa', () => {
  app.beforeMount(() => {
    registerServiceWorker().catch((e) => console.error('SW registration failed', e));
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
