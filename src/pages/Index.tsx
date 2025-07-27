import React, { useState, useEffect } from 'react';
import { PomodoroTimerExtension } from '@/components/PomodoroTimerExtension';
import { SettingsModal } from '@/components/SettingsModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePomodoroStore } from '@/store/pomodoroStore';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings } = usePomodoroStore();

  // Apply theme on load
  useEffect(() => {
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      const root = document.documentElement;
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.className = systemTheme;
      } else {
        root.className = theme;
      }
    };

    applyTheme(settings.theme);
  }, [settings.theme]);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <ThemeToggle />
      </div>
      <PomodoroTimerExtension onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Index;
