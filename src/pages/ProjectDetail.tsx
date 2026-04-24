import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDateIN, formatINR } from "@/lib/format";
import { ArrowLeft, Plus, Flag, Check, Trash2 } from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newMs, setNewMs] = useState({ title: "", due_date: "", amount: 0 });
  const [newTask, setNewTask] = useState({ title: "", milestone_id: "", priority: "medium" });

  const load = async () => {
    if (!id) return;
    const [{ data: p }, { data: m }, { data: t }] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("milestones").select("*").eq("project_id", id).order("sort_order"),
      supabase.from("tasks").select("*").eq("project_id", id).order("created_at"),
    ]);
    setProject(p);
    setMilestones(m ?? []);
    setTasks(t ?? []);
  };

  useEffect(() => { load(); }, [id]);

  const addMilestone = async () => {
    if (!user || !id || !newMs.title) return;
    const { error } = await supabase.from("milestones").insert({
      user_id: user.id, project_id: id, title: newMs.title,
      due_date: newMs.due_date || null, amount: Number(newMs.amount),
      sort_order: milestones.length,
    });
    if (error) toast.error(error.message); else { setNewMs({ title: "", due_date: "", amount: 0 }); load(); }
  };

  const toggleMilestone = async (ms: any) => {
    const status = ms.status === "completed" ? "pending" : "completed";
    await supabase.from("milestones").update({
      status, completed_at: status === "completed" ? new Date().toISOString() : null,
    }).eq("id", ms.id);
    load();
  };

  const removeMilestone = async (msId: string) => {
    await supabase.from("milestones").delete().eq("id", msId);
    load();
  };

  const addTask = async () => {
    if (!user || !id || !newTask.title) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id, project_id: id,
      milestone_id: newTask.milestone_id || null,
      title: newTask.title, priority: newTask.priority as any,
    });
    if (error) toast.error(error.message); else { setNewTask({ title: "", milestone_id: "", priority: "medium" }); load(); }
  };

  const toggleTask = async (t: any) => {
    const status = t.status === "done" ? "todo" : "done";
    await supabase.from("tasks").update({
      status, completed_at: status === "done" ? new Date().toISOString() : null,
    }).eq("id", t.id);
    load();
  };

  const removeTask = async (tid: string) => {
    await supabase.from("tasks").delete().eq("id", tid);
    load();
  };

  if (!project) return <AppShell><div className="container py-12">Loading…</div></AppShell>;

  return (
    <AppShell>
      <div className="container py-8 md:py-12 space-y-8">
        <Button variant="ghost" size="sm" asChild><Link to="/projects"><ArrowLeft className="w-4 h-4" /> Back</Link></Button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: project.color }}>
            {project.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description || "—"} • Budget {formatINR(project.budget)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft">
            <div className="flex items-center gap-2 font-semibold mb-4"><Flag className="w-4 h-4 text-primary" /> Milestones</div>
            <div className="space-y-2 mb-4">
              {milestones.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                  <button onClick={() => toggleMilestone(m)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${m.status === "completed" ? "bg-status-paid border-status-paid" : "border-muted-foreground/40"}`}>
                    {m.status === "completed" && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${m.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.due_date ? formatDateIN(m.due_date) : "No date"} • {formatINR(m.amount)}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMilestone(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              {milestones.length === 0 && <div className="text-sm text-muted-foreground">No milestones yet.</div>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input className="col-span-2" placeholder="Milestone title" value={newMs.title} onChange={(e) => setNewMs({ ...newMs, title: e.target.value })} />
              <Input type="date" value={newMs.due_date} onChange={(e) => setNewMs({ ...newMs, due_date: e.target.value })} />
              <Input className="col-span-2" type="number" placeholder="Amount ₹" value={newMs.amount} onChange={(e) => setNewMs({ ...newMs, amount: Number(e.target.value) })} />
              <Button variant="wave" onClick={addMilestone}><Plus className="w-4 h-4" /> Add</Button>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft">
            <div className="font-semibold mb-4">Tasks</div>
            <div className="space-y-2 mb-4 max-h-96 overflow-auto">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                  <button onClick={() => toggleTask(t)} className={`w-5 h-5 rounded border-2 flex items-center justify-center ${t.status === "done" ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                    {t.status === "done" && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className={`flex-1 text-sm ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${t.priority === "high" ? "bg-status-overdue-bg text-status-overdue" : t.priority === "medium" ? "bg-status-pending-bg text-status-pending" : "bg-secondary text-muted-foreground"}`}>{t.priority}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeTask(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              {tasks.length === 0 && <div className="text-sm text-muted-foreground">No tasks yet.</div>}
            </div>
            <div className="space-y-2">
              <Input placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <Select value={newTask.milestone_id} onValueChange={(v) => setNewTask({ ...newTask, milestone_id: v })}>
                  <SelectTrigger className="col-span-1"><SelectValue placeholder="Milestone" /></SelectTrigger>
                  <SelectContent>{milestones.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="wave" onClick={addTask}><Plus className="w-4 h-4" /> Add</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ProjectDetail;
