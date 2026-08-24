import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import PurchaseIntentQuickForm from '../card-recon/PurchaseIntentQuickForm';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      {/* Persistent across every page in this Layout, per the UX Blueprint
          — Quick Request must never be gated behind a specific screen. */}
      <PurchaseIntentQuickForm />
    </div>
  );
}

