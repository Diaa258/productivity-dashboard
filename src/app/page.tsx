import Dashboard from '@/components/dashboard/Dashboard';
import { RefreshProvider } from '@/contexts/RefreshContext';

export default function Home() {
  return (
    <RefreshProvider>
      <Dashboard />
    </RefreshProvider>
  );
}
