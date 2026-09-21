"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { serviceTypePresets } from "@/lib/service-types/constants";
import type { ServiceTypeRecord } from "@/lib/service-types/types";
import { expenseCategories } from "@/lib/transactions/constants";
import {
  serviceTypeSchema,
  type ServiceTypeInput,
} from "@/lib/validations/service-type";

type ServiceTypeFormProps = {
  initialValues?: ServiceTypeRecord | null;
  onSubmit: (values: ServiceTypeInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const emptyValues: ServiceTypeInput = {
  name: "",
  category: expenseCategories[0],
  description: null,
  color: "#7c3aed",
};

export function ServiceTypeForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Registrar tipo de servicio",
}: ServiceTypeFormProps) {
  const [values, setValues] = useState<ServiceTypeInput>(
    initialValues
      ? {
          name: initialValues.name,
          category: initialValues.category as ServiceTypeInput["category"],
          description: initialValues.description,
          color: initialValues.color,
        }
      : emptyValues,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        category: initialValues.category as ServiceTypeInput["category"],
        description: initialValues.description,
        color: initialValues.color,
      });
    } else {
      setValues(emptyValues);
    }
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = serviceTypeSchema.safeParse(values);
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
          : "No pudimos guardar el tipo de servicio",
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
      <div className="grid gap-4 md:grid-cols-2">
        {!initialValues ? (
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium">Sugerencias rápidas</p>
            <div className="flex flex-wrap gap-2">
              {serviceTypePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setValues({
                      name: preset.name,
                      category: preset.category as ServiceTypeInput["category"],
                      description: null,
                      color: preset.color,
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
          <label
            htmlFor="service-type-name"
            className="mb-2 block text-sm font-medium"
          >
            Nombre del servicio
          </label>
          <input
            id="service-type-name"
            type="text"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ej. Internet, Luz, Gas..."
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="service-type-category"
            className="mb-2 block text-sm font-medium"
          >
            Categoría de gasto
          </label>
          <Select
            id="service-type-category"
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value as ServiceTypeInput["category"],
              }))
            }
            searchPlaceholder="Buscar categoría..."
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label
            htmlFor="service-type-color"
            className="mb-2 block text-sm font-medium"
          >
            Color
          </label>
          <div className="flex items-center gap-3">
            <input
              id="service-type-color"
              type="color"
              value={values.color}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  color: event.target.value,
                }))
              }
              className="h-11 w-16 cursor-pointer rounded-xl border border-border bg-white p-1"
            />
            <span className="text-sm text-muted-foreground">{values.color}</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="service-type-description"
            className="mb-2 block text-sm font-medium"
          >
            Descripción (opcional)
          </label>
          <input
            id="service-type-description"
            type="text"
            value={values.description ?? ""}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value || null,
              }))
            }
            placeholder="Detalle del servicio..."
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        {error ? (
          <p className="md:col-span-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap gap-3">
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
