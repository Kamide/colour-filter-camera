import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app.tsx";
import { createErrorToast } from "./components/toast.ts";

createRoot(document.getElementById("root")!, {
  onUncaughtError: createErrorToast,
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
