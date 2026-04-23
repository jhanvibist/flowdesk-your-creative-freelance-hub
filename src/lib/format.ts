// Indian-localized formatting helpers

export const formatINR = (value: number | string | null | undefined): string => {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  if (!isFinite(n as number)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n as number);
};

export const formatINRDecimal = (value: number | string | null | undefined): string => {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  if (!isFinite(n as number)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n as number);
};

// DD/MM/YYYY
export const formatDateIN = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const toDateInputValue = (value: string | Date | null | undefined): string => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
};

export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${yy}${mm}-${rand}`;
};
