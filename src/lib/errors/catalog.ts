import type { ErrorPageConfig, ErrorPageIcon } from "@/lib/errors/types";

export const errorPageCatalog: Record<string, ErrorPageConfig> = {
  "404": {
    code: "404",
    icon: "not-found",
    tone: "brand",
    title: "Página no encontrada",
    description:
      "Alguien desconectó esta ruta… o nunca existió. Vuelve al panel y sigue con tus finanzas.",
    hint: "404",
    primaryAction: { label: "Ir al dashboard", href: "/dashboard" },
    secondaryAction: { label: "Volver al inicio", href: "/", variant: "ghost" },
  },
  "401": {
    code: "401",
    icon: "unauthorized",
    tone: "warning",
    title: "Sesión requerida",
    description:
      "Esta puerta está cerrada. Inicia sesión para continuar.",
    hint: "401",
    primaryAction: { label: "Iniciar sesión", href: "/login" },
    secondaryAction: { label: "Crear cuenta", href: "/register", variant: "secondary" },
  },
  "403": {
    code: "403",
    icon: "forbidden",
    tone: "danger",
    title: "Acceso denegado",
    description:
      "No tienes permiso para entrar aquí. Si crees que es un error, avísanos.",
    hint: "403",
    primaryAction: { label: "Ir al dashboard", href: "/dashboard" },
    secondaryAction: { label: "Volver atrás", href: "/dashboard", variant: "ghost" },
  },
  "500": {
    code: "500",
    icon: "server",
    tone: "danger",
    title: "Error interno del servidor.",
    description:
      "Algo explotó por dentro. Tranquilo, ya estamos revisando qué pasó.",
    hint: "500",
    primaryAction: { label: "Reintentar", href: "/dashboard" },
    secondaryAction: { label: "Ir al inicio", href: "/", variant: "ghost" },
  },
  "502": {
    code: "502",
    icon: "gateway",
    tone: "warning",
    title: "Puerta de enlace caída",
    description:
      "El servidor no recibió una respuesta válida. Suele ser temporal.",
    hint: "502",
    primaryAction: { label: "Reintentar", href: "/dashboard" },
    secondaryAction: { label: "Estado del servicio", href: "/api/health", variant: "secondary" },
  },
  "503": {
    code: "503",
    icon: "maintenance",
    tone: "brand",
    title: "Estamos en mantenimiento",
    description:
      "Estamos afinando MyFinances. Volvemos en un ratito.",
    hint: "503",
    primaryAction: { label: "Reintentar", href: "/dashboard" },
    secondaryAction: { label: "Ir al inicio", href: "/", variant: "ghost" },
  },
  "429": {
    code: "429",
    icon: "rate-limit",
    tone: "warning",
    title: "Demasiadas solicitudes",
    description:
      "Calma, turbo. Espera unos segundos antes de intentar otra vez.",
    hint: "429",
    primaryAction: { label: "Volver al dashboard", href: "/dashboard" },
    secondaryAction: { label: "Reintentar", href: "/dashboard", variant: "secondary" },
  },
  offline: {
    code: "Offline",
    icon: "offline",
    tone: "neutral",
    title: "Sin conexión",
    description:
      "Parece que te quedaste sin internet. Revisa Wi‑Fi o datos móviles.",
    hint: "Offline",
    primaryAction: { label: "Reintentar", href: "/dashboard" },
    secondaryAction: { label: "Ir al inicio", href: "/", variant: "ghost" },
  },
  "session-expired": {
    code: "Sesión",
    icon: "session",
    tone: "warning",
    title: "Tu sesión expiró",
    description:
      "Por seguridad te desconectamos tras 30 minutos de inactividad.",
    hint: "Sesión",
    primaryAction: { label: "Iniciar sesión", href: "/login" },
    secondaryAction: { label: "Ir al inicio", href: "/", variant: "ghost" },
  },
  generic: {
    code: "Error",
    icon: "generic",
    tone: "danger",
    title: "Algo salió mal",
    description:
      "No pudimos completar la acción. Si persiste, inténtalo más tarde.",
    hint: "Error",
    primaryAction: { label: "Ir al dashboard", href: "/dashboard" },
    secondaryAction: { label: "Volver al inicio", href: "/", variant: "ghost" },
  },
};

export const errorPreviewCodes = Object.keys(errorPageCatalog);

export function getErrorPageConfig(code: string): ErrorPageConfig {
  return errorPageCatalog[code] ?? errorPageCatalog.generic;
}

export function isErrorPageIcon(value: string): value is ErrorPageIcon {
  return [
    "not-found",
    "unauthorized",
    "forbidden",
    "server",
    "maintenance",
    "rate-limit",
    "offline",
    "session",
    "gateway",
    "generic",
  ].includes(value);
}
