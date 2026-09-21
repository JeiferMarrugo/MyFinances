"use client";

import {
  Children,
  isValidElement,
  useMemo,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Select2, type Select2Option } from "@/components/ui/select2";

export type SelectOption = Select2Option;

type SelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children?: ReactNode;
  options?: Select2Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  searchable?: boolean;
};

function parseSelectChildren(children: ReactNode): Select2Option[] {
  const options: Select2Option[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const element = child as ReactElement<{
      value?: string;
      children?: ReactNode;
      disabled?: boolean;
    }>;

    if (element.props.disabled) return;
    if (element.type !== "option") return;

    options.push({
      value: String(element.props.value ?? ""),
      label: String(element.props.children ?? ""),
    });
  });

  return options;
}

function createSelectChangeEvent(value: string): ChangeEvent<HTMLSelectElement> {
  return {
    target: { value, name: "" },
    currentTarget: { value, name: "" },
  } as ChangeEvent<HTMLSelectElement>;
}

export function toSelectOptions(values: readonly string[]): Select2Option[] {
  return values.map((value) => ({ value, label: value }));
}

/**
 * Reemplazo de `<select>` nativo. Siempre renderiza Select2 con búsqueda.
 * Usa `<option>` hijos o la prop `options`.
 */
export function Select({
  id,
  name,
  value,
  onChange,
  children,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  disabled = false,
  className = "",
  emptyMessage = "No hay resultados",
  searchable = true,
}: SelectProps) {
  const resolvedOptions = useMemo(() => {
    if (options?.length) return options;
    return parseSelectChildren(children);
  }, [children, options]);

  return (
    <>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <Select2
        id={id}
        value={value}
        onChange={(nextValue) => onChange(createSelectChangeEvent(nextValue))}
        options={resolvedOptions}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        disabled={disabled}
        className={className}
        emptyMessage={emptyMessage}
        searchable={searchable}
      />
    </>
  );
}

export { Select as Select2 };
