import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthBootstrap } from '@/features/auth/components/auth-bootstrap';

import { AppRouter } from './router';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
      <Toaster richColors position="top-right" closeButton />
    </QueryClientProvider>
  );
}
