import { useSyncExternalStore } from "react";

export const useFullscreenElement = () =>
  useSyncExternalStore(
    (onStoreChange) => {
      const controller = new AbortController();
      document.addEventListener(
        "fullscreenchange",
        () => {
          onStoreChange();
        },
        { signal: controller.signal },
      );
      return () => {
        controller.abort();
      };
    },
    () => document.fullscreenElement,
    () => null,
  );
