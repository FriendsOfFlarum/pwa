import ForumApplication from 'flarum/forum/ForumApplication';
import { ServiceWorkerWithPush } from '../forum/types';

declare module 'flarum/forum/ForumApplication' {
  export default interface ForumApplication {
    sw?: ServiceWorkerWithPush;
  }
}
