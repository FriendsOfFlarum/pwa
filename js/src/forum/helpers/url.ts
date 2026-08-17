import app from 'flarum/forum/app';

export const absoluteUrl = (path: string): string => new URL(path, app.forum.attribute<string>('baseUrl')).href;
