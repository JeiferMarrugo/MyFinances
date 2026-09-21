"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { quarterStartMonthOptions } from "@/lib/finance-settings/constants";
import { getCurrentPeriodSummaries } from "@/lib/finance-settings/periods";
import type { FinanceSettingsRecord } from "@/lib/finance-settings/types";
import {
  financeSettingsSchema,
  type FinanceSettingsInput,
} from "@/lib/validations/finance-settings";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";

type FinancePeriodSettingsProps = {
  initialSettings: FinanceSettingsRecord;
};

function formatPeriodRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function DayInput({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={1}
        max={31}
        value={value ?? ""}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === "" ? null : Number(next));
        }}
        className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
      />
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function FinancePeriodSettings({
  initialSettings,
}: FinancePeriodSettingsProps) {
  const [values, setValues] = useState<FinanceSettingsInput>({
    biweeklyFirstStartDay: initialSettings.biweeklyFirstStartDay,
    biweeklyFirstEndDay: initialSettings.biweeklyFirstEndDay,
    biweeklySecondStartDay: initialSettings.biweeklySecondStartDay,
    biweeklySecondEndDay: initialSettings.biweeklySecondEndDay,
    monthStartDay: initialSettings.monthStartDay,
    quarterStartMonth: initialSettings.quarterStartMonth,
    yearStartMonth: initialSettings.yearStartMonth,
    yearStartDay: initialSettings.yearStartDay,
    installmentDueOffset: initialSettings.installmentDueOffset,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPeriods = useMemo(
    () => getCurrentPeriodSummaries(new Date(), values),
    [values],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = financeSettingsSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario");
      return;
    }

    setIsSubmitting(true);
    const toastId = appToast.loading(toastCopy.financeSettings.loadingUpdate);

    try {
      const response = await fetch("/api/finance-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? toastCopy.financeSettings.errorDescription,
        );
      }

      appToast.success(toastCopy.financeSettings.updateSuccessTitle, {
        id: toastId,
        description: toastCopy.financeSettings.updateSuccessDescription,
      });
    } catch (submitError) {
      appToast.error(toastCopy.financeSettings.errorTitle, {
        id: toastId,
        description:
          submitError instanceof Error
            ? submitError.message
            : toastCopy.financeSettings.errorDescription,
      });
      setError(
        submitError instanceof Error
          ? submitError.message
          : toastCopy.financeSettings.errorDescription,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="brand-card-accent rounded-2xl border border-border bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Periodos de facturación
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            La fecha del gasto es el día de la compra. Estos rangos definen en qué
            quincena, mes, trimestre o año se contabiliza cada cuota de crédito.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold brand-text">Quincena 1</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <DayInput
                id="biweekly-first-start"
                label="Día de inicio"
                value={values.biweeklyFirstStartDay}
                onChange={(day) =>
                  day != null &&
                  setValues((current) => ({
                    ...current,
                    biweeklyFirstStartDay: day,
                  }))
                }
              />
              <DayInput
                id="biweekly-first-end"
                label="Día de fin"
                value={values.biweeklyFirstEndDay}
                onChange={(day) =>
                  day != null &&
                  setValues((current) => ({
                    ...current,
                    biweeklyFirstEndDay: day,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold brand-text">Quincena 2</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <DayInput
                id="biweekly-second-start"
                label="Día de inicio"
                value={values.biweeklySecondStartDay}
                onChange={(day) =>
                  day != null &&
                  setValues((current) => ({
                    ...current,
                    biweeklySecondStartDay: day,
                  }))
                }
              />
              <DayInput
                id="biweekly-second-end"
                label="Día de fin"
                value={values.biweeklySecondEndDay}
                onChange={(day) =>
                  setValues((current) => ({
                    ...current,
                    biweeklySecondEndDay: day,
                  }))
                }
                hint="Déjalo vacío para usar el último día del mes."
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold brand-text">Mes</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <DayInput
                id="month-start-day"
                label="Día de inicio del mes"
                value={values.monthStartDay}
                onChange={(day) =>
                  day != null &&
                  setValues((current) => ({ ...current, monthStartDay: day }))
                }
                hint="Usa 1 para mes calendario. Ej: 26 si tu mes va del 26 al 25."
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold brand-text">Trimestre</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="quarter-start-month"
                  className="mb-2 block text-sm font-medium"
                >
                  Mes de inicio del primer trimestre
                </label>
                <Select
                  id="quarter-start-month"
                  value={String(values.quarterStartMonth)}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      quarterStartMonth: Number(event.target.value),
                    }))
                  }
                  searchable={false}
                >
                  {quarterStartMonthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold brand-text">Año</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="year-start-month"
                  className="mb-2 block text-sm font-medium"
                >
                  Mes de inicio del año
                </label>
                <Select
                  id="year-start-month"
                  value={String(values.yearStartMonth)}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      yearStartMonth: Number(event.target.value),
                    }))
                  }
                  searchable={false}
                >
                  {quarterStartMonthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label.split(" (")[0]}
                    </option>
                  ))}
                </Select>
              </div>
              <DayInput
                id="year-start-day"
                label="Día de inicio del año"
                value={values.yearStartDay}
                onChange={(day) =>
                  day != null &&
                  setValues((current) => ({ ...current, yearStartDay: day }))
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold brand-text">Cuotas de crédito</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="installment-due-offset"
                  className="mb-2 block text-sm font-medium"
                >
                  Primera cuota vence en
                </label>
                <Select
                  id="installment-due-offset"
                  value={String(values.installmentDueOffset)}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      installmentDueOffset: Number(event.target.value),
                    }))
                  }
                  searchable={false}
                >
                  <option value="0">El mismo periodo de la compra</option>
                  <option value="1">El periodo siguiente</option>
                  <option value="2">Dos periodos después</option>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ejemplo: compra en quincena 1 y primera cuota en quincena 2.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-secondary/30 p-6">
        <h3 className="text-sm font-semibold text-foreground">
          Periodos actuales según tu configuración
        </h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-white px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Quincena actual
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {currentPeriods.biweekly.label}:{" "}
              {formatPeriodRange(
                currentPeriods.biweekly.start,
                currentPeriods.biweekly.end,
              )}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-white px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Mes actual
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formatPeriodRange(
                currentPeriods.month.start,
                currentPeriods.month.end,
              )}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-white px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Trimestre actual
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {currentPeriods.quarter.label}:{" "}
              {formatPeriodRange(
                currentPeriods.quarter.start,
                currentPeriods.quarter.end,
              )}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-white px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Año actual
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formatPeriodRange(
                currentPeriods.year.start,
                currentPeriods.year.end,
              )}
            </dd>
          </div>
        </dl>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar periodos"}
      </Button>
    </form>
  );
}
