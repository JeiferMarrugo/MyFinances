"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { bankPresets } from "@/lib/banks/constants";
import type { BankRecord } from "@/lib/banks/types";
import { bankSchema, type BankInput } from "@/lib/validations/bank";

type BankFormProps = {
  initialValues?: BankRecord | null;
  onSubmit: (values: BankInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const emptyValues: BankInput = {
  name: "",
  logoUrl: null,
  brandColor: "#7c3aed",
};

export function BankForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Registrar banco",
}: BankFormProps) {
  const [values, setValues] = useState<BankInput>(
    initialValues
      ? {
          name: initialValues.name,
          logoUrl: initialValues.logoUrl,
          brandColor: initialValues.brandColor,
        }
      : emptyValues,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        logoUrl: initialValues.logoUrl,
        brandColor: initialValues.brandColor,
      });
    } else {
      setValues(emptyValues);
    }
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = bankSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(parsed.data);
      if (!initialValues) {
        setValues(emptyValues);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos guardar el banco",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="space-y-4">
        {!initialValues ? (
          <div>
            <p className="mb-2 text-sm font-medium">Sugerencias rápidas</p>
            <div className="flex flex-wrap gap-2">
              {bankPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setValues({
                      name: preset.name,
                      logoUrl: null,
                      brandColor: preset.brandColor,
                    })
                  }
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="bank-name" className="mb-2 block text-sm font-medium">
            Nombre del banco
          </label>
          <input
            id="bank-name"
            type="text"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ej. Bancolombia, Davivienda..."
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="bank-color" className="mb-2 block text-sm font-medium">
            Color de marca
          </label>
          <div className="flex items-center gap-3">
            <input
              id="bank-color"
              type="color"
              value={values.brandColor}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  brandColor: event.target.value,
                }))
              }
              className="h-11 w-16 cursor-pointer rounded-xl border border-border bg-white p-1"
            />
            <span className="text-sm text-muted-foreground">{values.brandColor}</span>
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            size="lg"
            className="min-w-[160px]"
            isLoading={isSubmitting}
            loadingLabel="Guardando..."
          >
            {submitLabel}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" size="lg" onClick={onCancel}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
