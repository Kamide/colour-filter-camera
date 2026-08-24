import { cn } from "../lib/tailwind.ts";
import { sleep } from "../lib/timer.ts";

const errorMessageOf = (error: unknown) => {
  for (let i = 0; i < 2; i++) {
    try {
      console.error(error);

      return error instanceof Error
        ? error.message
        : typeof error === "object"
          ? JSON.stringify(error)
          : // eslint-disable-next-line @typescript-eslint/no-base-to-string
            String(error);
    } catch (next) {
      error = next;
    }
  }

  return "An unknown error occurred";
};

const getToastContainer = () => {
  let container = document.querySelector<HTMLElement>("[data-toast-container]");

  if (container == null) {
    container = document.createElement("div");
    container.dataset.toastContainer = "true";
    container.className = cn(
      "pointer-events-none absolute inset-0 z-1 space-y-2 overflow-auto p-safe-offset-4 text-center text-balance",
    );

    document.body.appendChild(container);
  }

  return container;
};

export const createErrorToast = (error: unknown) => {
  const toast = document.createElement("p");
  toast.role = "status";
  toast.ariaLive = "polite";
  toast.ariaAtomic = "true";
  toast.dataset.toast = "true";
  toast.className = cn(
    "pointer-events-auto mx-auto w-fit rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-medium opacity-0 backdrop-blur-2xl backdrop-contrast-50",
  );
  toast.textContent = errorMessageOf(error);

  const container = getToastContainer();
  container.appendChild(toast);

  void toast
    .animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 })
    .finished.then(() => {
      toast.classList.remove("opacity-0");
      return sleep(2500);
    })
    .then(
      () =>
        toast.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 })
          .finished,
    )
    .then(() => {
      toast.remove();

      if (!container.querySelector("[data-toast]")) {
        container.remove();
      }
    });
};
