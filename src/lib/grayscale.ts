import tgpu, { d } from "typegpu";
import { dot } from "typegpu/std";

/**
 * @see https://en.wikipedia.org/wiki/Luma_(video)#Rec._601_luma_versus_Rec._709_luma_coefficients
 */
export const rec601 = tgpu.fn(
  [d.vec3f],
  d.vec3f,
)((linear) => {
  return d.vec3f(dot(linear, d.vec3f(0.299, 0.587, 0.114)));
});

/**
 * @see https://en.wikipedia.org/wiki/Luma_(video)#Rec._601_luma_versus_Rec._709_luma_coefficients
 */
export const rec709 = tgpu.fn(
  [d.vec3f],
  d.vec3f,
)((linear) => {
  return d.vec3f(dot(linear, d.vec3f(0.2126, 0.7152, 0.0722)));
});
