import { linearToSrgb, srgbToLinear } from "@typegpu/color";
import { useMemo } from "react";
import tgpu, { common, d, std, type TgpuRoot } from "typegpu";
import { getFilterByLabel, type FilterLabel } from "../lib/filter";

export const useFilter = (root: TgpuRoot, filter: FilterLabel) => {
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
    const transform = getFilterByLabel(filter);

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
};
