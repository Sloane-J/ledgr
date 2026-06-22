// src/components/Sidebar.tsx
import * as React from 'react';
import { Store, LogOut } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';
import { Profile } from '@/src/types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  onViewChange: (view: string) => void;
  navItems: NavItem[];
  profile: Profile | null;
}

export function Sidebar({
  isOpen,
  currentView,
  onViewChange,
  navItems,
  profile,
}: SidebarProps) {
  const filteredNavItems = navItems.filter(item =>
    !profile || item.roles.includes(profile.role)
  );

  return (
    <aside className={cn(
      'bg-card border-r transition-all duration-300 flex flex-col shrink-0',
      isOpen ? 'w-64' : 'w-16'
    )}>

      {/* ── LOGO ── */}
      <div className={cn(
        'flex items-center border-b border-border shrink-0',
        isOpen ? 'p-5 gap-3' : 'p-4 justify-center'
      )}>
        <div className="bg-primary p-2 rounded-sm shrink-0" title="Ledgr">
          <Store className="h-5 w-5 text-primary-foreground" />
        </div>
        {isOpen && (
          <span className="font-black text-lg tracking-tight">Ledgr</span>
        )}
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {filteredNavItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <div key={item.id} className="relative group">
              <Button
                variant="ghost"
                onClick={() => onViewChange(item.id)}
                onKeyUp={e => {
                  if (e.key === 'Enter' || e.key === ' ') onViewChange(item.id);
                }}
                className={cn(
                  'w-full h-11 transition-all',
                  isOpen ? 'justify-start px-3 gap-3' : 'justify-center px-0',
                  isActive
                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className={cn(
                  'shrink-0 transition-all',
                  isActive ? 'h-5 w-5' : 'h-4 w-4'
                )} />
                {isOpen && (
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {item.label}
                  </span>
                )}
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary" />
                )}
              </Button>

              {/* Tooltip — only shows when sidebar is collapsed */}
              {!isOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
                  <div className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                    'bg-card border border-border shadow-lg px-3 py-1.5 whitespace-nowrap',
                  )}>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {item.label}
                    </span>
                    {/* Arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-border" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── LOGOUT ── */}
      <div className="p-2 border-t border-border shrink-0">
        <div className="relative group">
          <Button
            variant="ghost"
            onClick={() => supabase.auth.signOut()}
            onKeyUp={e => {
              if (e.key === 'Enter' || e.key === ' ') supabase.auth.signOut();
            }}
            className={cn(
              'w-full h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all',
              isOpen ? 'justify-start px-3 gap-3' : 'justify-center px-0'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {isOpen && (
              <span className="text-xs font-bold uppercase tracking-widest">
                Logout
              </span>
            )}
          </Button>

          {/* Logout tooltip when collapsed */}
          {!isOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
              <div className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                'bg-card border border-border shadow-lg px-3 py-1.5 whitespace-nowrap',
              )}>
                <span className="text-xs font-bold uppercase tracking-widest text-destructive">
                  Logout
                </span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-border" />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}