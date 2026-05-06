import { Link } from "react-router-dom";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your inbox for a reset link");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 md:px-12 lg:px-20 bg-background">
      <Link to="/" className="inline-flex">
        <Logo className="h-24 -ml-3" />
      </Link>
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Reset your password</h1>
          <p className="text-muted-foreground mb-8">
            Enter your email and we'll send you a secure link to reset it.
          </p>

          {sent ? (
            <div className="rounded-xl border border-border/60 bg-muted/40 p-6 text-sm">
              We've sent a reset link to <span className="font-medium">{email}</span>. Check your inbox (and spam).
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
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
              <Button type="submit" variant="wave" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>Send reset link <ArrowRight className="w-4 h-4" /></>)}
              </Button>
            </form>
          )}

          <p className="mt-8 text-sm text-center text-muted-foreground">
            Remembered it?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
