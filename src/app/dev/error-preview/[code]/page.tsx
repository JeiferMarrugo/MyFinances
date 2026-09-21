import { notFound } from "next/navigation";
import {
  ErrorPageScreen,
  ErrorPreviewBackLink,
} from "@/components/errors/error-page-screen";
import {
  errorPageCatalog,
  errorPreviewCodes,
} from "@/lib/errors/catalog";

type ErrorPreviewPageProps = {
  params: Promise<{ code: string }>;
};

export function generateStaticParams() {
  return errorPreviewCodes.map((code) => ({ code }));
}

export default async function ErrorPreviewDetailPage({
  params,
}: ErrorPreviewPageProps) {
  const { code } = await params;
  const config = errorPageCatalog[code];

  if (!config) {
    notFound();
  }

  return (
    <>
      <ErrorPreviewBackLink />
      <ErrorPageScreen config={config} />
    </>
  );
}
