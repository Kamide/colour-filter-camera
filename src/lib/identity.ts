import tgpu, { d } from "typegpu";

export const identityVec3f = tgpu.fn(
  [d.vec3f],
  d.vec3f,
)((linear) => {
  return d.vec3f(linear);
});
