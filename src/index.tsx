import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app.tsx";
import { createErrorToast } from "./components/toast.ts";
import "./index.css";

createRoot(document.getElementById("root")!, {
  onUncaughtError: createErrorToast,
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
