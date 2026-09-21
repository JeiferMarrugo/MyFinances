"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { FormToggle } from "@/components/ui/form-toggle";
import type { BankRecord } from "@/lib/banks/types";
import { cardTypes } from "@/lib/cards/constants";
import type { CardRecord } from "@/lib/cards/types";
import { cardSchema, type CardInput } from "@/lib/validations/card";

type CardFormProps = {
  banks: BankRecord[];
  initialValues?: CardRecord | null;
  onSubmit: (values: CardInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const emptyValues: CardInput = {
  name: "",
  bankId: null,
  cardType: "debit",
  lastFourDigits: null,
  brandColor: null,
  isActive: true,
};

export function CardForm({
  banks,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Registrar tarjeta",
}: CardFormProps) {
  const [values, setValues] = useState<CardInput>(
    initialValues
      ? {
          name: initialValues.name,
          bankId: initialValues.bankId,
          cardType: initialValues.cardType,
          lastFourDigits: initialValues.lastFourDigits,
          brandColor: initialValues.brandColor,
          isActive: initialValues.isActive,
        }
      : emptyValues,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        bankId: initialValues.bankId,
        cardType: initialValues.cardType,
        lastFourDigits: initialValues.lastFourDigits,
        brandColor: initialValues.brandColor,
        isActive: initialValues.isActive,
      });
    } else {
      setValues(emptyValues);
    }
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = cardSchema.safeParse(values);
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
          : "No pudimos guardar la tarjeta",
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
        <div className="md:col-span-2">
          <label htmlFor="card-name" className="mb-2 block text-sm font-medium">
            Nombre de la tarjeta
          </label>
          <input
            id="card-name"
            type="text"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ej. Tarjeta débito principal"
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="card-bank" className="mb-2 block text-sm font-medium">
            Banco
          </label>
          <Select
            id="card-bank"
            value={values.bankId ?? ""}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                bankId: event.target.value || null,
              }))
            }
            searchPlaceholder="Buscar banco..."
          >
            <option value="">Sin banco asignado</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="card-type" className="mb-2 block text-sm font-medium">
            Tipo
          </label>
          <Select
            id="card-type"
            value={values.cardType}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                cardType: event.target.value as CardInput["cardType"],
              }))
            }
          >
            {cardTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="card-digits" className="mb-2 block text-sm font-medium">
            Últimos 4 dígitos (opcional)
          </label>
          <input
            id="card-digits"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={values.lastFourDigits ?? ""}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                lastFourDigits: event.target.value || null,
              }))
            }
            placeholder="1234"
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        <div>
          <FormToggle
            label="Tarjeta activa"
            description="Las tarjetas inactivas no se mostrarán como sugerencia."
            checked={values.isActive}
            onChange={(isActive) =>
              setValues((current) => ({ ...current, isActive }))
            }
            ariaLabel="Tarjeta activa"
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
