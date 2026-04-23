import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { WaveBackground } from "@/components/WaveBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AuthLayoutProps {
  mode: "login" | "signup";
}

export const AuthLayout = ({ mode }: AuthLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSignup = mode === "signup";
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const redirectUrl = `${window.location.origin}/dashboard`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Welcome to FlowDesk! 🎉");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="flex-1 flex flex-col px-6 py-8 md:px-12 lg:px-20">
        <Link to="/" className="inline-flex">
          <Logo className="h-9" />
        </Link>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {isSignup ? "Start your flow" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isSignup
                ? "Create your FlowDesk account in seconds — no card needed."
                : "Sign in to keep your work flowing."}
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Riya Sharma"
                    className="rounded-xl h-11"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-xl h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <Button type="submit" variant="wave" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isSignup ? "Create account" : "Sign in"} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <Button variant="outline" size="lg" className="w-full" onClick={onGoogle} disabled={loading}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.5 12.27c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853"/>
                <path d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.12V7.04H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <p className="mt-8 text-sm text-center text-muted-foreground">
              {isSignup ? "Already have an account?" : "New to FlowDesk?"}{" "}
              <Link to={isSignup ? "/login" : "/signup"} className="text-primary font-medium hover:underline">
                {isSignup ? "Sign in" : "Create one"}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right — visual */}
      <div className="hidden md:flex flex-1 relative gradient-wave overflow-hidden items-center justify-center">
        <WaveBackground variant="subtle" className="opacity-40" />
        <div className="relative z-10 max-w-md p-12 text-primary-foreground animate-fade-in">
          <div className="text-5xl font-bold leading-tight mb-4">
            Less chaos.
            <br />
            More cashflow.
          </div>
          <p className="text-primary-foreground/85 text-lg leading-relaxed">
            FlowDesk turns invoicing from a Sunday-night dread into a quiet, two-tap ritual — built for Indian freelancers.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-primary-foreground/40 bg-primary-foreground/20 backdrop-blur-sm" />
              ))}
            </div>
            <div className="text-sm text-primary-foreground/85">
              <span className="font-semibold text-primary-foreground">12,000+ freelancers</span>
              <br />finding their flow
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
