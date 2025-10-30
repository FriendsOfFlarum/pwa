import app from 'flarum/admin/app';
import PWAPage from './components/PWAPage';

app.initializers.add('fof-pwa', () => {
  app.extensionData.for('fof-pwa').registerPage(PWAPage);
});
