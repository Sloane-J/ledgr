import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Profile as ProfileType } from '../types';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function Profile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setEmail(data.email || '');
      } else {
        // Fallback for missing profile
        setProfile({
          id: user.id,
          email: user.email || '',
          role: 'staff',
          is_approved: false
        });
        setEmail(user.email || '');
      }
    } catch (error: any) {
      toast.error('Failed to load profile: ' + error.message);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info('Email update initiated. Please check your new email for confirmation.');
      }

      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error('Update failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Password update failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <Card className="md:col-span-1 rounded-sm border-border shadow-sm h-fit">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-24 w-24 rounded-sm bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold mb-4 border border-primary/20">
              {(profile.full_name?.[0] || profile.email[0]).toUpperCase()}
            </div>
            <CardTitle className="text-xl">{profile.full_name || 'Set your name'}</CardTitle>
            <CardDescription className="font-medium">{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-2 pt-4 border-t">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Role</span>
              <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="rounded-sm px-4 py-1 text-sm font-bold">
                {profile.role === 'admin' ? <Shield className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
                {profile.role.toUpperCase()}
              </Badge>
            </div>
            <div className="flex flex-col items-center space-y-2 pt-4 border-t">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Status</span>
              <div className="flex items-center text-emerald-500 font-bold text-sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                APPROVED
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* General Information */}
          <Card className="rounded-sm border-border shadow-sm">
            <form onSubmit={updateProfile}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  General Information
                </CardTitle>
                <CardDescription>Update your public profile details and contact email.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-10 h-11 rounded-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="pl-10 h-11 rounded-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-2">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Changing your email will require re-verification.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-4">
                <Button type="submit" disabled={loading} className="rounded-sm ml-auto">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Security / Password */}
          <Card className="rounded-sm border-border shadow-sm">
            <form onSubmit={updatePassword}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Change your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-sm"
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-sm"
                      minLength={6}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-4">
                <Button type="submit" disabled={loading || !newPassword} className="rounded-sm ml-auto">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
