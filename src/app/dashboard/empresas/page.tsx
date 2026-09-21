import { redirect } from "next/navigation";

export default function LegacyMerchantsPage() {
  redirect("/dashboard/manejadores/empresas");
}
