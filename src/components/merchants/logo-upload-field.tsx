"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { MerchantAvatar } from "@/components/merchants/merchant-avatar";

type LogoUploadFieldProps = {
  name: string;
  logoUrl: string | null;
  onChange: (logoUrl: string | null) => void;
  onError: (message: string | null) => void;
};

const acceptedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const maxSizeBytes = 1_000_000;

function readImageFile(
  file: File,
  onSuccess: (dataUrl: string) => void,
  onError: (message: string | null) => void,
) {
  if (!acceptedTypes.includes(file.type)) {
    onError("Usa PNG, JPG, WEBP o GIF");
    return;
  }

  if (file.size > maxSizeBytes) {
    onError("La imagen debe pesar menos de 1 MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      onSuccess(reader.result);
      onError(null);
      return;
    }

    onError("No pudimos leer la imagen");
  };
  reader.onerror = () => onError("No pudimos leer la imagen");
  reader.readAsDataURL(file);
}

export function LogoUploadField({
  name,
  logoUrl,
  onChange,
  onError,
}: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;

    readImageFile(
      file,
      (dataUrl) => onChange(dataUrl),
      (message) => onError(message),
    );
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Logo de la empresa</p>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 transition-colors ${
          isDragging
            ? "border-accent bg-secondary/70"
            : "border-border bg-white hover:border-accent/50 hover:bg-secondary/30"
        }`}
      >
        <MerchantAvatar name={name || "Empresa"} logoUrl={logoUrl} size="lg" />

        <p className="mt-4 text-sm font-semibold text-foreground">
          {logoUrl ? "Cambiar imagen" : "Sube una imagen"}
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Arrastra una imagen aquí o haz clic para elegirla
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          PNG, JPG, WEBP o GIF · Máx. 1 MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={handleInputChange}
        />
      </div>

      {logoUrl ? (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            onError(null);
          }}
          className="text-xs font-semibold text-destructive hover:underline"
        >
          Quitar logo
        </button>
      ) : null}
    </div>
  );
}
