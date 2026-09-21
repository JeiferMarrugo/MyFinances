type PasskeyErrorContext = "register" | "sign-in" | "delete" | "list";

export type PasskeyUserFeedback = {
  title: string;
  description: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

function isPasskeyCancellation(error: unknown) {
  const message = getErrorMessage(error)?.toLowerCase() ?? "";
  const code = getErrorCode(error);

  if (code === "REGISTRATION_CANCELLED" || code === "AUTH_CANCELLED") {
    return true;
  }

  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return true;
  }

  return (
    message.includes("cancel") ||
    message.includes("abort") ||
    message.includes("timed out or was not allowed") ||
    message.includes("not allowed")
  );
}

function isPasskeyNotRegistered(error: unknown) {
  const message = getErrorMessage(error)?.toLowerCase() ?? "";
  const code = getErrorCode(error);

  return (
    code === "PASSKEY_NOT_FOUND" ||
    message.includes("passkey not found") ||
    message.includes("no passkey") ||
    (message.includes("passkey") && message.includes("not found"))
  );
}

function isPasskeyAlreadyRegistered(error: unknown) {
  const message = getErrorMessage(error)?.toLowerCase() ?? "";
  const code = getErrorCode(error);

  return (
    code === "PREVIOUSLY_REGISTERED" ||
    message.includes("already registered") ||
    message.includes("previously registered")
  );
}

export function resolvePasskeyUserFeedback(
  error: unknown,
  context: PasskeyErrorContext,
): PasskeyUserFeedback | null {
  if (isPasskeyCancellation(error)) {
    return null;
  }

  if (isPasskeyNotRegistered(error)) {
    return {
      title: "Acceso rápido no configurado",
      description:
        "Primero inicia sesión con correo o Google y registra tu dispositivo en Configuración.",
    };
  }

  if (isPasskeyAlreadyRegistered(error)) {
    return {
      title: "Este dispositivo ya está registrado",
      description:
        "Ya puedes usar acceso rápido en el login con Touch ID, Face ID o Windows Hello.",
    };
  }

  const message = getErrorMessage(error)?.toLowerCase() ?? "";

  if (message.includes("timeout") || message.includes("timed out")) {
    return {
      title:
        context === "register"
          ? "Tiempo de registro agotado"
          : "Tiempo de verificación agotado",
      description: "La verificación tardó demasiado. Inténtalo de nuevo.",
    };
  }

  if (
    message.includes("not supported") ||
    message.includes("unsupported") ||
    message.includes("publickeycredential")
  ) {
    return {
      title: "Acceso rápido no disponible",
      description:
        "Tu navegador o dispositivo no admite passkeys. Prueba con Chrome, Edge o Safari actualizado.",
    };
  }

  switch (context) {
    case "register":
      return {
        title: "No pudimos registrar el acceso rápido",
        description:
          "Revisa que tu dispositivo tenga huella, Face ID o Windows Hello activo e inténtalo de nuevo.",
      };
    case "sign-in":
      return {
        title: "No pudimos usar el acceso rápido",
        description:
          "Verifica tu huella, Face ID o PIN del dispositivo e inténtalo otra vez.",
      };
    case "delete":
      return {
        title: "No pudimos eliminar el acceso rápido",
        description: "Inténtalo de nuevo en unos segundos.",
      };
    case "list":
      return {
        title: "No pudimos cargar tus dispositivos",
        description: "Inténtalo de nuevo en unos segundos.",
      };
  }
}

export function showPasskeyFeedback(
  error: unknown,
  context: PasskeyErrorContext,
  showError: (feedback: PasskeyUserFeedback) => void,
) {
  const feedback = resolvePasskeyUserFeedback(error, context);
  if (feedback) {
    showError(feedback);
  }
}
