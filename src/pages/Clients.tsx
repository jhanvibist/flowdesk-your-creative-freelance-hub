import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Mail, Phone, Building2, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import emptyClients from "@/assets/empty-clients.png";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  address: string | null;
  notes: string | null;
}

const emptyForm = { name: "", company: "", email: "", phone: "", gstin: "", address: "", notes: "" };

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setClients((data as Client[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      company: c.company ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      gstin: c.gstin ?? "",
      address: c.address ?? "",
      notes: c.notes ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Client name is required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      gstin: form.gstin || null,
      address: form.address || null,
      notes: form.notes || null,
      user_id: user!.id,
    };
    const { error } = editingId
      ? await supabase.from("clients").update(payload).eq("id", editingId)
      : await supabase.from("clients").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Client updated" : "Client added");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this client? Linked invoices will keep their data.")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Client deleted");
    load();
  };

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return [c.name, c.company, c.email, c.phone].some((v) => (v ?? "").toLowerCase().includes(q));
  });

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">The people who keep your flow flowing.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-full bg-muted/40 border-transparent focus-visible:bg-background"
              />
            </div>
            <Button variant="wave" onClick={openNew}>
              <Plus className="w-4 h-4" /> Add client
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border/60 shadow-soft">
            <EmptyState
              image={emptyClients}
              title={clients.length === 0 ? "No clients yet" : "No matches"}
              description={clients.length === 0 ? "Add your first client to start sending invoices." : "Try a different name or email."}
              action={clients.length === 0 ? <Button variant="wave" onClick={openNew}><Plus className="w-4 h-4" /> Add client</Button> : undefined}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c, i) => (
              <div
                key={c.id}
                className="group rounded-2xl bg-card border border-border/60 p-5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-smooth animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl gradient-wave flex items-center justify-center text-primary-foreground font-semibold shadow-soft">
                    {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{c.name}</h3>
                    {c.company && <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Building2 className="w-3 h-3" /> {c.company}</p>}
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {c.email && <div className="flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{c.email}</span></div>}
                  {c.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /> {c.phone}</div>}
                  {c.gstin && <div className="text-xs">GSTIN: <span className="font-mono">{c.gstin}</span></div>}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-smooth">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(c.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit client" : "Add client"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Riya Sharma" />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Pvt Ltd" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="riya@acme.in" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>GSTIN (optional)</Label>
              <Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="wave" onClick={save} disabled={saving}>{saving ? "Saving…" : editingId ? "Update" : "Add client"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Clients;
