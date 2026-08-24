import { useRoot } from "@typegpu/react";
import { CameraIcon, FullscreenIcon, ScreenShareIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useAutoHide } from "../hooks/auto-hide.ts";
import { useFilter } from "../hooks/filter.ts";
import { useFullscreenElement } from "../hooks/fullscreen.ts";
import { useContextRef } from "../hooks/gpu.ts";
import { pointerFine, supportsHas, supportsOpen } from "../lib/css.ts";
import { filterLabels, type FilterLabel } from "../lib/filter.ts";
import { getFps } from "../lib/fps.ts";
import { cn } from "../lib/tailwind.ts";
import { Button } from "./button.tsx";
import { Select } from "./select.tsx";
import { Spacer } from "./spacer.tsx";
import { createErrorToast } from "./toast.ts";

type Size = {
  width: number;
  height: number;
};

export const App = () => {
  const root = useRoot();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useContextRef(root, canvasRef);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef<Size>({ width: 0, height: 0 });
  const [filter, setFilter] = useState<FilterLabel>("Passthrough");
  const { layout, renderPipeline } = useFilter(root, filter);
  const fullscreenElement = useFullscreenElement();
  const { hidden: controlsHidden, childRefCallback: controlsRefCallback } =
    useAutoHide({
      parent: fullscreenElement,
      preventAutoHide: (child) =>
        (pointerFine.matches && child.matches(":hover")) ||
        (supportsHas && supportsOpen && child.matches(":has(:open)")),
    });

  const videoRefCallback = (video: HTMLVideoElement | null) => {
    if (video == null) {
      stopVideoSource();
    }

    videoRef.current = video;

    if (video == null) {
      return;
    }

    const size = sizeRef.current;

    const onVideoFrame = (_: number, metadata: Size) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;

      if (canvas != null && context != null && video.readyState >= 2) {
        const { width, height } = metadata;

        if (size.width !== width) {
          size.width = width;
          canvas.width = width;
        }

        if (size.height !== height) {
          size.height = height;
          canvas.height = height;
        }

        const bindGroup = root.createBindGroup(layout, {
          inputTexture: root.device.importExternalTexture({ source: video }),
        });

        renderPipeline
          .with(bindGroup)
          .withColorAttachment({ view: context })
          .draw(3);
      }

      frameRef.current = video.requestVideoFrameCallback(onVideoFrame);
    };

    if (video.srcObject != null) {
      onVideoFrame(0, size);
    } else {
      frameRef.current = video.requestVideoFrameCallback(onVideoFrame);
    }

    return () => {
      if (frameRef.current == null) {
        return;
      }

      video.cancelVideoFrameCallback(frameRef.current);
      frameRef.current = null;
    };
  };

  const stopVideoSource = () => {
    const video = videoRef.current;

    if (video == null) {
      return { srcObject: null };
    }

    const currentSource = video.srcObject;

    if (currentSource instanceof MediaStream) {
      for (const track of currentSource.getTracks()) {
        track.stop();
      }
    }

    return video;
  };

  const startScreenShare = () => {
    getFps()
      .then((fps) =>
        navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: fps } },
        }),
      )
      .then((nextSource) => {
        stopVideoSource().srcObject = nextSource;
      })
      .catch(createErrorToast);
  };

  const startCamera = () => {
    getFps()
      .then((fps) =>
        navigator.mediaDevices.getUserMedia({
          video: { frameRate: { ideal: fps } },
        }),
      )
      .then((nextSource) => {
        stopVideoSource().srcObject = nextSource;
      })
      .catch(createErrorToast);
  };

  const toggleFullscreen = () => {
    if (fullscreenElement) {
      Promise.resolve()
        .then(() => document.exitFullscreen())
        .catch(createErrorToast);
    } else {
      Promise.resolve()
        .then(() => document.body.requestFullscreen())
        .catch(createErrorToast);
    }
  };

  return (
    <div className="relative h-svh w-svw overflow-hidden">
      <div className="size-full overflow-hidden">
        <canvas ref={canvasRef} className="size-full object-contain" />
        <video ref={videoRefCallback} autoPlay hidden playsInline />
      </div>
      <div
        ref={controlsRefCallback}
        className={cn(
          "absolute bottom-0 flex w-full gap-2 overflow-auto pt-4 px-safe-offset-4 pb-safe-offset-4 transition-all",
          controlsHidden && "pointer-events-none translate-y-full opacity-0",
        )}
      >
        <Button onClick={startScreenShare}>
          <ScreenShareIcon aria-label="Screen Share" size={16} />
        </Button>
        <Button onClick={startCamera}>
          <CameraIcon aria-label="Camera" size={16} />
        </Button>
        <Spacer />
        <Select
          aria-label="Filter"
          options={filterLabels}
          value={filter}
          onChange={setFilter}
        />
        <Button onClick={toggleFullscreen}>
          <FullscreenIcon aria-label="Fullscreen" size={16} />
        </Button>
      </div>
    </div>
  );
};
