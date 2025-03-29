import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import App from './App.tsx';
import { Toaster } from './components/ui/toaster.tsx';
import { Provider } from './components/ui/provider.tsx';
import AuthProvider from './components/AuthProvider.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);
