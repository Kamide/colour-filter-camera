import { linearToSrgb, srgbToLinear } from "@typegpu/color";
import { useRoot } from "@typegpu/react";
import { CameraIcon, FullscreenIcon, ScreenShareIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import tgpu, { common, d, std, type TgpuRoot } from "typegpu";
import { useContextRef } from "../hooks/gpu.ts";
import { cvd } from "../lib/cvd.ts";
import * as grayscale from "../lib/grayscale.ts";
import { identityVec3f } from "../lib/identity.ts";
import { temperatureFn } from "../lib/temperature.ts";
import { Button } from "./button.tsx";
import { Select } from "./select.tsx";
import { Spacer } from "./spacer.tsx";
import { createErrorToast } from "./toast.ts";

const filterLabelToFnMap = {
  Passthrough: identityVec3f,
  "Protanopia Simulation": cvd.simulation.protanopia,
  "Deuteranopia Simulation": cvd.simulation.deuteranopia,
  "Tritanopia Simulation": cvd.simulation.tritanopia,
  "Protanopia Daltonization": cvd.daltonization.protanopia,
  "Deuteranopia Daltonization": cvd.daltonization.deuteranopia,
  "Tritanopia Daltonization": cvd.daltonization.tritanopia,
  "Rec. 601 Grayscale": grayscale.rec601,
  "Rec. 709 Grayscale": grayscale.rec709,
  "Incandescent (2700K)": temperatureFn(2700),
  "Fluorescent (3500K)": temperatureFn(3500),
};

type FilterLabel = keyof typeof filterLabelToFnMap;

function useResources(root: TgpuRoot, filter: FilterLabel) {
  "use no memo";

  const sampler = useMemo(
    () => root.createSampler({ magFilter: "linear", minFilter: "linear" }),
    [root],
  );

  const uvTransform = useMemo(
    () => root.createUniform(d.mat2x2f, d.mat2x2f.identity()),
    [root],
  );

  const layout = useMemo(
    () =>
      tgpu.bindGroupLayout({
        inputTexture: { externalTexture: d.textureExternal() },
      }),
    [],
  );

  const fragment = useMemo(() => {
    const transform = filterLabelToFnMap[filter];

    return tgpu.fragmentFn({
      in: { uv: d.vec2f },
      out: d.vec4f,
    })(({ uv }) => {
      const position = uvTransform.$.mul(uv.sub(0.5)).add(0.5);
      const srgb = std.textureSampleBaseClampToEdge(
        layout.$.inputTexture,
        sampler.$,
        position,
      );
      const linear = srgbToLinear(srgb.rgb);
      const transformed = transform(linear);
      return d.vec4f(linearToSrgb(transformed), srgb.a);
    });
  }, [filter, layout, sampler, uvTransform]);

  const renderPipeline = useMemo(
    () =>
      root.createRenderPipeline({
        vertex: common.fullScreenTriangle,
        fragment,
      }),
    [fragment, root],
  );

  return {
    layout,
    renderPipeline,
  };
}

type Size = {
  width: number;
  height: number;
};

export function App() {
  const root = useRoot();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useContextRef(root, canvasRef);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef<Size>({ width: 0, height: 0 });
  const [filter, setFilter] = useState<FilterLabel>("Passthrough");
  const { layout, renderPipeline } = useResources(root, filter);

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
    Promise.resolve()
      .then(() =>
        navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 60 } },
        }),
      )
      .then((nextSource) => {
        stopVideoSource().srcObject = nextSource;
      })
      .catch(createErrorToast);
  };

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { frameRate: { ideal: 60 } } })
      .then((nextSource) => {
        stopVideoSource().srcObject = nextSource;
      })
      .catch(createErrorToast);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      Promise.resolve()
        .then(() => document.exitFullscreen())
        .catch(createErrorToast);
    } else {
      Promise.resolve(canvasRef.current)
        .then((canvas) => canvas!.requestFullscreen())
        .catch(createErrorToast);
    }
  };

  return (
    <div className="relative h-svh w-svw overflow-hidden">
      <div className="h-full w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full object-contain" />
        <video ref={videoRefCallback} autoPlay hidden playsInline />
      </div>
      <div className="absolute bottom-0 flex w-full gap-2 overflow-auto pt-4 px-safe-offset-4 pb-safe-offset-4">
        <Button onClick={startScreenShare}>
          <ScreenShareIcon aria-label="Screen Share" size={16} />
        </Button>
        <Button onClick={startCamera}>
          <CameraIcon aria-label="Camera" size={16} />
        </Button>
        <Spacer />
        <Select
          aria-label="Filter"
          options={Object.keys(filterLabelToFnMap) as FilterLabel[]}
          value={filter}
          onChange={setFilter}
        />
        <Button onClick={toggleFullscreen}>
          <FullscreenIcon aria-label="Fullscreen" size={16} />
        </Button>
      </div>
    </div>
  );
}
