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
import { absoluteUrl } from '../helpers/url';
import type { Children } from 'mithril';

export interface ShareData {
  title: string | Children;
  url: string;
}

async function shareContent(data: ShareData): Promise<void> {
  try {
    await navigator.share({
      title: extractText(data.title),
      url: data.url,
    });
  } catch (err) {
    console.error('[fof-pwa] Share failed:', err);
  }
}

export default function addShareControls(): void {
  extend(DiscussionControls, 'userControls', function (items: ItemList<Children>, discussion: Discussion) {
    items.add(
      'share',
      <Button
        icon="fas fa-share-square"
        onclick={() =>
          shareContent({
            title: discussion.title(),
            url: absoluteUrl(app.route.discussion(discussion)),
          })
        }
      >
        {app.translator.trans('fof-pwa.forum.discussion_controls.share_button')}
      </Button>,
      -1
    );
  });

  extend(PostControls, 'userControls', function (items: ItemList<Children>, post: Post) {
    if (!post.user() || !post.discussion()) return;

    items.add(
      'share',
      <Button
        icon="fas fa-share-square"
        onclick={() =>
          shareContent({
            title: app.translator.trans('fof-pwa.forum.post_controls.share_api.title', {
              username: (post.user() as User).displayName(),
              title: post.discussion()!.title(),
            }),
            url: absoluteUrl(app.route.post(post)),
          })
        }
      >
        {app.translator.trans('fof-pwa.forum.post_controls.share_button')}
      </Button>,
      100
    );
  });

  extend(UserControls, 'userControls', function (items: ItemList<any>, user?: User) {
    if (!user) return;

    items.add(
      'share',
      <Button
        icon="fas fa-share-square"
        onclick={() =>
          shareContent({
            title: user.displayName(),
            url: absoluteUrl(app.route.user(user)),
          })
        }
      >
        {app.translator.trans('fof-pwa.forum.user_controls.share_button')}
      </Button>,
      100
    );
  });
}
