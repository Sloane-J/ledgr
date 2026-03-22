import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Store,
  UserCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasSupabaseConfig, supabase } from "@/src/lib/supabase";
import { cn } from "@/lib/utils";

type Page = "login" | "signup";

export function Auth() {
  const [page, setPage] = useState<Page>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<{ email: string; full_name: string | null }[]>([]);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (hasSupabaseConfig) fetchUsers();
  }, []);

  const goTo = (p: Page) => {
    setDirection(p === "signup" ? 1 : -1);
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setPage(p);
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("email, full_name")
        .order("full_name", { ascending: true });
      if (error) throw error;
      if (data) setUsers(data);
    } catch (error: any) {
      if (hasSupabaseConfig) toast.error("Failed to load user list: " + error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig) { toast.error("Supabase config missing."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message === "Failed to fetch" ? "Connection refused. Check your Supabase URL." : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig) { toast.error("Supabase config missing."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success("Check your email for the confirmation link!");
    } catch (error: any) {
      toast.error(error.message === "Failed to fetch" ? "Connection refused. Check your Supabase URL." : error.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : password.length < 12 ? 3
    : 4;

  const strengthConfig = [
    { label: "", color: "" },
    { label: "Too short", color: "bg-red-500" },
    { label: "Weak", color: "bg-orange-400" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-emerald-500" },
  ];

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -32 }),
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── LEFT BRAND COLUMN ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between bg-primary p-12 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary-foreground/15 flex items-center justify-center rounded-lg">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-black text-primary-foreground tracking-tight">Ledgr</span>
        </div>

        {/* Middle copy */}
        <div className="space-y-8">
          <div>
            <p className="text-primary-foreground/50 text-xs font-black uppercase tracking-[0.3em] mb-4">
              Built for retail
            </p>
            <h2 className="text-4xl font-black text-primary-foreground leading-[1.15] tracking-tight">
              Run your store.<br />
              Know your numbers.<br />
              <span className="text-primary-foreground/40">Always.</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { title: "Fast POS", desc: "Process sales in seconds from any device." },
              { title: "Live Inventory", desc: "Stock updates automatically on every sale." },
              { title: "Clear Reports", desc: "Revenue, trends, and top products at a glance." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="h-5 w-5 rounded bg-primary-foreground/15 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                </div>
                <div>
                  <p className="text-primary-foreground font-bold text-sm">{item.title}</p>
                  <p className="text-primary-foreground/50 text-xs mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-primary-foreground/25 text-xs font-bold uppercase tracking-[0.25em]">
          © 2026 Ledgr
        </p>
      </div>

      {/* ── RIGHT FORM COLUMN ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 sm:px-12 py-6 border-b border-border">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-lg">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-black text-lg tracking-tight">Ledgr</span>
          </div>
          <div className="hidden lg:block" />

          {/* Page indicator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("font-bold transition-colors duration-200", page === "login" ? "text-foreground" : "")}>
              Sign in
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className={cn("font-bold transition-colors duration-200", page === "signup" ? "text-foreground" : "")}>
              Create account
            </span>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 py-12 overflow-hidden">
          <div className="w-full max-w-[400px]">
            <AnimatePresence mode="wait" custom={direction}>

              {/* ── LOGIN ── */}
              {page === "login" && (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                      Welcome back
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1.5">
                      Sign in to access your dashboard.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Quick select */}
                    {users.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Quick select
                        </label>
                        <Select value={email} onValueChange={setEmail}>
                          <SelectTrigger className="h-11 border-border bg-background text-sm">
                            <SelectValue placeholder="Choose an employee…" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(u => (
                              <SelectItem key={u.email} value={u.email}>
                                <div className="flex items-center gap-2">
                                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                                  {u.full_name || u.email.split('@')[0]}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="h-11 border-border bg-background text-sm"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Password
                        </label>
                        <span className="text-xs font-semibold text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-150">
                          Forgot password?
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="h-11 border-border bg-background text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 group mt-2"
                    >
                      {loading
                        ? <><Zap className="h-4 w-4 animate-pulse" />Signing in…</>
                        : <>Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" /></>
                      }
                    </button>
                  </form>

                  {/* Switch to signup */}
                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">New to Ledgr?</p>
                    <button
                      type="button"
                      onClick={() => goTo("signup")}
                      className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors duration-150 group"
                    >
                      Create an account
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── SIGNUP ── */}
              {page === "signup" && (
                <motion.div
                  key="signup"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                >
                  {/* Back */}
                  <button
                    type="button"
                    onClick={() => goTo("login")}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider transition-colors duration-150 mb-8 group"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
                    Back
                  </button>

                  <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                      Create account
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1.5">
                      You'll need admin approval before you can log in.
                    </p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Work Email
                      </label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="h-11 border-border bg-background text-sm"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="h-11 border-border bg-background text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Strength bar */}
                      {password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-1.5"
                        >
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1 flex-1 rounded-full transition-all duration-300",
                                  i <= passwordStrength ? strengthConfig[passwordStrength].color : "bg-muted"
                                )}
                              />
                            ))}
                          </div>
                          <p className={cn(
                            "text-[11px] font-bold transition-colors duration-200",
                            passwordStrength <= 1 ? "text-red-500" :
                            passwordStrength === 2 ? "text-orange-400" :
                            passwordStrength === 3 ? "text-yellow-500" :
                            "text-emerald-500"
                          )}>
                            {strengthConfig[passwordStrength].label}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Approval notice */}
                    <div className="flex gap-3 p-4 bg-muted/50 border border-border rounded-lg">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        After signing up, an administrator needs to approve your account before you can access the system.
                      </p>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 group mt-2"
                    >
                      {loading
                        ? <><Zap className="h-4 w-4 animate-pulse" />Creating account…</>
                        : <>Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" /></>
                      }
                    </button>
                  </form>

                  {/* Switch to login */}
                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Already have an account?</p>
                    <button
                      type="button"
                      onClick={() => goTo("login")}
                      className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors duration-150 group"
                    >
                      Sign in
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}