import { appBrand } from "@/lib/branding";
import { resolveAppUrl } from "@/lib/app-url";

export type ApiEndpointDoc = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  auth: "session" | "cron" | "public";
  description: string;
  query?: Record<string, string>;
  bodyExample?: Record<string, unknown>;
};

export type ApiCatalog = {
  name: string;
  baseUrl: string;
  version: string;
  auth: {
    session: {
      description: string;
      steps: string[];
      signIn: {
        method: "POST";
        path: string;
        body: Record<string, string>;
      };
      verify: {
        method: "GET";
        path: string;
      };
    };
    cron: {
      description: string;
      headers: string[];
    };
  };
  endpoints: ApiEndpointDoc[];
};

const baseUrl = resolveAppUrl();

export function getApiCatalog(): ApiCatalog {
  return {
    name: appBrand.name,
    baseUrl,
    version: "1.0.0",
    auth: {
      session: {
        description:
          "La mayoría de endpoints usan cookie de sesión de Better Auth. Inicia sesión una vez y Postman reutiliza la cookie automáticamente.",
        steps: [
          "Activa en Postman: Settings → Cookies → intercept/manage cookies.",
          `POST ${baseUrl}/api/auth/sign-in/email con email y password.`,
          `Verifica con GET ${baseUrl}/api/auth/get-session.`,
          "Llama cualquier endpoint protegido; Postman enviará la cookie de sesión.",
        ],
        signIn: {
          method: "POST",
          path: "/api/auth/sign-in/email",
          body: {
            email: "tu@correo.com",
            password: "tu-contraseña",
          },
        },
        verify: {
          method: "GET",
          path: "/api/auth/get-session",
        },
      },
      cron: {
        description: "Endpoints de cron usan secreto en header, no sesión.",
        headers: [
          "Authorization: Bearer <CRON_SECRET>",
          "x-cron-secret: <CRON_SECRET>",
        ],
      },
    },
    endpoints: [
      {
        method: "GET",
        path: "/api/health",
        auth: "public",
        description: "Verifica que la API responde.",
      },
      {
        method: "GET",
        path: "/api/docs",
        auth: "public",
        description: "Catálogo JSON de endpoints para Postman/Insomnia.",
      },
      {
        method: "POST",
        path: "/api/auth/sign-in/email",
        auth: "public",
        description: "Inicia sesión con correo y contraseña.",
        bodyExample: {
          email: "tu@correo.com",
          password: "tu-contraseña",
        },
      },
      {
        method: "GET",
        path: "/api/auth/get-session",
        auth: "session",
        description: "Devuelve la sesión activa del usuario.",
      },
      {
        method: "GET",
        path: "/api/reports",
        auth: "session",
        description: "Reporte financiero completo en JSON.",
        query: {
          period: "month | quarter | year",
        },
      },
      {
        method: "GET",
        path: "/api/reports/export",
        auth: "session",
        description: "Descarga reporte en CSV, Excel o PDF.",
        query: {
          period: "month | quarter | year",
          format: "csv | xlsx | pdf",
        },
      },
      {
        method: "GET",
        path: "/api/transactions",
        auth: "session",
        description: "Lista movimientos, resumen mensual y comercios.",
      },
      {
        method: "POST",
        path: "/api/transactions",
        auth: "session",
        description: "Crea un ingreso o gasto.",
      },
      {
        method: "PATCH",
        path: "/api/transactions/:id",
        auth: "session",
        description: "Actualiza un movimiento existente.",
      },
      {
        method: "DELETE",
        path: "/api/transactions/:id",
        auth: "session",
        description: "Elimina un movimiento.",
      },
      {
        method: "GET",
        path: "/api/transactions/:id/payment-plan",
        auth: "session",
        description: "Consulta el plan de cuotas de un crédito.",
      },
      {
        method: "POST",
        path: "/api/transactions/:id/payment-plan",
        auth: "session",
        description: "Confirma el plan de cuotas de un crédito.",
      },
      {
        method: "POST",
        path: "/api/transactions/:id/pay-installment",
        auth: "session",
        description: "Marca una cuota como pagada.",
      },
      {
        method: "GET",
        path: "/api/finance-settings",
        auth: "session",
        description: "Obtiene configuración de periodos financieros.",
      },
      {
        method: "PATCH",
        path: "/api/finance-settings",
        auth: "session",
        description: "Actualiza configuración de periodos financieros.",
      },
      {
        method: "GET",
        path: "/api/savings-goals",
        auth: "session",
        description: "Lista metas de ahorro.",
      },
      {
        method: "POST",
        path: "/api/savings-goals",
        auth: "session",
        description: "Crea una meta de ahorro.",
      },
      {
        method: "GET",
        path: "/api/merchants",
        auth: "session",
        description: "Lista comercios/empresas.",
      },
      {
        method: "GET",
        path: "/api/banks",
        auth: "session",
        description: "Lista bancos.",
      },
      {
        method: "GET",
        path: "/api/cards",
        auth: "session",
        description: "Lista tarjetas.",
      },
      {
        method: "GET",
        path: "/api/recurring-incomes",
        auth: "session",
        description: "Lista ingresos recurrentes.",
      },
      {
        method: "GET",
        path: "/api/recurring-expenses",
        auth: "session",
        description: "Lista gastos recurrentes.",
      },
      {
        method: "GET",
        path: "/api/cron/payment-reminders",
        auth: "cron",
        description: "Ejecuta recordatorios de cuotas por correo.",
      },
    ],
  };
}
