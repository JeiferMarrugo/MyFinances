"use client";

import { useEffect, useState } from "react";
import { Temporal } from "@/lib/temporal";

const timeZone = "America/Bogota";
const locale = "es-CO";

function getClockSnapshot() {
  const now = Temporal.Now.zonedDateTimeISO(timeZone);

  return {
    time: now.toLocaleString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    date: now.toLocaleString(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  };
}

export function LiveClock() {
  const [clock, setClock] = useState<{ time: string; date: string } | null>(
    null,
  );

  useEffect(() => {
    setClock(getClockSnapshot());

    const intervalId = window.setInterval(() => {
      setClock(getClockSnapshot());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      className="hidden min-w-[132px] rounded-xl border border-border bg-white px-3 py-2 text-left md:block"
      aria-live="polite"
      aria-label="Hora actual"
    >
      <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
        {clock?.time ?? "--:--:--"}
      </p>
      <p className="mt-0.5 text-[0.65rem] font-medium capitalize text-muted-foreground">
        {clock?.date ?? "Cargando..."}
      </p>
    </div>
  );
}
