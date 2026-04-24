import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatINR } from "@/lib/format";
import { FolderKanban, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import emptyImg from "@/assets/empty-clients.png";

interface Project { id: string; name: string; description: string | null; status: string; budget: number; client_id: string | null; color: string }
interface Client { id: string; name: string }

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", client_id: "", budget: 0, status: "active", color: "#6366f1" });

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
    ]);
    setProjects((p as Project[]) ?? []);
    setClients((c as Client[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user || !form.name) { toast.error("Name required"); return; }
    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: form.name,
      description: form.description || null,
      client_id: form.client_id || null,
      budget: Number(form.budget),
      status: form.status as any,
      color: form.color,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Project created");
    setOpen(false);
    setForm({ name: "", description: "", client_id: "", budget: 0, status: "active", color: "#6366f1" });
    load();
  };

  return (
    <AppShell>
      <div className="container py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Project tools</div>
            <h1 className="text-3xl md:text-4xl font-bold">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Organize work into milestones and tasks.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="wave"><Plus className="w-4 h-4" /> New project</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Client</Label>
                    <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Budget (₹)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Color</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button variant="wave" onClick={create}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <div className="text-muted-foreground">Loading…</div> : projects.length === 0 ? (
          <EmptyState image={emptyImg} title="No projects yet" description="Group milestones, tasks, and files inside a project." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="block rounded-2xl bg-card border border-border/60 p-5 shadow-soft hover:shadow-card transition-smooth hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: p.color }}>
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{p.status.replace("_", " ")}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">{p.description || "—"}</p>
                <div className="text-xs text-muted-foreground">Budget: <span className="text-foreground font-semibold">{formatINR(p.budget)}</span></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Projects;
