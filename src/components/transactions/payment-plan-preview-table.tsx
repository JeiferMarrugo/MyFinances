import { formatAppDate } from "@/lib/format/dates";
import { formatCurrency } from "@/lib/format/currency";
import type { CreditPaymentPlanPreviewItem } from "@/lib/transactions/installments";

type PaymentPlanPreviewTableProps = {
  items: CreditPaymentPlanPreviewItem[];
  title?: string;
  description?: string;
};

export function PaymentPlanPreviewTable({
  items,
  title = "Plan de pago",
  description = "Fechas calculadas según la fecha del movimiento y las cuotas configuradas.",
}: PaymentPlanPreviewTableProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white/70">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-3 py-2.5 font-medium text-muted-foreground">Cuota</th>
              <th className="px-3 py-2.5 font-medium text-muted-foreground">
                Fecha de pago
              </th>
              <th className="px-3 py-2.5 font-medium text-muted-foreground">Monto</th>
              <th className="px-3 py-2.5 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.installmentIndex}
                className="border-b border-border/70 last:border-0"
              >
                <td className="px-3 py-2.5 font-medium">
                  {item.installmentNumber}/{items.length}
                </td>
                <td className="px-3 py-2.5">{formatAppDate(item.paymentDate)}</td>
                <td className="px-3 py-2.5">{formatCurrency(item.amount)}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={
                      item.status === "paid"
                        ? "font-medium text-success"
                        : "text-muted-foreground"
                    }
                  >
                    {item.status === "paid" ? "Pagada" : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
