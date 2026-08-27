import app from 'flarum/forum/app';
import type { Vnode, Children } from 'mithril';
import Page, { IPageAttrs } from 'flarum/common/components/Page';
import PageStructure from 'flarum/forum/components/PageStructure';
import extractText from 'flarum/common/utils/extractText';

export default class NotificationsHelpPage extends Page {
  oncreate(vnode: Vnode<IPageAttrs, this>) {
    super.oncreate(vnode);
    app.setTitle(extractText(app.translator.trans('fof-pwa.forum.notifications_help.browser_notifications_title')));
    app.setTitleCount(0);
  }

  view(vnode: Vnode<IPageAttrs, this>): Children {
    return (
      <PageStructure
        className="PWANotificationsHelpPage"
        sidebar={() => /* @see https://github.com/flarum/framework/issues/4998 */ <div />}
        hero={this.hero}
      >
        <section>
          <h2>{app.translator.trans('fof-pwa.forum.notifications_help.chromium_title')}</h2>
          <p>{app.translator.trans('fof-pwa.forum.notifications_help.chromium_instructions')}</p>
        </section>

        <section>
          <h2>{app.translator.trans('fof-pwa.forum.notifications_help.firefox_title')}</h2>
          <p>{app.translator.trans('fof-pwa.forum.notifications_help.firefox_instructions')}</p>
        </section>

        <section>
          <h2>{app.translator.trans('fof-pwa.forum.notifications_help.safari_mac_title')}</h2>
          <p>{app.translator.trans('fof-pwa.forum.notifications_help.safari_mac_instructions')}</p>
        </section>

        <section>
          <h2>{app.translator.trans('fof-pwa.forum.notifications_help.safari_ios_title')}</h2>
          <p>{app.translator.trans('fof-pwa.forum.notifications_help.safari_ios_instructions')}</p>
        </section>
      </PageStructure>
    );
  }

  hero(): Children {
    return (
      <header className="Hero">
        <div className="container">
          <h1 className="Hero-title">{app.translator.trans('fof-pwa.forum.notifications_help.title')}</h1>
          <p className="Hero-subtitle">{app.translator.trans('fof-pwa.forum.notifications_help.description')}</p>
        </div>
      </header>
    );
  }
}
