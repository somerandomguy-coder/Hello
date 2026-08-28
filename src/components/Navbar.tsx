import React from 'react';
import { User, Sparkles, Moon, Sun, Database, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentUser: string | null;
  onSwitchUser: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-[#faf9f5]/90 dark:bg-[#121214]/90 backdrop-blur-sm border-b-2 border-[#2c2c2c] dark:border-[#444444] px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 sketch-border bg-[#f2cc8f] text-[#121212] flex items-center justify-center font-hand text-xl font-bold shadow-[2px_2px_0px_0px_#2c2c2c]">
            <Sparkles className="w-5 h-5 text-[#2c2c2c]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-hand text-[#2c2c2c] dark:text-[#f4f1de] tracking-wide flex items-center gap-2">
              ExcaliBoard
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#2c2c2c] dark:border-[#666666] bg-[#f4f1de] dark:bg-[#22222a] text-[#2c2c2c] dark:text-[#f4f1de] font-sans font-medium">
                v1.0
              </span>
            </h1>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Supabase Status Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-[#2c2c2c] dark:border-[#555] font-sans ${
              isSupabaseConfigured
                ? 'bg-[#81b29a]/20 text-[#2b5943] dark:text-[#a3e6c5]'
                : 'bg-[#f2cc8f]/20 text-[#7a5316] dark:text-[#f7d69e]'
            }`}
            title={
              isSupabaseConfigured
                ? 'Connected to Supabase Postgres Realtime'
                : 'Running in Local Storage Mode (Realtime broadcast across tabs)'
            }
          >
            {isSupabaseConfigured ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <Database className="w-3.5 h-3.5" />
            )}
            <span>{isSupabaseConfigured ? 'Supabase Sync' : 'Local Storage Sync'}</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg border-2 border-[#2c2c2c] dark:border-[#555] bg-white dark:bg-[#1e1e24] text-[#2c2c2c] dark:text-[#e4e4e7] hover:bg-gray-100 dark:hover:bg-[#2a2a32] shadow-[2px_2px_0px_0px_#2c2c2c] dark:shadow-[2px_2px_0px_0px_#555] transition-all"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Current User Badge & Switch User */}
          {currentUser && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-2 px-3 py-1.5 sketch-border bg-[#81b29a]/30 dark:bg-[#81b29a]/20 text-[#1f3a2d] dark:text-[#b8edd3] text-sm font-hand font-bold">
                <User className="w-4 h-4" />
                <span>{currentUser}</span>
              </div>
              <button
                onClick={onSwitchUser}
                className="sketch-button px-3 py-1.5 bg-[#f4f1de] dark:bg-[#2c2c36] text-[#2c2c2c] dark:text-[#e4e4e7] text-xs font-hand font-bold hover:bg-[#e07a5f] hover:text-white transition-colors"
              >
                Switch User
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
