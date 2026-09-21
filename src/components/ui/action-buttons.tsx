import { Button, type ButtonProps } from "@/components/ui/button";
import { EditIcon, PauseIcon, PlayIcon, TrashIcon } from "@/components/ui/icons";

type ActionButtonProps = Omit<ButtonProps, "variant" | "icon">;

export function EditButton({
  children = "Editar",
  size = "sm",
  ...props
}: ActionButtonProps) {
  return (
    <Button variant="accent" size={size} icon={<EditIcon />} {...props}>
      {children}
    </Button>
  );
}

export function DeleteButton({
  children = "Eliminar",
  loadingLabel = "Eliminando...",
  size = "sm",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant="destructive-soft"
      size={size}
      icon={<TrashIcon />}
      loadingLabel={loadingLabel}
      {...props}
    >
      {children}
    </Button>
  );
}

type ToggleActiveButtonProps = ActionButtonProps & {
  isActive: boolean;
};

export function ToggleActiveButton({
  isActive,
  children,
  size = "sm",
  ...props
}: ToggleActiveButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      icon={isActive ? <PauseIcon /> : <PlayIcon />}
      {...props}
    >
      {children ?? (isActive ? "Pausar" : "Activar")}
    </Button>
  );
}

type RowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  deleteLoadingLabel?: string;
  className?: string;
};

export function RowActions({
  onEdit,
  onDelete,
  isDeleting = false,
  editLabel = "Editar",
  deleteLabel = "Eliminar",
  deleteLoadingLabel = "Eliminando...",
  className = "",
}: RowActionsProps) {
  if (!onEdit && !onDelete) return null;

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      {onEdit ? (
        <EditButton size="sm" onClick={onEdit}>
          {editLabel}
        </EditButton>
      ) : null}
      {onDelete ? (
        <DeleteButton
          size="sm"
          onClick={onDelete}
          isLoading={isDeleting}
          loadingLabel={deleteLoadingLabel}
        >
          {deleteLabel}
        </DeleteButton>
      ) : null}
    </div>
  );
}
