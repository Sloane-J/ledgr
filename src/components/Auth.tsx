import {
	ArrowRight,
	BarChart3,
	ShieldCheck,
	Store,
	UserCircle,
	Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { hasSupabaseConfig, supabase } from "@/src/lib/supabase";

export function Auth() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [users, setUsers] = useState<
		{ email: string; full_name: string | null }[]
	>([]);

	useEffect(() => {
		if (hasSupabaseConfig) {
			fetchUsers();
		}
	}, []);

	const fetchUsers = async () => {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("email, full_name")
				.order("full_name", { ascending: true });

			if (error) throw error;
			if (data) setUsers(data);
		} catch (error: any) {
			console.error("Error fetching users:", error.message);
			if (hasSupabaseConfig) {
				toast.error("Failed to load user list: " + error.message);
			}
		}
	};

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!hasSupabaseConfig) {
			toast.error("Supabase configuration is missing. Check your .env file.");
			return;
		}

		setLoading(true);
		try {
			if (isSignUp) {
				const { error } = await supabase.auth.signUp({ 
					email, 
					password,
					options: {
						emailRedirectTo: window.location.origin,
					}
				});
				if (error) throw error;
				toast.success("Check your email for the confirmation link!");
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (error) throw error;
				toast.success("Logged in successfully!");
			}
		} catch (error: any) {
			// "Failed to fetch" usually means the URL is wrong or the network is down
			const message = error.message === "Failed to fetch" 
				? "Connection refused. Please check your Supabase URL and internet."
				: error.message;
			toast.error(message || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-background font-sans overflow-hidden">
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-50 p-16 flex-col justify-between text-slate-900 border-r border-border">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent)] pointer-events-none" />
				<div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-sm bg-primary blur-[120px]" />
					<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-sm bg-primary blur-[120px]" />
				</div>

				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="relative z-10 flex items-center space-x-3"
				>
					<div className="bg-primary p-2.5 rounded-sm shadow-sm">
						<Store className="h-8 w-8 text-primary-foreground" />
					</div>
					<span className="text-2xl font-black tracking-tight text-primary">
						StockMaster
					</span>
				</motion.div>

				<div className="relative z-10 space-y-12">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="text-6xl font-black leading-[1.1] tracking-tight text-slate-900"
					>
						Manage your business <br />
						<span className="text-primary italic font-light">
							with absolute precision.
						</span>
					</motion.h1>

					<div className="grid grid-cols-1 gap-8 max-w-lg">
						{[
							{
								icon: Zap,
								title: "Lightning Fast POS",
								desc: "Process transactions in seconds with our optimized, keyboard-friendly interface.",
							},
							{
								icon: BarChart3,
								title: "Real-time Analytics",
								desc: "Track sales, inventory levels, and business performance as it happens.",
							},
							{
								icon: ShieldCheck,
								title: "Enterprise Security",
								desc: "Your data is protected with industry-standard encryption and secure access controls.",
							},
						].map((feature, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, x: -30 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
								className="flex items-start space-x-5 group"
							>
								<div className="bg-white p-3 rounded-sm shadow-sm border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:scale-110">
									<feature.icon className="h-6 w-6" />
								</div>
								<div>
									<h3 className="font-bold text-xl mb-1 text-slate-900">
										{feature.title}
									</h3>
									<p className="text-slate-500 text-base leading-relaxed">
										{feature.desc}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1 }}
					className="relative z-10 text-sm text-slate-400 font-bold uppercase tracking-widest"
				>
					© 2026 StockMaster POS Systems.
				</motion.div>
			</div>

			<div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-16 bg-background">
				<div className="w-full max-w-md space-y-10">
					<div className="lg:hidden flex items-center justify-center space-x-3 mb-12">
						<div className="bg-primary p-2 rounded-sm">
							<Store className="h-7 w-7 text-primary-foreground" />
						</div>
						<span className="text-3xl font-bold tracking-tight">
							StockMaster
						</span>
					</div>

					<div className="space-y-3 text-center lg:text-left">
						<motion.h2
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-4xl font-bold tracking-tight text-foreground"
						>
							{isSignUp ? "Create an account" : "Welcome back"}
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-muted-foreground text-lg"
						>
							{isSignUp
								? "Join thousands of businesses managing their stock better."
								: "Enter your credentials to access your dashboard."}
						</motion.p>
					</div>

					<AnimatePresence mode="wait">
						<motion.div
							key={isSignUp ? "signup" : "login"}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.4, ease: "easeInOut" }}
						>
							<form onSubmit={handleAuth} className="space-y-8">
								<div className="space-y-5">
									{!isSignUp && users.length > 0 && (
										<div className="space-y-2.5">
											<label className="text-sm font-semibold text-foreground/80 ml-1">
												Select User
											</label>
											<Select value={email} onValueChange={setEmail}>
												<SelectTrigger className="h-14 rounded-sm border-border bg-muted/30 focus:bg-background transition-all text-base px-5">
													<SelectValue placeholder="Choose an employee" />
												</SelectTrigger>
												<SelectContent>
													{users.map((u) => (
														<SelectItem key={u.email} value={u.email}>
															<div className="flex items-center">
																<UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
																<span>
																	{u.full_name || u.email.split("@")[0]}
																</span>
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
									<div className="space-y-2.5">
										<label className="text-sm font-semibold text-foreground/80 ml-1">
											Email Address
										</label>
										<Input
											type="email"
											placeholder="name@company.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
											className="h-14 rounded-sm border-border bg-muted/30 focus:bg-background transition-all text-base px-5"
										/>
									</div>
									<div className="space-y-2.5">
										<div className="flex items-center justify-between ml-1">
											<label className="text-sm font-semibold text-foreground/80">
												Password
											</label>
											{!isSignUp && (
												<Button
													variant="link"
													className="px-0 font-medium text-sm text-primary h-auto hover:no-underline"
												>
													Forgot password?
												</Button>
											)}
										</div>
										<Input
											type="password"
											placeholder="••••••••"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className="h-14 rounded-sm border-border bg-muted/30 focus:bg-background transition-all text-base px-5"
										/>
									</div>
								</div>

								<Button
									className="w-full h-14 text-lg font-bold rounded-sm group shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
									type="submit"
									disabled={loading}
								>
									{loading ? (
										<span className="flex items-center space-x-3">
											<Zap className="h-5 w-5 animate-pulse" />
											<span>Processing...</span>
										</span>
									) : (
										<span className="flex items-center justify-center space-x-2">
											<span>{isSignUp ? "Create Account" : "Sign In"}</span>
											<ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
										</span>
									)}
								</Button>
							</form>
						</motion.div>
					</AnimatePresence>

					<div className="relative py-4">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
							<span className="bg-background px-4 text-muted-foreground/60">
								Or continue with
							</span>
						</div>
					</div>

					<div className="text-center">
						<Button
							variant="ghost"
							className="text-base text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all py-6 px-8 rounded-sm"
							type="button"
							onClick={() => setIsSignUp(!isSignUp)}
						>
							{isSignUp
								? "Already have an account? Sign in"
								: "Don't have an account? Create one for free"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}