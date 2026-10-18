'use client';

import {ThemeProvider, useTheme} from 'next-themes';
import {Moon, Sun} from 'lucide-react';

function ThemeToggle() {
  const {resolvedTheme, setTheme} = useTheme();
  return <button className="theme-toggle" type="button" aria-label="Alternar entre modo claro e escuro" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
    <Moon className="theme-moon" size={18} aria-hidden="true"/>
    <Sun className="theme-sun" size={18} aria-hidden="true"/>
    <span className="theme-moon">Modo escuro</span><span className="theme-sun">Modo claro</span>
  </button>;
}

export default function Theme({children}: {children: React.ReactNode}) {
  return <ThemeProvider attribute="data-theme" storageKey="conecta-theme" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
    {children}<ThemeToggle/>
  </ThemeProvider>;
}
