export function errorMessageOf(error: unknown) {
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
}

export function createErrorToast(error: unknown) {
  const p = document.createElement("p");
  p.role = "status";
  p.ariaLive = "polite";
  p.ariaAtomic = "true";
  p.dataset.toast = "true";
  p.className =
    "absolute top-safe-offset-4 left-1/2 -translate-x-1/2 translate-y-[calc(var(--toast-index)*10*var(--spacing))] rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-medium text-white opacity-0 backdrop-blur-2xl backdrop-invert-50";
  p.style.setProperty(
    "--toast-index",
    String(document.querySelectorAll("[data-toast='true']").length),
  );
  p.textContent = errorMessageOf(error);

  document.body.appendChild(p);

  void p
    .animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 })
    .finished.then(() => {
      p.classList.remove("opacity-0");
      return new Promise((resolve) => setTimeout(resolve, 2500));
    })
    .then(
      () =>
        p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).finished,
    )
    .then(() => p.remove());
}
