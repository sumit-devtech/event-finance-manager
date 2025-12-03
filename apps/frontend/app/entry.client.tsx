import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

// Error handling for hydration
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}

startTransition(() => {
  try {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  } catch (error) {
    console.error("Hydration error:", error);
    // Fallback: reload the page if hydration fails
    if (error instanceof Error && error.message.includes("hydration")) {
      window.location.reload();
    }
  }
});

