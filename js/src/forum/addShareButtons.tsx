import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import extractText from 'flarum/common/utils/extractText';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import PostControls from 'flarum/forum/utils/PostControls';
import UserControls from 'flarum/forum/utils/UserControls';
import Button from 'flarum/common/components/Button';
import Discussion from 'flarum/common/models/Discussion';
import Post from 'flarum/common/models/Post';
import User from 'flarum/common/models/User';
import ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';

interface ShareData {
  title: string;
  url: string;
}

async function shareContent(data: ShareData): Promise<void> {
  try {
    const title = extractText(data.title);
    await navigator.share({ title, url: data.url });
  } catch (err) {
    console.error('Share error:', err);
  }
}

export default function addShareButtons(): void {
  extend(DiscussionControls, 'userControls', function (items: ItemList<Mithril.Children>, discussion: Discussion) {
    if (!navigator.share) return;

    items.add(
      'share',
      <Button
        icon="fas fa-share-square"
        onclick={() =>
          shareContent({
            title: discussion.title(),
            url: window.location.protocol + '//' + window.location.hostname + app.route.discussion(discussion),
          })
        }
      >
        {app.translator.trans('fof-pwa.forum.discussion_controls.share_button')}
      </Button>,
      -1
    );
  });

  extend(PostControls, 'userControls', function (items: ItemList<Mithril.Children>, post: Post) {
    if (!navigator.share || !post.user() || !post.discussion()) return;

    items.add(
      'share',
      <Button
        icon="fas fa-share-square"
        onclick={() =>
          shareContent({
            title: extractText(
              app.translator.trans('fof-pwa.forum.post_controls.share_api.title', {
                username: (post.user() as User).displayName(),
                title: post.discussion()!.title(),
              })
            ),
            url: window.location.protocol + '//' + window.location.hostname + app.route.post(post),
          })
        }
      >
        {app.translator.trans('fof-pwa.forum.post_controls.share_button')}
      </Button>,
      100
    );
  });

  extend(UserControls, 'userControls', function (items: ItemList<any>, user?: User) {
    if (!navigator.share || !user) return;

    items.add(
      'share',
      <Button
        icon="fas fa-share-square"
        onclick={() =>
          shareContent({
            title: user.displayName(),
            url: window.location.protocol + '//' + window.location.hostname + app.route.user(user),
          })
        }
      >
        {app.translator.trans('fof-pwa.forum.user_controls.share_button')}
      </Button>,
      100
    );
  });
}
