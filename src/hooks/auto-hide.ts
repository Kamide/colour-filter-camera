import { useState } from "react";
import { Timer } from "../lib/timer.ts";

export type AutoHideProps<Parent extends Element, Child extends Element> = {
  parent: Parent | null;
  preventAutoHide?: (child: Child) => boolean;
  duration?: number;
};

export const useAutoHide = <Parent extends Element, Child extends Element>({
  parent,
  preventAutoHide = () => false,
  duration = 1500,
}: AutoHideProps<Parent, Child>) => {
  const timer = new Timer(duration);
  const [hidden, setHidden] = useState(false);

  const hide = () => {
    timer.reset();
    setHidden(true);
  };

  const show = () => {
    timer.reset();
    setHidden(false);
  };

  const childRefCallback = (child: Child | null) => {
    if (parent == null || child == null) {
      show();
      return;
    }

    const conditionalAutoHide = () => {
      if (!preventAutoHide(child)) {
        hide();
      }
    };

    const scheduleAutoHide = () => {
      timer.set(conditionalAutoHide);
    };

    const showAndScheduleAutoHide = () => {
      show();
      scheduleAutoHide();
    };

    const controller = new AbortController();

    controller.signal.addEventListener("abort", () => {
      timer.reset();
    });

    for (const event of [
      "focusin",
      "keydown",
      "pointerdown",
      "pointermove",
    ] satisfies (keyof HTMLElementEventMap)[]) {
      parent.addEventListener(event, showAndScheduleAutoHide, {
        signal: controller.signal,
      });
    }

    scheduleAutoHide();

    return () => {
      controller.abort();
    };
  };

  return { hidden, childRefCallback };
};
