import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Profile } from '../types';
import {
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<Profile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'role' | 'deactivate' | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'staff'>('staff');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (user: Profile) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_approved: !user.is_approved })
        .eq('id', user.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Permission denied or user not found.');
      setUsers(users.map(u => u.id === user.id ? { ...u, is_approved: !user.is_approved } : u));
      toast.success(`User ${!user.is_approved ? 'approved' : 'unapproved'}`);
      closeAction();
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateRole = async (user: Profile, role: 'admin' | 'staff') => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Permission denied or user not found.');
      setUsers(users.map(u => u.id === user.id ? { ...u, role } : u));
      toast.success(`Role updated to ${role}`);
      closeAction();
    } catch (error: any) {
      toast.error('Failed to update role: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeAction = () => {
    setActionTarget(null);
    setActionType(null);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const pendingCount = users.filter(u => !u.is_approved).length;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">
              Access Control
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight">Employees</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') fetchUsers(); }}
              className="h-11 w-11 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <button
              onClick={() => setIsInviteOpen(true)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsInviteOpen(true); }}
              className="h-11 px-5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-3 border border-border divide-x divide-border">
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Staff</p>
            <p className="text-2xl font-black font-mono">{users.length}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Admins</p>
            <p className="text-2xl font-black font-mono text-primary">{adminCount}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Pending</p>
            <p className={cn('text-2xl font-black font-mono', pendingCount > 0 ? 'text-orange-500' : 'text-muted-foreground')}>
              {pendingCount}
            </p>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 bg-card border-border text-sm"
          />
        </div>

        {/* ── USER LIST ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading…</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border gap-3 text-muted-foreground/40">
            <User className="h-10 w-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No employees found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={cn(
                  'bg-card border flex flex-col transition-colors',
                  !user.is_approved ? 'border-orange-500/30' : 'border-border'
                )}
              >
                {/* Card top */}
                <div className="p-4 flex items-start gap-3 border-b border-border">
                  {/* Avatar */}
                  <div className={cn(
                    'h-12 w-12 flex items-center justify-center text-lg font-black shrink-0 border',
                    user.role === 'admin'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-muted-foreground border-border'
                  )}>
                    {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {user.full_name || 'Unnamed User'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>

                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {/* Role badge */}
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5',
                        user.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {user.role === 'admin'
                          ? <Shield className="h-2.5 w-2.5" />
                          : <User className="h-2.5 w-2.5" />
                        }
                        {user.role}
                      </span>

                      {/* Approval badge */}
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5',
                        user.is_approved
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-orange-500/10 text-orange-500'
                      )}>
                        {user.is_approved
                          ? <CheckCircle2 className="h-2.5 w-2.5" />
                          : <XCircle className="h-2.5 w-2.5" />
                        }
                        {user.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons — large, touch-friendly */}
                <div className="grid grid-cols-3 divide-x divide-border">
                  {/* Approve / Revoke */}
                  <button
                    onClick={() => { setActionTarget(user); setActionType('approve'); }}
                    onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActionTarget(user); setActionType('approve'); } }}
                    className={cn(
                      'h-12 flex flex-col items-center justify-center gap-0.5 text-[9px] font-black uppercase tracking-widest transition-colors',
                      user.is_approved
                        ? 'text-orange-500 hover:bg-orange-500/10'
                        : 'text-emerald-500 hover:bg-emerald-500/10'
                    )}
                    title={user.is_approved ? 'Revoke' : 'Approve'}
                  >
                    {user.is_approved
                      ? <XCircle className="h-4 w-4" />
                      : <CheckCircle2 className="h-4 w-4" />
                    }
                    {user.is_approved ? 'Revoke' : 'Approve'}
                  </button>

                  {/* Role toggle */}
                  <button
                    onClick={() => {
                      const next = user.role === 'admin' ? 'staff' : 'admin';
                      setNewRole(next);
                      setActionTarget(user);
                      setActionType('role');
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        const next = user.role === 'admin' ? 'staff' : 'admin';
                        setNewRole(next);
                        setActionTarget(user);
                        setActionType('role');
                      }
                    }}
                    className="h-12 flex flex-col items-center justify-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                    title={user.role === 'admin' ? 'Demote' : 'Promote'}
                  >
                    <Shield className="h-4 w-4" />
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>

                  {/* Deactivate */}
                  <button
                    onClick={() => { setActionTarget(user); setActionType('deactivate'); }}
                    onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActionTarget(user); setActionType('deactivate'); } }}
                    className="h-12 flex flex-col items-center justify-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-colors"
                    title="Deactivate"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── INVITE INFO DIALOG ── */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Add New Employee</DialogTitle>
            <DialogDescription>
              Employees sign up themselves, then you approve them here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-muted border border-border p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Instructions for your staff
              </p>
              <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                <li>Go to the login page</li>
                <li>Click <strong>"Create one for free"</strong></li>
                <li>Sign up with their work email</li>
                <li>Confirm their email address</li>
                <li>Wait for admin approval</li>
              </ol>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              New signups default to <strong>Staff</strong> role and require approval before access.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsInviteOpen(false)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsInviteOpen(false); }}
              className="w-full h-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              Got It
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── APPROVE / REVOKE DIALOG ── */}
      <Dialog open={actionType === 'approve'} onOpenChange={(o) => { if (!o) closeAction(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">
              {actionTarget?.is_approved ? 'Revoke Access' : 'Approve Employee'}
            </DialogTitle>
          </DialogHeader>
          {actionTarget && (
            <div className="py-2 space-y-3">
              <div className="bg-muted border border-border p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-card border border-border flex items-center justify-center font-black text-sm">
                  {(actionTarget.full_name?.[0] || actionTarget.email[0]).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{actionTarget.full_name || 'Unnamed'}</p>
                  <p className="text-[10px] text-muted-foreground">{actionTarget.email}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {actionTarget.is_approved
                  ? 'This will prevent the employee from logging in.'
                  : 'This will grant the employee access to the system.'}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button
              onClick={closeAction}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') closeAction(); }}
              className="flex-1 h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => actionTarget && toggleApproval(actionTarget)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') actionTarget && toggleApproval(actionTarget); }}
              disabled={isProcessing}
              className={cn(
                'flex-1 h-12 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50',
                actionTarget?.is_approved
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              )}
            >
              {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {actionTarget?.is_approved ? 'Revoke' : 'Approve'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ROLE CHANGE DIALOG ── */}
      <Dialog open={actionType === 'role'} onOpenChange={(o) => { if (!o) closeAction(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">
              {newRole === 'admin' ? 'Promote to Admin' : 'Demote to Staff'}
            </DialogTitle>
          </DialogHeader>
          {actionTarget && (
            <div className="py-2 space-y-3">
              <div className="bg-muted border border-border p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-card border border-border flex items-center justify-center font-black text-sm">
                  {(actionTarget.full_name?.[0] || actionTarget.email[0]).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{actionTarget.full_name || 'Unnamed'}</p>
                  <p className="text-[10px] text-muted-foreground">{actionTarget.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 py-1">
                <span className="text-xs font-black uppercase px-2 py-1 bg-muted border border-border">
                  {actionTarget.role}
                </span>
                <span className="text-muted-foreground text-xs">→</span>
                <span className="text-xs font-black uppercase px-2 py-1 bg-primary/10 text-primary border border-primary/20">
                  {newRole}
                </span>
              </div>
              {newRole === 'admin' && (
                <p className="text-[10px] text-orange-500 text-center font-bold">
                  Admins have full access to all system features.
                </p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <button
              onClick={closeAction}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') closeAction(); }}
              className="flex-1 h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => actionTarget && updateRole(actionTarget, newRole)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') actionTarget && updateRole(actionTarget, newRole); }}
              disabled={isProcessing}
              className="flex-1 h-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DEACTIVATE DIALOG ── */}
      <Dialog open={actionType === 'deactivate'} onOpenChange={(o) => { if (!o) closeAction(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Remove Employee</DialogTitle>
          </DialogHeader>
          {actionTarget && (
            <div className="py-2 space-y-3">
              <div className="bg-destructive/5 border border-destructive/20 p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-card border border-border flex items-center justify-center font-black text-sm">
                  {(actionTarget.full_name?.[0] || actionTarget.email[0]).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{actionTarget.full_name || 'Unnamed'}</p>
                  <p className="text-[10px] text-muted-foreground">{actionTarget.email}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                This will revoke all system access for this employee.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button
              onClick={closeAction}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') closeAction(); }}
              className="flex-1 h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={closeAction}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') closeAction(); }}
              className="flex-1 h-12 bg-destructive text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/90 transition-colors"
            >
              Deactivate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}