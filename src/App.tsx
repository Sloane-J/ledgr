// src/App.tsx
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, roles: ['admin'],           path: '/app/dashboard' },
  { id: 'pos',          label: 'Register',     icon: ShoppingCart,    roles: ['admin', 'staff'],  path: '/app/pos' },
  { id: 'orders',       label: 'Orders',       icon: ClipboardList,   roles: ['admin', 'staff'],  path: '/app/orders' },
  { id: 'inventory',    label: 'Inventory',    icon: Package,         roles: ['admin'],           path: '/app/inventory' },
  { id: 'categories',   label: 'Categories',   icon: Tag,             roles: ['admin'],           path: '/app/categories' },
  { id: 'customers',    label: 'Customers',    icon: Users,           roles: ['admin', 'staff'],  path: '/app/customers' },
  { id: 'reports',      label: 'Reports',      icon: BarChart3,       roles: ['admin'],           path: '/app/reports' },
  { id: 'audit_logs',   label: 'Audit Logs',   icon: ShieldCheck,     roles: ['admin'],           path: '/app/audit-logs' },
  { id: 'transactions', label: 'Transactions', icon: History,         roles: ['admin'],           path: '/app/transactions' },
  { id: 'suppliers',    label: 'Suppliers',    icon: Truck,           roles: ['admin'],           path: '/app/suppliers' },
  { id: 'users',        label: 'Employees',    icon: UserPlus,        roles: ['admin'],           path: '/app/users' },
  { id: 'profile',      label: 'My Account',   icon: UserCircle,      roles: ['admin', 'staff'],  path: '/app/profile' },
  { id: 'settings',     label: 'Settings',     icon: Settings,        roles: ['admin', 'staff'],  path: '/app/settings' },
];

// ── Guards ──
function RequireAuth({ session, loading, children }: { session: any; loading: boolean; children: React.ReactNode }) {
  const location = useLocation();
  if (loading) return null;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function RequireRole({ profile, allowed, children }: { profile: Profile | null; allowed: string[]; children: React.ReactNode }) {
  if (profile && !allowed.includes(profile.role)) return <Navigate to="/app/pos" replace />;
  return <>{children}</>;
}

// ── App shell (authenticated layout) ──
function AppShell({ session, profile, children, isFullBleed }: {
  session: any;
  profile: Profile | null;
  children: React.ReactNode;
  isFullBleed?: boolean;
}) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

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

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        navItems={NAV_ITEMS}
        profile={profile}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(prev => !prev)}
              className="text-muted-foreground"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="text-right hidden sm:block cursor-pointer"
              onClick={() => navigate('/app/profile')}
              role="button"
              tabIndex={0}
              onKeyUp={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/app/profile'); }}
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
              onClick={() => navigate('/app/profile')}
              role="button"
              tabIndex={0}
              onKeyUp={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/app/profile'); }}
              title="My Account"
            >
              {(profile?.full_name?.[0] || session?.user?.email?.[0] || 'U').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        {isFullBleed ? (
          <div className="flex-1 overflow-hidden bg-background">{children}</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Root ──
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
              is_approved: isFirstUser,
            })
            .select()
            .single();

          if (createError) throw createError;
          if (newProfile) setProfile(newProfile);
        }
      } else {
        // Unapproved staff — still set profile so pending screen renders
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Profile error:', error.message);
    } finally {
      setLoading(false);
    }
  }, []); // removed currentView dependency — was causing stale closure

  useEffect(() => {
    if (!hasSupabaseConfig) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
      if (event === 'SIGNED_OUT') navigate('/');
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Pending approval screen
  const PendingScreen = (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-sm border border-border text-center space-y-6">
        <div className="bg-orange-500/10 w-16 h-16 rounded-sm flex items-center justify-center mx-auto">
          <ShieldCheck className="h-8 w-8 text-orange-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Account Pending Approval</h2>
          <p className="text-muted-foreground">
            Your account has been created but requires administrator approval.
          </p>
        </div>
        <Button variant="outline" className="w-full rounded-sm" onClick={() => supabase.auth.signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            session ? <Navigate to="/app/dashboard" replace /> : <LandingPage onGetStarted={() => navigate('/login')} />
          }
        />
        <Route
          path="/login"
          element={session ? <Navigate to="/app/dashboard" replace /> : <Auth />}
        />

        {/* Pending */}
        <Route
          path="/pending"
          element={
            <RequireAuth session={session} loading={loading}>
              {PendingScreen}
            </RequireAuth>
          }
        />

        {/* App — staff default */}
        <Route
          path="/app"
          element={
            <RequireAuth session={session} loading={loading}>
              {profile && !profile.is_approved && profile.role !== 'admin'
                ? <Navigate to="/pending" replace />
                : <Navigate to={profile?.role === 'staff' ? '/app/pos' : '/app/dashboard'} replace />
              }
            </RequireAuth>
          }
        />

        {/* Admin-only routes */}
        {[
          { path: '/app/dashboard',    element: <Dashboard /> },
          { path: '/app/inventory',    element: <Inventory /> },
          { path: '/app/reports',      element: <Reports /> },
          { path: '/app/audit-logs',   element: <AuditLogs /> },
          { path: '/app/transactions', element: <Transactions /> },
          { path: '/app/suppliers',    element: <Suppliers /> },
          { path: '/app/users',        element: <UsersView /> },
          { path: '/app/categories',   element: <Categories /> },
        ].map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <RequireAuth session={session} loading={loading}>
                <RequireRole profile={profile} allowed={['admin']}>
                  <AppShell session={session} profile={profile}>
                    {element}
                  </AppShell>
                </RequireRole>
              </RequireAuth>
            }
          />
        ))}

        {/* Shared routes (admin + staff) */}
        <Route
          path="/app/pos"
          element={
            <RequireAuth session={session} loading={loading}>
              <AppShell session={session} profile={profile} isFullBleed>
                <POS />
              </AppShell>
            </RequireAuth>
          }
        />
        {[
          { path: '/app/orders',    element: <Orders userRole={profile?.role} /> },
          { path: '/app/customers', element: <Customers /> },
          { path: '/app/profile',   element: <ProfileView /> },
          { path: '/app/settings',  element: <SettingsView /> },
        ].map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <RequireAuth session={session} loading={loading}>
                <AppShell session={session} profile={profile}>
                  {element}
                </AppShell>
              </RequireAuth>
            }
          />
        ))}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
