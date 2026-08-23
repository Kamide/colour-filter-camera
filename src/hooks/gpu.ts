import { useLayoutEffect, useRef, type RefObject } from "react";
import type { TgpuRoot } from "typegpu";

export const useContextRef = (
  root: TgpuRoot,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) => {
  const contextRef = useRef<GPUCanvasContext>(null);

  useLayoutEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    contextRef.current = root.configureContext({
      canvas: canvasRef.current,
      alphaMode: "premultiplied",
    });
  }, [canvasRef, root]);

  return contextRef;
};
