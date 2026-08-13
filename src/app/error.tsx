"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("BM XPRESS Control Tower client error", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <section style={{ maxWidth: 560, textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, opacity: 0.55 }}>BM XPRESS CONTROL TOWER</p>
        <h1 style={{ fontSize: 28, margin: "12px 0" }}>Something went wrong</h1>
        <p style={{ opacity: 0.7, lineHeight: 1.6 }}>The dashboard encountered a browser error. Reload the application to try again.</p>
        <button onClick={() => reset()} style={{ marginTop: 18, border: 0, borderRadius: 10, padding: "11px 18px", cursor: "pointer" }}>Reload dashboard</button>
      </section>
    </main>
  );
}
