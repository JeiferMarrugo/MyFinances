"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { LoanPersonRecord } from "@/lib/loans/types";
import { loanPersonSchema } from "@/lib/validations/loan";
import { appConfirm } from "@/stores/confirm-dialog-store";

type LoanPersonsPanelProps = {
  persons: LoanPersonRecord[];
  onPersonsChange: (persons: LoanPersonRecord[]) => void;
};

export function LoanPersonsPanel({
  persons,
  onPersonsChange,
}: LoanPersonsPanelProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = loanPersonSchema.safeParse({
      name,
      notes: notes.trim() || null,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/loan-persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No pudimos registrar la persona");
        return;
      }

      onPersonsChange(
        [...persons, data.person].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      setNotes("");
    } catch {
      setError("No pudimos registrar la persona");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deletePerson(person: LoanPersonRecord) {
    const confirmed = await appConfirm({
      title: "¿Eliminar persona?",
      description: "Solo puedes eliminar personas sin préstamos asociados:",
      highlight: person.name,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    const response = await fetch(`/api/loan-persons/${person.id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "No pudimos eliminar la persona");
      return;
    }

    onPersonsChange(persons.filter((item) => item.id !== person.id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-border/70 bg-white p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold">Nueva persona</h3>
        <div>
          <label htmlFor="person-name" className="mb-2 block text-sm font-medium">
            Nombre
          </label>
          <input
            id="person-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="person-notes" className="mb-2 block text-sm font-medium">
            Notas (opcional)
          </label>
          <textarea
            id="person-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Agregar persona"}
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Personas registradas</h3>
        {persons.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Aún no tienes personas. Agrega a quienes suelen pedirte prestado.
          </p>
        ) : (
          <ul className="space-y-2">
            {persons.map((person) => (
              <li
                key={person.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-white p-4"
              >
                <div>
                  <p className="font-semibold">{person.name}</p>
                  {person.notes ? (
                    <p className="mt-1 text-sm text-muted-foreground">{person.notes}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => deletePerson(person)}
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
