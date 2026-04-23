-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  gstin text,
  pan text,
  phone text,
  default_currency text not null default 'INR',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- updated_at trigger function (shared)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- CLIENTS
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  gstin text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.clients enable row level security;
create index clients_user_id_idx on public.clients(user_id);

create policy "clients_select_own" on public.clients for select using (auth.uid() = user_id);
create policy "clients_insert_own" on public.clients for insert with check (auth.uid() = user_id);
create policy "clients_update_own" on public.clients for update using (auth.uid() = user_id);
create policy "clients_delete_own" on public.clients for delete using (auth.uid() = user_id);

create trigger clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();

-- WORK LOGS
create table public.work_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project text,
  work_date date not null default current_date,
  hours numeric(8,2) not null default 0,
  hourly_rate numeric(12,2) not null default 0,
  description text,
  billed boolean not null default false,
  invoice_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.work_logs enable row level security;
create index work_logs_user_id_idx on public.work_logs(user_id);
create index work_logs_client_id_idx on public.work_logs(client_id);

create policy "work_logs_select_own" on public.work_logs for select using (auth.uid() = user_id);
create policy "work_logs_insert_own" on public.work_logs for insert with check (auth.uid() = user_id);
create policy "work_logs_update_own" on public.work_logs for update using (auth.uid() = user_id);
create policy "work_logs_delete_own" on public.work_logs for delete using (auth.uid() = user_id);

create trigger work_logs_updated_at before update on public.work_logs
for each row execute function public.set_updated_at();

-- INVOICE STATUS
create type public.invoice_status as enum ('draft','sent','paid','partial','overdue');

-- INVOICES
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number text not null,
  issue_date date not null default current_date,
  due_date date not null default (current_date + interval '15 days'),
  subtotal numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  amount_paid numeric(14,2) not null default 0,
  status public.invoice_status not null default 'draft',
  notes text,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, invoice_number)
);
alter table public.invoices enable row level security;
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_client_id_idx on public.invoices(client_id);
create index invoices_status_idx on public.invoices(status);

create policy "invoices_select_own" on public.invoices for select using (auth.uid() = user_id);
create policy "invoices_insert_own" on public.invoices for insert with check (auth.uid() = user_id);
create policy "invoices_update_own" on public.invoices for update using (auth.uid() = user_id);
create policy "invoices_delete_own" on public.invoices for delete using (auth.uid() = user_id);

create trigger invoices_updated_at before update on public.invoices
for each row execute function public.set_updated_at();

-- INVOICE ITEMS
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  rate numeric(12,2) not null default 0,
  amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
alter table public.invoice_items enable row level security;
create index invoice_items_invoice_id_idx on public.invoice_items(invoice_id);

create policy "invoice_items_select_own" on public.invoice_items for select using (auth.uid() = user_id);
create policy "invoice_items_insert_own" on public.invoice_items for insert with check (auth.uid() = user_id);
create policy "invoice_items_update_own" on public.invoice_items for update using (auth.uid() = user_id);
create policy "invoice_items_delete_own" on public.invoice_items for delete using (auth.uid() = user_id);

-- PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(14,2) not null,
  payment_date date not null default current_date,
  method text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create index payments_user_id_idx on public.payments(user_id);
create index payments_invoice_id_idx on public.payments(invoice_id);

create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);
create policy "payments_insert_own" on public.payments for insert with check (auth.uid() = user_id);
create policy "payments_update_own" on public.payments for update using (auth.uid() = user_id);
create policy "payments_delete_own" on public.payments for delete using (auth.uid() = user_id);

-- Trigger: when payment inserted, update invoice amount_paid + status
create or replace function public.recalc_invoice_after_payment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  inv public.invoices%rowtype;
  total_paid numeric(14,2);
begin
  select coalesce(sum(amount), 0) into total_paid from public.payments where invoice_id = new.invoice_id;
  select * into inv from public.invoices where id = new.invoice_id;
  update public.invoices
    set amount_paid = total_paid,
        status = case
          when total_paid >= inv.total and inv.total > 0 then 'paid'::public.invoice_status
          when total_paid > 0 then 'partial'::public.invoice_status
          else inv.status
        end
    where id = new.invoice_id;
  return new;
end; $$;

create trigger payments_after_insert
after insert on public.payments
for each row execute function public.recalc_invoice_after_payment();