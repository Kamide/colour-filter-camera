import { d, std, tgpu } from "typegpu";

export const selectMat3x3f = tgpu.fn(
  [d.mat3x3f, d.mat3x3f, d.bool],
  d.mat3x3f,
)((whenFalse, whenTrue, condition) =>
  whenFalse.add(
    whenTrue.sub(whenFalse).mul(std.select(d.f32(0), d.f32(1), condition)),
  ),
);
