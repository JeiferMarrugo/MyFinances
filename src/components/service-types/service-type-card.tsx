"use client";

import type { ServiceTypeRecord } from "@/lib/service-types/types";
import { DeleteButton, EditButton } from "@/components/ui/action-buttons";

type ServiceTypeCardProps = {
  serviceType: ServiceTypeRecord;
  onEdit: (serviceType: ServiceTypeRecord) => void;
  onDelete: (serviceType: ServiceTypeRecord) => void;
  isDeleting?: boolean;
};

export function ServiceTypeCard({
  serviceType,
  onEdit,
  onDelete,
  isDeleting = false,
}: ServiceTypeCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
          style={{ backgroundColor: serviceType.color }}
        >
          {serviceType.name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{serviceType.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {serviceType.category}
          </p>
          {serviceType.description ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {serviceType.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <EditButton
          size="md"
          className="flex-1"
          onClick={() => onEdit(serviceType)}
        />
        <DeleteButton
          size="md"
          className="flex-1"
          onClick={() => onDelete(serviceType)}
          isLoading={isDeleting}
        />
      </div>
    </article>
  );
}
