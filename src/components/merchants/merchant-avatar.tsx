type MerchantAvatarProps = {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function MerchantAvatar({
  name,
  logoUrl,
  size = "md",
  className = "",
}: MerchantAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`rounded-xl object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-xl brand-gradient-soft font-bold text-accent ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
