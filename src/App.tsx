// src/App.tsx
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { supabase, hasSupabaseConfig } from '@/src/lib/supabase';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { Transactions } from './components/Transactions';
import { Customers } from './components/Customers';
import { Reports } from './components/Reports';
import { Orders } from './components/Orders';
import { Categories } from './components/Categories';
import { AuditLogs } from './components/AuditLogs';
import { Users as UsersView } from './components/Users';
import { Suppliers } from './components/Suppliers';
import { Profile as ProfileView } from './components/Profile';
import { Settings as SettingsView } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import LandingPage from './Landing/LandingPage';
import { Toaster } from '@/src/components/ui/sonner';
import { Profile } from './types';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  LogOut,
  Menu,
  X,
  Settings,
  Sun,
  Moon,
  Users,
  BarChart3,
  UserPlus,
  ShieldCheck,
  UserCircle,
  Truck,
  ClipboardList,
  Tag,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';

type View =
  | 'dashboard' | 'inventory' | 'pos' | 'transactions'
  | 'customers' | 'reports' | 'settings' | 'users'
  | 'profile' | 'suppliers' | 'orders' | 'audit_logs' | 'categories';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, roles: ['admin'] },
  { id: 'pos',          label: 'Register',     icon: ShoppingCart,    roles: ['admin', 'staff'] },
  { id: 'orders',       label: 'Orders',       icon: ClipboardList,   roles: ['admin', 'staff'] },
  { id: 'inventory',    label: 'Inventory',    icon: Package,         roles: ['admin'] },
  { id: 'categories',   label: 'Categories',   icon: Tag,             roles: ['admin'] },
  { id: 'customers',    label: 'Customers',    icon: Users,           roles: ['admin', 'staff'] },
  { id: 'reports',      label: 'Reports',      icon: BarChart3,       roles: ['admin'] },
  { id: 'audit_logs',   label: 'Audit Logs',   icon: ShieldCheck,     roles: ['admin'] },
  { id: 'transactions', label: 'Transactions', icon: History,         roles: ['admin'] },
  { id: 'suppliers',    label: 'Suppliers',    icon: Truck,           roles: ['admin'] },
  { id: 'users',        label: 'Employees',    icon: UserPlus,        roles: ['admin'] },
  { id: 'profile',      label: 'My Account',   icon: UserCircle,      roles: ['admin', 'staff'] },
  { id: 'settings',     label: 'Settings',     icon: Settings,        roles: ['admin', 'staff'] },
];

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // ── Dark mode ──
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // ── Profile fetch ──
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data && (data.is_approved || data.role === 'admin')) {
        setProfile(data);
        if (
          data.role === 'staff' &&
          ['dashboard', 'reports', 'transactions', 'users', 'audit_logs'].includes(currentView)
        ) {
          setCurrentView('pos');
        }
      } else if (!data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

          const isFirstUser = count === 0 || count === null;

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              role: isFirstUser ? 'admin' : 'staff',
              is_approved: isFirstUser ? true : false,
            })
            .select()
            .single();

          if (createError) throw createError;
          if (newProfile) setProfile(newProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Profile error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [currentView]);

  // ── Auth listener ──
  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
        if (event === 'SIGNED_OUT') {
          setCurrentView('dashboard');
          window.history.pushState({}, '', '/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── PUBLIC ROUTES ──
  const pathname = window.location.pathname;

  if (pathname === '/') {
    if (session && !loading) {
      window.location.href = '/app';
      return null;
    }
    return (
      <>
        <LandingPage
          onGetStarted={() => { window.location.href = '/login'; }}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // ── Auth gate ──
  if (!session) {
    return (
      <>
        <Auth />
        <Toaster position="top-right" />
      </>
    );
  }

  // ── Pending approval ──
  if (profile && !profile.is_approved && profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-sm border border-border text-center space-y-6">
          <div className="bg-orange-500/10 w-16 h-16 rounded-sm flex items-center justify-center mx-auto">
            <ShieldCheck className="h-8 w-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Account Pending Approval
            </h2>
            <p className="text-muted-foreground">
              Your account has been created but requires administrator approval.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-sm"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // ── View renderer ──
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':    return <Dashboard />;
      case 'inventory':    return <Inventory />;
      case 'pos':          return <POS />;
      case 'orders':       return <Orders userRole={profile?.role} />;
      case 'categories':   return <Categories />;
      case 'audit_logs':   return <AuditLogs />;
      case 'transactions': return <Transactions />;
      case 'customers':    return <Customers />;
      case 'reports':      return <Reports />;
      case 'suppliers':    return <Suppliers />;
      case 'users':        return <UsersView />;
      case 'profile':      return <ProfileView />;
      case 'settings':     return <SettingsView />;
      default:             return <Dashboard />;
    }
  };

  const isFullBleedView = currentView === 'pos';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── SIDEBAR ── */}
      <Sidebar
        isOpen={isSidebarOpen}
        currentView={currentView}
        onViewChange={view => setCurrentView(view as View)}
        navItems={NAV_ITEMS}
        profile={profile}
      />

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              onKeyUp={e => {
                if (e.key === 'Enter' || e.key === ' ')
                  setIsSidebarOpen(prev => !prev);
              }}
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen
                ? <X className="h-5 w-5" />
                : <Menu className="h-5 w-5" />
              }
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              onKeyUp={e => {
                if (e.key === 'Enter' || e.key === ' ')
                  setIsDarkMode(prev => !prev);
              }}
              className="text-muted-foreground"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode
                ? <Sun className="h-5 w-5" />
                : <Moon className="h-5 w-5" />
              }
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="text-right hidden sm:block cursor-pointer"
              onClick={() => setCurrentView('profile')}
              onKeyUp={e => {
                if (e.key === 'Enter' || e.key === ' ') setCurrentView('profile');
              }}
              role="button"
              tabIndex={0}
            >
              <p className="text-sm font-bold text-foreground">
                {profile?.full_name || session?.user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {profile?.role === 'admin' ? 'Administrator' : 'Staff Member'}
              </p>
            </div>
            <div
              className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center text-primary font-bold cursor-pointer border border-primary/20 hover:bg-primary/20 transition-colors"
              onClick={() => setCurrentView('profile')}
              onKeyUp={e => {
                if (e.key === 'Enter' || e.key === ' ') setCurrentView('profile');
              }}
              role="button"
              tabIndex={0}
              title="My Account"
            >
              {(
                profile?.full_name?.[0] ||
                session?.user?.email?.[0] ||
                'U'
              ).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        {isFullBleedView ? (
          <div className="flex-1 overflow-hidden bg-background">
            {renderView()}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="max-w-7xl mx-auto">
              {renderView()}
            </div>
          </div>
        )}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}