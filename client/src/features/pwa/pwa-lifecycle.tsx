import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { toaster } from '@/components/ui/toaster-store';

const UPDATE_TOAST_ID = 'pwa-update-available';
const OFFLINE_TOAST_ID = 'pwa-offline';

const PwaLifecycle = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh || toaster.isVisible(UPDATE_TOAST_ID)) return;

    toaster.create({
      id: UPDATE_TOAST_ID,
      type: 'info',
      title: 'Kadha update available',
      description: 'Update when convenient to use the latest version.',
      duration: 60_000,
      action: {
        label: 'Update',
        onClick: () => {
          void updateServiceWorker(true).catch(() => {
            toaster.error({
              title: 'Update failed',
              description: 'Reload Kadha to try again.',
              meta: { closable: true },
            });
          });
        },
      },
      meta: { closable: true },
    });
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    const showOfflineNotice = () => {
      if (toaster.isVisible(OFFLINE_TOAST_ID)) return;

      toaster.create({
        id: OFFLINE_TOAST_ID,
        type: 'info',
        title: 'You are offline',
        description: 'Kadha needs a connection to load or update your library.',
        duration: 10_000,
        meta: { closable: true },
      });
    };

    const showOnlineNotice = () => {
      toaster.dismiss(OFFLINE_TOAST_ID);
      toaster.success({
        title: 'Back online',
        description: 'Kadha can load and update your library again.',
      });
    };

    if (!navigator.onLine) showOfflineNotice();

    window.addEventListener('offline', showOfflineNotice);
    window.addEventListener('online', showOnlineNotice);

    return () => {
      window.removeEventListener('offline', showOfflineNotice);
      window.removeEventListener('online', showOnlineNotice);
    };
  }, []);

  return null;
};

export default PwaLifecycle;
