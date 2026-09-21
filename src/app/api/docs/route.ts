import { getApiCatalog } from "@/lib/api/catalog";
import { apiOk } from "@/lib/api/responses";

export async function GET() {
  return apiOk(getApiCatalog());
}
