
-- ============================================================
-- RECURRING INVOICES
-- ============================================================
CREATE TYPE public.recurrence_interval AS ENUM ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly');

CREATE TABLE public.recurring_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID,
  template_name TEXT NOT NULL,
  interval public.recurrence_interval NOT NULL DEFAULT 'monthly',
  next_run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  amount NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recurring_invoices_select_own" ON public.recurring_invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recurring_invoices_insert_own" ON public.recurring_invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recurring_invoices_update_own" ON public.recurring_invoices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recurring_invoices_delete_own" ON public.recurring_invoices
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_recurring_invoices_next_run ON public.recurring_invoices(next_run_date) WHERE active = true;

-- ============================================================
-- INVOICE REMINDERS (history + scheduled)
-- ============================================================
CREATE TYPE public.reminder_type AS ENUM ('before_due', 'on_due', 'overdue');
CREATE TYPE public.reminder_status AS ENUM ('scheduled', 'sent', 'failed', 'cancelled');

CREATE TABLE public.invoice_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  reminder_type public.reminder_type NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status public.reminder_status NOT NULL DEFAULT 'scheduled',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_reminders_select_own" ON public.invoice_reminders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoice_reminders_insert_own" ON public.invoice_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoice_reminders_update_own" ON public.invoice_reminders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "invoice_reminders_delete_own" ON public.invoice_reminders
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_invoice_reminders_scheduled ON public.invoice_reminders(scheduled_at, status);

-- ============================================================
-- REMINDER SETTINGS (per user)
-- ============================================================
CREATE TABLE public.reminder_settings (
  user_id UUID NOT NULL PRIMARY KEY,
  auto_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  days_before_due INTEGER NOT NULL DEFAULT 3,
  overdue_cadence_days INTEGER NOT NULL DEFAULT 7,
  reply_to_email TEXT,
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminder_settings_select_own" ON public.reminder_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reminder_settings_insert_own" ON public.reminder_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reminder_settings_update_own" ON public.reminder_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- PROJECTS / MILESTONES / TASKS
-- ============================================================
CREATE TYPE public.project_status AS ENUM ('active', 'on_hold', 'completed', 'archived');
CREATE TYPE public.milestone_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'active',
  budget NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.milestone_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  amount NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestones_select_own" ON public.milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "milestones_insert_own" ON public.milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "milestones_update_own" ON public.milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "milestones_delete_own" ON public.milestones FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID,
  milestone_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- INVOICE ATTACHMENTS
-- ============================================================
CREATE TABLE public.invoice_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_attachments_select_own" ON public.invoice_attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoice_attachments_insert_own" ON public.invoice_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoice_attachments_delete_own" ON public.invoice_attachments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- CLIENT PORTAL TOKENS
-- ============================================================
CREATE TABLE public.client_portal_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_portal_tokens ENABLE ROW LEVEL SECURITY;

-- Owners manage their tokens; public access goes via edge function only
CREATE POLICY "client_portal_tokens_select_own" ON public.client_portal_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "client_portal_tokens_insert_own" ON public.client_portal_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "client_portal_tokens_update_own" ON public.client_portal_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "client_portal_tokens_delete_own" ON public.client_portal_tokens FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_client_portal_tokens_token ON public.client_portal_tokens(token);

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recurring_invoices_updated BEFORE UPDATE ON public.recurring_invoices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_reminder_settings_updated BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_milestones_updated BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- STORAGE: invoice-attachments bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-attachments', 'invoice-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can read their own invoice attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoice-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own invoice attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoice-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own invoice attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'invoice-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own invoice attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'invoice-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
