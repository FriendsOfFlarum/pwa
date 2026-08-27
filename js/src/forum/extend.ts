import Extend from 'flarum/common/extenders';

export default [new Extend.Routes().add('fof-pwa.notifications-help', '/pwa-notifications-help', () => import('./components/NotificationsHelpPage'))];
