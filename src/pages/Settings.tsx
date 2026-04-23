import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", business_name: "", gstin: "", pan: "", phone: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          business_name: data.business_name ?? "",
          gstin: data.gstin ?? "",
          pan: data.pan ?? "",
          phone: data.phone ?? "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user!.id, ...form });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Your business details — they show up on every invoice.</p>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 shadow-soft p-5 md:p-6 space-y-4">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Business name</Label>
                  <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="e.g. Riya Designs" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ""} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>GSTIN (optional)</Label>
                  <Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div className="space-y-1.5">
                  <Label>PAN (optional)</Label>
                  <Input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} placeholder="ABCDE1234F" />
                </div>
              </div>
              <div className="pt-2">
                <Button variant="wave" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border/60 shadow-soft p-5 md:p-6">
          <h3 className="font-semibold mb-1">Currency</h3>
          <p className="text-sm text-muted-foreground">FlowDesk is set to <span className="font-medium text-foreground">Indian Rupee (₹)</span>. More currencies coming soon.</p>
        </div>
      </div>
    </AppShell>
  );
};

export default Settings;
