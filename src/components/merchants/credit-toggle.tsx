import { FormToggle } from "@/components/ui/form-toggle";

type CreditToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function CreditToggle({ checked, onChange }: CreditToggleProps) {
  return (
    <FormToggle
      label="¿Permite pagos a crédito?"
      description="Activa si sueles pagar aquí con tarjeta de crédito."
      checked={checked}
      onChange={onChange}
      ariaLabel="Permite pagos a crédito"
    />
  );
}
