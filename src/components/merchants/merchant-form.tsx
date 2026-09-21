"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CreditToggle } from "@/components/merchants/credit-toggle";
import { LogoUploadField } from "@/components/merchants/logo-upload-field";
import type { MerchantRecord } from "@/lib/merchants/types";
import { merchantSchema, type MerchantInput } from "@/lib/validations/merchant";

type MerchantFormProps = {
  initialValues?: MerchantRecord | null;
  onSubmit: (values: MerchantInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const emptyValues: MerchantInput = {
  name: "",
  logoUrl: null,
  allowsCredit: false,
};

export function MerchantForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Registrar empresa",
}: MerchantFormProps) {
  const [values, setValues] = useState<MerchantInput>(
    initialValues
      ? {
          name: initialValues.name,
          logoUrl: initialValues.logoUrl,
          allowsCredit: initialValues.allowsCredit,
        }
      : emptyValues,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUrlField, setShowUrlField] = useState(
    Boolean(initialValues?.logoUrl && !initialValues.logoUrl.startsWith("data:")),
  );

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        logoUrl: initialValues.logoUrl,
        allowsCredit: initialValues.allowsCredit,
      });
      setShowUrlField(
        Boolean(
          initialValues.logoUrl && !initialValues.logoUrl.startsWith("data:"),
        ),
      );
    } else {
      setValues(emptyValues);
      setShowUrlField(false);
    }
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = merchantSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(parsed.data);
      if (!initialValues) {
        setValues(emptyValues);
        setShowUrlField(false);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos guardar la empresa",
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
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <LogoUploadField
          name={values.name}
          logoUrl={values.logoUrl ?? null}
          onChange={(logoUrl) =>
            setValues((current) => ({ ...current, logoUrl }))
          }
          onError={setError}
        />

        <div className="space-y-4">
          <div>
            <label
              htmlFor="merchant-name"
              className="mb-2 block text-sm font-medium"
            >
              Nombre de la empresa
            </label>
            <input
              id="merchant-name"
              type="text"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Ej. Netflix, Éxito, Uber..."
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>

          <CreditToggle
            checked={values.allowsCredit}
            onChange={(allowsCredit) =>
              setValues((current) => ({ ...current, allowsCredit }))
            }
          />

          <div>
            <button
              type="button"
              onClick={() => setShowUrlField((current) => !current)}
              className="text-xs font-semibold text-accent hover:underline"
            >
              {showUrlField
                ? "Ocultar URL del logo"
                : "O pegar URL del logo (opcional)"}
            </button>

            {showUrlField ? (
              <input
                id="merchant-logo-url"
                type="url"
                value={
                  values.logoUrl?.startsWith("data:") ? "" : values.logoUrl ?? ""
                }
                onChange={(event) => {
                  const nextValue = event.target.value.trim();
                  setValues((current) => ({
                    ...current,
                    logoUrl: nextValue || null,
                  }));
                }}
                placeholder="https://..."
                className="mt-2 h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
              />
            ) : null}
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
      </div>
    </form>
  );
}
