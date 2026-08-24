import { useRef, useState } from "react";

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
  const timeoutRef = useRef<number | undefined>(undefined);
  const [hidden, setHidden] = useState(false);

  const resetTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  };

  const hide = () => {
    resetTimeout();
    setHidden(true);
  };

  const show = () => {
    resetTimeout();
    setHidden(false);
  };

  const childRefCallback = (child: Child | null) => {
    if (parent == null || child == null) {
      return;
    }

    const conditionalAutoHide = () => {
      if (!preventAutoHide(child)) {
        hide();
      }
    };

    const rescheduleAutoHide = () => {
      show();
      timeoutRef.current = setTimeout(conditionalAutoHide, duration);
    };

    const controller = new AbortController();

    for (const event of [
      "focusin",
      "keydown",
      "pointerdown",
      "pointermove",
    ] satisfies (keyof HTMLElementEventMap)[]) {
      parent.addEventListener(event, rescheduleAutoHide, {
        signal: controller.signal,
      });
    }

    return () => {
      controller.abort();
    };
  };

  const controlledHidden = parent == null ? false : hidden;

  return { hidden: controlledHidden, childRefCallback };
};
