export const appBrand = {
  name: "MyFinances",
  tagline: "Finanzas personales",
  logoLetter: "M",
  description:
    "Controla tus ingresos, gastos y presupuesto personal en un solo lugar.",
} as const;

export const appLocale = {
  currency: "COP",
  locale: "es-CO",
} as const;

export const authCopy = {
  login: {
    eyebrow: "Acceso personal",
    title: "Bienvenido de vuelta",
    description:
      "Ingresa para ver tu balance, registrar movimientos y revisar tus finanzas del mes.",
    quickAccessTitle: "Acceso rápido",
    quickAccessDescription: "Touch ID, Face ID o Passkey",
    quickAccessAction: "Usar",
    divider: "O con tu correo y contraseña",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@correo.com",
    passwordLabel: "Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    rememberDevice: "Recordar este dispositivo por 30 días",
    secureBadge: "Conexión segura",
    submit: "Iniciar sesión →",
    submitLoading: "Iniciando sesión...",
    socialTitle: "También puedes entrar con",
    socialGoogle: "Google",
    socialApple: "Apple",
    socialSoon: "Próximamente",
    footerPrompt: "¿No tienes cuenta?",
    footerLink: "Regístrate",
    securityNote: "Tus datos están cifrados y protegidos.",
    panelEyebrow: "Tu espacio financiero",
    panelTitle: "Organiza tus ingresos y gastos en un solo lugar.",
    panelDescription:
      "Lleva el control de tu dinero con claridad, sin complicaciones.",
    panelFeatures: [
      {
        title: "Movimientos",
        description: "Registra ingresos, gastos y compras a crédito.",
      },
      {
        title: "Periodos",
        description: "Quincenas, meses y cuotas calculadas a tu medida.",
      },
      {
        title: "Dashboard",
        description: "Balance, tendencias y presupuestos en un vistazo.",
      },
    ],
  },
  register: {
    eyebrow: "Crear cuenta",
    title: "Empieza a controlar tus finanzas",
    description:
      "Crea tu cuenta gratis y comienza a registrar tus ingresos y egresos.",
    submit: "Crear mi cuenta →",
    submitLoading: "Creando cuenta...",
    footerPrompt: "¿Ya tienes cuenta?",
    footerLink: "Iniciar sesión",
    panelEyebrow: "Finanzas personales",
    panelTitle: "Simple, claro y solo para ti.",
    panelDescription:
      "Tus datos son privados. Administra tu dinero a tu ritmo.",
  },
} as const;

export const homeCopy = {
  title: "Tu dinero, bajo control",
  description:
    "Registra ingresos y egresos, visualiza tu balance y toma mejores decisiones con tu dinero personal.",
  features: ["Ingresos", "Gastos", "Presupuestos", "Reportes"],
  cta: "Iniciar sesión",
} as const;

export const dashboardCopy = {
  eyebrow: "Panel principal",
  welcome: "Bienvenido a tu panel de finanzas personales.",
} as const;
