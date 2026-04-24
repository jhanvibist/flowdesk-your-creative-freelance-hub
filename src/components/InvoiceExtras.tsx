import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Trash2, FileIcon, Link2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Attachment {
  id: string; file_name: string; mime_type: string | null; file_size: number; storage_path: string;
}

export const InvoiceAttachmentsCard = ({ invoiceId }: { invoiceId: string }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("invoice_attachments").select("*").eq("invoice_id", invoiceId).order("created_at", { ascending: false });
    setItems((data as Attachment[]) ?? []);
  };

  useEffect(() => { load(); }, [invoiceId]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${invoiceId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("invoice-attachments").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { error: dbErr } = await supabase.from("invoice_attachments").insert({
      user_id: user.id, invoice_id: invoiceId, file_name: file.name,
      mime_type: file.type, file_size: file.size, storage_path: path,
    });
    setUploading(false);
    if (dbErr) toast.error(dbErr.message); else { toast.success("File uploaded"); load(); }
  };

  const download = async (a: Attachment) => {
    const { data } = await supabase.storage.from("invoice-attachments").createSignedUrl(a.storage_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const remove = async (a: Attachment) => {
    await supabase.storage.from("invoice-attachments").remove([a.storage_path]);
    await supabase.from("invoice_attachments").delete().eq("id", a.id);
    load();
  };

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-soft p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2"><Paperclip className="w-4 h-4 text-primary" /> Attachments</h3>
        <Button variant="wave-outline" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
          <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileInput} type="file" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
        />
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">No files yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
              <FileIcon className="w-4 h-4 text-primary flex-shrink-0" />
              <button onClick={() => download(a)} className="flex-1 text-left text-sm truncate hover:underline">{a.file_name}</button>
              <span className="text-xs text-muted-foreground">{(a.file_size / 1024).toFixed(1)} KB</span>
              <Button variant="ghost" size="icon" onClick={() => remove(a)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ClientPortalCard = ({ invoiceId }: { invoiceId: string }) => {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("client_portal_tokens").select("token").eq("invoice_id", invoiceId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setToken(data?.token ?? null);
  };

  useEffect(() => { load(); }, [invoiceId]);

  const generate = async () => {
    if (!user) return;
    setCreating(true);
    const newToken = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 30);
    const { error } = await supabase.from("client_portal_tokens").insert({
      user_id: user.id, invoice_id: invoiceId, token: newToken, expires_at: expiresAt.toISOString(),
    });
    setCreating(false);
    if (error) toast.error(error.message); else { setToken(newToken); toast.success("Share link created"); }
  };

  const link = token ? `${window.location.origin}/portal/invoice/${token}` : "";

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-soft p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Client portal link</h3>
        {!token && <Button variant="wave-outline" size="sm" disabled={creating} onClick={generate}>{creating ? "…" : "Generate"}</Button>}
      </div>
      {token ? (
        <div className="flex items-center gap-2">
          <Input value={link} readOnly className="text-xs" />
          <Button variant="ghost" size="icon" onClick={copy}>{copied ? <Check className="w-4 h-4 text-status-paid" /> : <Copy className="w-4 h-4" />}</Button>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Share a secure link clients can open without an account.</div>
      )}
    </div>
  );
};
