type ManagerPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ManagerPageHeader({
  eyebrow,
  title,
  description,
}: ManagerPageHeaderProps) {
  return (
    <div>
      <p className="brand-text text-sm font-semibold">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
