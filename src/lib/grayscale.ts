import { d, tgpu } from "typegpu";
import { dot, max, min } from "typegpu/std";

export const average = tgpu.fn(
  [d.vec3f],
  d.vec3f,
)((linear) => d.vec3f((linear.r + linear.g + linear.b) / 3));

export const lightness = tgpu.fn(
  [d.vec3f],
  d.vec3f,
)((linear) =>
  d.vec3f(
    (max(linear.r, linear.g, linear.b) + min(linear.r, linear.g, linear.b)) / 2,
  ),
);

/**
 * @see https://en.wikipedia.org/wiki/Luma_(video)#Rec._601_luma_versus_Rec._709_luma_coefficients
 */
export const rec601 = tgpu.fn(
  [d.vec3f],
  d.vec3f,
)((linear) => d.vec3f(dot(linear, d.vec3f(0.299, 0.587, 0.114))));

/**
 * @see https://en.wikipedia.org/wiki/Luma_(video)#Rec._601_luma_versus_Rec._709_luma_coefficients
 */
export const rec709 = tgpu.fn(
  [d.vec3f],
  d.vec3f,
)((linear) => d.vec3f(dot(linear, d.vec3f(0.2126, 0.7152, 0.0722))));

/**
 * @see https://en.wikipedia.org/wiki/Rec._2020
 */
export const rec2020 = tgpu.fn(
  [d.vec3f],
  d.vec3f,
)((linear) => d.vec3f(dot(linear, d.vec3f(0.2627, 0.678, 0.0593))));
