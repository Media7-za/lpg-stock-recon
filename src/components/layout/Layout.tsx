import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';

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
    </div>
  );
}

