"use client";

import Link from "next/link";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { MerchantAvatar } from "@/components/merchants/merchant-avatar";
import { RowActions } from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatAppDate, formatAppTime } from "@/lib/format/dates";
import { formatCurrency } from "@/lib/format/currency";
import { installmentFrequencyLabels } from "@/lib/transactions/constants";
import { findMerchantByName } from "@/lib/merchants/utils";
import type { MerchantRecord } from "@/lib/merchants/types";
import type { DisplayTransaction } from "@/lib/transactions/types";
import type { InstallmentFrequency } from "@/lib/transactions/constants";

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, DisplayTransaction>();

type TransactionsTableProps = {
  transactions: DisplayTransaction[];
  merchants?: MerchantRecord[];
  showActions?: boolean;
  onEdit?: (transaction: DisplayTransaction) => void;
  onDelete?: (transaction: DisplayTransaction) => void;
  onPayInstallment?: (transaction: DisplayTransaction) => void;
  onShowPaymentPlan?: (transaction: DisplayTransaction) => void;
  deletingId?: string | null;
  payingInstallmentId?: string | null;
  compact?: boolean;
};

export function TransactionsTable({
  transactions,
  merchants = [],
  showActions = false,
  onEdit,
  onDelete,
  onPayInstallment,
  onShowPaymentPlan,
  deletingId = null,
  payingInstallmentId = null,
  compact = false,
}: TransactionsTableProps) {
  const columns = helper.columns([
    helper.accessor("merchant", {
      header: "Movimiento",
      cell: (info) => {
        const merchantName = info.getValue();
        const row = info.row.original;
        const merchant =
          merchants.find((item) => item.id === row.merchantId) ??
          findMerchantByName(merchants, merchantName);

        return (
          <div className="flex items-center gap-3">
            <MerchantAvatar
              name={merchant?.name ?? merchantName}
              logoUrl={merchant?.logoUrl}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {merchantName}
              </p>
              <p className="text-xs text-muted-foreground">
                {info.row.original.category}
                {info.row.original.paidFromSavings ? (
                  <>
                    {" · "}
                    <span className="font-medium text-accent">Pagado con ahorros</span>
                    {info.row.original.includes4x1000 &&
                    info.row.original.gmfAmount > 0 ? (
                      <>
                        {" · "}
                        4x1000 {formatCurrency(info.row.original.gmfAmount)}
                      </>
                    ) : null}
                  </>
                ) : null}
                {info.row.original.installmentsCount &&
                info.row.original.installmentAmount ? (
                  <>
                    {" · "}
                    {info.row.original.installmentsCount} cuotas{" "}
                    {info.row.original.installmentFrequency
                      ? installmentFrequencyLabels[
                          info.row.original
                            .installmentFrequency as InstallmentFrequency
                        ].toLowerCase()
                      : "mensual"}{" "}
                    × {formatCurrency(info.row.original.installmentAmount)}
                    {row.creditAlreadyStarted ||
                    (row.pendingInstallments ?? 0) > 0 ? (
                      <>
                        {" · "}
                        {row.installmentsPaid}/{row.installmentsCount} pagadas
                        {(row.pendingInstallments ?? 0) > 0 ? (
                          <>
                            {" · "}
                            {row.pendingInstallments} pendiente
                            {row.pendingInstallments === 1 ? "" : "s"}
                          </>
                        ) : null}
                      </>
                    ) : null}
                    {row.nextInstallmentDueDate &&
                    row.nextInstallmentNumber &&
                    row.installmentsCount &&
                    (row.pendingInstallments ?? 0) > 0 ? (
                      <>
                        {" · "}
                        <span className="font-medium text-accent">
                          Próxima cuota ({row.nextInstallmentNumber}/
                          {row.installmentsCount}):{" "}
                          {formatAppDate(row.nextInstallmentDueDate)}
                        </span>
                      </>
                    ) : null}
                    {info.row.original.canPayInstallment ? (
                      <>
                        {" · "}
                        <span className="font-medium text-accent">
                          Pago en esta quincena
                        </span>
                      </>
                    ) : null}
                  </>
                ) : null}
              </p>
            </div>
          </div>
        );
      },
    }),
    ...(compact
      ? []
      : [
          helper.accessor("method", {
            header: "Método",
            cell: (info) => {
              const row = info.row.original;

              return (
                <div>
                  <p>{info.getValue()}</p>
                  {row.installmentsCount && row.installmentAmount ? (
                    <p className="text-xs text-muted-foreground">
                      Total: {formatCurrency(Math.abs(row.amount))}
                      {row.installmentFrequency ? (
                        <>
                          {" · "}
                          Cuota{" "}
                          {installmentFrequencyLabels[
                            row.installmentFrequency as InstallmentFrequency
                          ].toLowerCase()}
                        </>
                      ) : null}
                      {row.creditAlreadyStarted ? (
                        <>
                          {" · "}
                          {row.installmentsPaid}/{row.installmentsCount} pagadas
                        </>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              );
            },
          }),
        ]),
    helper.accessor("date", {
      header: "Fecha",
      cell: (info) => {
        const value = info.getValue();

        return (
          <div className="text-muted-foreground">
            <p>{formatAppDate(value)}</p>
            <p className="text-xs">{formatAppTime(value)}</p>
          </div>
        );
      },
    }),
    helper.accessor("amount", {
      header: "Monto",
      cell: (info) => {
        const value = info.getValue();
        const isIncome = value > 0;

        return (
          <span
            className={`font-semibold ${isIncome ? "text-success" : "text-foreground"}`}
          >
            {isIncome ? "+" : ""}
            {formatCurrency(Math.abs(value))}
          </span>
        );
      },
    }),
    ...(showActions
      ? [
          helper.display({
            id: "actions",
            header: "",
            cell: (info) => {
              const row = info.row.original;

              return (
                <div className="flex items-center justify-end gap-2">
                  {row.type === "expense" && onShowPaymentPlan ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShowPaymentPlan(row)}
                    >
                      Fecha de pago
                      {row.hasPaymentPlan && !row.paymentPlanConfirmed ? (
                        <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-accent" />
                      ) : null}
                    </Button>
                  ) : null}
                  {row.canPayInstallment && onPayInstallment ? (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => onPayInstallment(row)}
                      isLoading={payingInstallmentId === row.id}
                      loadingLabel="Confirmando..."
                    >
                      Confirmar pago
                    </Button>
                  ) : null}
                  <RowActions
                    onEdit={() => onEdit?.(row)}
                    onDelete={() => onDelete?.(row)}
                    isDeleting={deletingId === row.id}
                  />
                </div>
              );
            },
          }),
        ]
      : []),
  ]);

  const table = useTable({
    features,
    columns,
    data: transactions,
  });

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes movimientos registrados."
        description="Agrega tu primer ingreso o gasto para empezar a ver tu resumen real."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border text-left">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 font-medium text-muted-foreground"
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/70 last:border-0 hover:bg-muted/40"
            >
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3">
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type RecentTransactionsTableProps = {
  transactions: DisplayTransaction[];
  merchants?: MerchantRecord[];
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function RecentTransactionsTable({
  transactions,
  merchants = [],
  title = "Movimientos recientes",
  description = "Tus últimos ingresos y egresos registrados",
  emptyTitle = "Aún no tienes movimientos registrados.",
  emptyDescription = "Agrega tu primer ingreso o gasto para empezar a ver tu resumen real.",
}: RecentTransactionsTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link
          href="/dashboard/movimientos"
          className="text-sm font-semibold text-accent hover:underline"
        >
          Ver todos
        </Link>
      </div>

      <div className="mt-5">
        {transactions.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <TransactionsTable
            transactions={transactions}
            merchants={merchants}
            compact
          />
        )}
      </div>
    </div>
  );
}
