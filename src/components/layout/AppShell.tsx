import { ReactNode } from 'react';
import Logo from '@/components/branding/Logo';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const [open] = useState(false); // drawer removed
  const NavLinks = () => (
    <>
      <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
      <Link to="/community" className="hover:text-primary transition-colors">Community</Link>
      <Link to="/articles" className="hover:text-primary transition-colors">Articles</Link>
      <Link to="/ask-nurse" className="hover:text-primary transition-colors">Ask Nurse</Link>
      <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
    </>
  );
  return (
    <div className="min-h-screen flex flex-col bg-gradient-soft/40 transition-colors duration-500">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-background px-3 py-2 rounded-md shadow-soft text-sm">Skip to content</a>
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={34} />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLinks />
          </nav>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>
  <main id="main-content" className="flex-1 container py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.4,0.0,0.2,1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="mt-auto border-t border-border/40 bg-background/60 backdrop-blur py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size={28} showWordmark={false} />
            <span>&copy; {new Date().getFullYear()} MamaHealth. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground/80">
            <span className="font-medium tracking-wide">A product of</span>
            <span className="text-primary font-semibold">NEXA Labs</span>
          </div>
        </div>
      </footer>
  {/* Mobile drawer removed as requested */}
    </div>
  );
};

export default AppShell;
