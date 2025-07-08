import type { AppProps } from 'next/app';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
