create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

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