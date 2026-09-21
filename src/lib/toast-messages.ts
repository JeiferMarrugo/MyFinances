export const toastCopy = {
  login: {
    loading: "Verificando tus credenciales...",
    successTitle: "¡Sesión iniciada!",
    successDescription: "Bienvenido de vuelta a MyFinances.",
    errorTitle: "No pudimos iniciar sesión",
    connectionError: "Revisa tu conexión e inténtalo de nuevo.",
    validationError: "Revisa los datos del formulario.",
  },
  register: {
    loading: "Creando tu cuenta...",
    successTitle: "¡Cuenta creada!",
    successDescription: "Ya puedes empezar a registrar tus finanzas.",
    errorTitle: "No pudimos crear la cuenta",
    connectionError: "Revisa tu conexión e inténtalo de nuevo.",
    validationError: "Revisa los datos del formulario.",
  },
  logout: {
    loading: "Cerrando sesión...",
    successTitle: "Sesión cerrada",
    successDescription: "Hasta pronto. Vuelve cuando quieras.",
    errorTitle: "Error al cerrar sesión",
  },
  dashboard: {
    welcomeTitle: "Panel listo",
    welcomeDescription: (name: string) => `Hola ${name}, empecemos con tus finanzas.`,
  },
  info: {
    comingSoonTitle: "Próximamente",
    comingSoonDescription: "Esta opción estará disponible muy pronto.",
  },
  auth: {
    googleNotConfiguredTitle: "Google no configurado",
    googleNotConfiguredDescription:
      "Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en tu .env.local.",
    googleErrorTitle: "No pudimos conectar con Google",
    googleErrorDescription: "Inténtalo de nuevo en unos segundos.",
    googleAccountNotLinkedTitle: "Cuenta no vinculada",
    googleAccountNotLinkedDescription:
      "Este correo ya tiene cuenta con contraseña. Inicia sesión con correo y vincula Google en Configuración.",
  },
  passkey: {
    signInLoading: "Verificando tu passkey...",
    signInErrorTitle: "No pudimos usar el acceso rápido",
    notRegisteredDescription:
      "Primero inicia sesión con correo o Google y registra tu dispositivo en Configuración.",
    registerSuccessTitle: "Passkey registrado",
    registerSuccessDescription:
      "Ya puedes entrar con Touch ID, Face ID o llave de acceso.",
    registerErrorTitle: "No pudimos registrar el passkey",
    listErrorTitle: "No pudimos cargar tus passkeys",
    deleteSuccessTitle: "Passkey eliminado",
    deleteSuccessDescription: "Ese dispositivo ya no podrá acceder con passkey.",
    deleteErrorTitle: "No pudimos eliminar el passkey",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  merchants: {
    loadingCreate: "Registrando empresa...",
    loadingUpdate: "Actualizando empresa...",
    loadingDelete: "Eliminando empresa...",
    createSuccessTitle: "Empresa registrada",
    createSuccessDescription: (name: string) =>
      `${name} ya está en tu catálogo personal.`,
    updateSuccessTitle: "Empresa actualizada",
    updateSuccessDescription: (name: string) =>
      `Los datos de ${name} se guardaron correctamente.`,
    deleteSuccessTitle: "Empresa eliminada",
    deleteSuccessDescription: (name: string) =>
      `${name} fue removida de tu catálogo.`,
    errorTitle: "No pudimos guardar la empresa",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  transactions: {
    loadingCreate: "Guardando movimiento...",
    loadingUpdate: "Actualizando movimiento...",
    loadingDelete: "Eliminando movimiento...",
    loadingPayInstallment: "Confirmando pago de cuota...",
    payInstallmentSuccessTitle: "Pago confirmado",
    payInstallmentSuccessDescription: (title: string, paid: number, total: number) =>
      `${title}: cuota ${paid}/${total} registrada en tus gastos del periodo.`,
    incomeSuccessTitle: "Ingreso registrado",
    expenseSuccessTitle: "Gasto registrado",
    successDescription: (title: string) =>
      `${title} se agregó a tus movimientos.`,
    updateSuccessTitle: "Movimiento actualizado",
    updateSuccessDescription: (title: string) =>
      `${title} se guardó correctamente.`,
    deleteSuccessTitle: "Movimiento eliminado",
    deleteSuccessDescription: (title: string) =>
      `${title} fue removido de tu historial.`,
    errorTitle: "No pudimos guardar el movimiento",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  recurringIncomes: {
    loadingCreate: "Guardando ingreso recurrente...",
    loadingDelete: "Eliminando ingreso recurrente...",
    createSuccessTitle: "Ingreso recurrente configurado",
    createSuccessDescription: (title: string) =>
      `${title} se registrará automáticamente.`,
    deleteSuccessTitle: "Ingreso recurrente eliminado",
    deleteSuccessDescription: (title: string) =>
      `${title} ya no se registrará automáticamente.`,
    autoRegisteredTitle: "Ingresos automáticos registrados",
    autoRegisteredDescription: (count: number, titles: string[]) => {
      if (count === 1) {
        return `${titles[0]} se agregó a tus movimientos.`;
      }

      return `Se registraron ${count} ingresos recurrentes pendientes.`;
    },
    errorTitle: "No pudimos guardar el ingreso recurrente",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  recurringExpenses: {
    loadingCreate: "Guardando gasto fijo...",
    loadingDelete: "Eliminando gasto fijo...",
    createSuccessTitle: "Gasto fijo configurado",
    createSuccessDescription: (title: string) =>
      `${title} quedó en tu presupuesto mensual.`,
    deleteSuccessTitle: "Gasto fijo eliminado",
    deleteSuccessDescription: (title: string) =>
      `${title} ya no estará en tu presupuesto mensual.`,
    autoRegisteredTitle: "Gastos fijos registrados",
    autoRegisteredDescription: (count: number, titles: string[]) => {
      if (count === 1) {
        return `${titles[0]} se agregó a tus movimientos.`;
      }

      return `Se registraron ${count} gastos fijos pendientes.`;
    },
    errorTitle: "No pudimos guardar el gasto fijo",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  banks: {
    loadingCreate: "Registrando banco...",
    loadingUpdate: "Actualizando banco...",
    loadingDelete: "Eliminando banco...",
    createSuccessTitle: "Banco registrado",
    createSuccessDescription: (name: string) =>
      `${name} ya está en tu catálogo de bancos.`,
    updateSuccessTitle: "Banco actualizado",
    updateSuccessDescription: (name: string) =>
      `Los datos de ${name} se guardaron correctamente.`,
    deleteSuccessTitle: "Banco eliminado",
    deleteSuccessDescription: (name: string) =>
      `${name} fue removido de tu catálogo.`,
    errorTitle: "No pudimos guardar el banco",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  cards: {
    loadingCreate: "Registrando tarjeta...",
    loadingUpdate: "Actualizando tarjeta...",
    loadingDelete: "Eliminando tarjeta...",
    createSuccessTitle: "Tarjeta registrada",
    createSuccessDescription: (name: string) =>
      `${name} ya está en tu catálogo.`,
    updateSuccessTitle: "Tarjeta actualizada",
    updateSuccessDescription: (name: string) =>
      `Los datos de ${name} se guardaron correctamente.`,
    deleteSuccessTitle: "Tarjeta eliminada",
    deleteSuccessDescription: (name: string) =>
      `${name} fue removida de tu catálogo.`,
    errorTitle: "No pudimos guardar la tarjeta",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  serviceTypes: {
    loadingCreate: "Registrando tipo de servicio...",
    loadingUpdate: "Actualizando tipo de servicio...",
    loadingDelete: "Eliminando tipo de servicio...",
    createSuccessTitle: "Tipo de servicio registrado",
    createSuccessDescription: (name: string) =>
      `${name} ya está en tu catálogo.`,
    updateSuccessTitle: "Tipo de servicio actualizado",
    updateSuccessDescription: (name: string) =>
      `Los datos de ${name} se guardaron correctamente.`,
    deleteSuccessTitle: "Tipo de servicio eliminado",
    deleteSuccessDescription: (name: string) =>
      `${name} fue removido de tu catálogo.`,
    errorTitle: "No pudimos guardar el tipo de servicio",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  financeSettings: {
    loadingUpdate: "Guardando periodos...",
    updateSuccessTitle: "Periodos actualizados",
    updateSuccessDescription:
      "Tus rangos de quincena, mes, trimestre y año quedaron guardados.",
    errorTitle: "No pudimos guardar los periodos",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
  savingsGoals: {
    loadingCreate: "Creando ahorro...",
    loadingUpdate: "Actualizando ahorro...",
    loadingDelete: "Eliminando ahorro...",
    loadingDeposit: "Registrando aporte...",
    createSuccessTitle: "Ahorro creado",
    createSuccessDescription: (name: string) =>
      `${name} ya está listo para recibir aportes.`,
    updateSuccessTitle: "Ahorro actualizado",
    updateSuccessDescription: (name: string) =>
      `Los datos de ${name} se guardaron correctamente.`,
    deleteSuccessTitle: "Ahorro eliminado",
    deleteSuccessDescription: (name: string) =>
      `${name} fue removido de tus metas.`,
    depositSuccessTitle: "Aporte registrado",
    depositSuccessDescription: (amount: number) =>
      `Se agregaron ${amount.toLocaleString("es-CO")} a tu ahorro.`,
    errorTitle: "No pudimos guardar el ahorro",
    errorDescription: "Inténtalo de nuevo en unos segundos.",
  },
} as const;
