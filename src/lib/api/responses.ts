import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function apiCreated<T>(data: T) {
  return apiOk(data, 201);
}

export function apiError(
  message: string,
  status = 400,
  code: ApiErrorCode = "VALIDATION_ERROR",
  details?: unknown,
) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      code,
      ...(details !== undefined ? { details } : {}),
    },
    { status },
  );
}

export function apiUnauthorized(message = "No autorizado") {
  return apiError(message, 401, "UNAUTHORIZED");
}

export function apiNotFound(message = "Recurso no encontrado") {
  return apiError(message, 404, "NOT_FOUND");
}

export function apiInternalError(message = "Error interno del servidor") {
  return apiError(message, 500, "INTERNAL_ERROR");
}

export function fileDownload(
  body: BodyInit,
  filename: string,
  contentType: string,
) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
