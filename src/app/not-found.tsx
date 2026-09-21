import { ErrorPageScreen } from "@/components/errors/error-page-screen";
import { getErrorPageConfig } from "@/lib/errors/catalog";

export default function NotFound() {
  return <ErrorPageScreen config={getErrorPageConfig("404")} />;
}
