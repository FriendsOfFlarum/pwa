import app from 'flarum/admin/app';

/**
 * The VAPID key reset in progress. Kept outside the components, as switching
 * tabs recreates them while it runs.
 */
let pending: Promise<number> | null = null;

export function vapidResetPending(): Promise<number> | null {
  return pending;
}

export function resetVapidKeys(): Promise<number> {
  pending ??= app
    .request<{ deleted: number }>({
      method: 'POST',
      url: app.forum.attribute<string>('apiUrl') + '/reset_vapid',
    })
    .then((response) => response.deleted)
    .finally(() => {
      pending = null;
    });

  return pending;
}
