import { apiOk } from "@/lib/api/responses";
import { appBrand } from "@/lib/branding";

export async function GET() {
  return apiOk({
    status: "ok",
    service: appBrand.name,
    timestamp: new Date().toISOString(),
  });
}
