import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import App from './app.tsx';
import { Toaster } from './components/ui/toaster.tsx';
import { Provider } from './components/ui/provider.tsx';
import AppErrorBoundary from './components/error-boundary.tsx';
import { queryClient } from './lib/query-client.ts';
import { PwaInstallProvider } from './features/pwa/pwa-install-provider.tsx';
import PwaLifecycle from './features/pwa/pwa-lifecycle.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaInstallProvider>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <Toaster />
            <PwaLifecycle />
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    </PwaInstallProvider>
  </StrictMode>,
);
