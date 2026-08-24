import { d, tgpu, type TgpuFn } from "typegpu";
import { mul, type Mat3x3f, type Vec2f, type Vec3f } from "./matrix.ts";

/**
 * @see https://en.wikipedia.org/wiki/Planckian_locus#Approximation
 */
const kelvinToXy = (T: number): Vec2f => {
  let x: number;

  if (T >= 1667 && T <= 4000) {
    x =
      -0.2661239 * (1e9 / T ** 3) -
      0.234358 * (1e6 / T ** 2) +
      0.8776956 * (1e3 / T) +
      0.17991;
  } else if (T > 4000 && T <= 25000) {
    x =
      -3.0258469 * (1e9 / T ** 3) +
      2.1070379 * (1e6 / T ** 2) +
      0.2226347 * (1e3 / T) +
      0.24039;
  } else {
    x = 0.3127;
  }

  return [x, -3 * x ** 2 + 2.87 * x - 0.275];
};

/**
 * This formula was simplified from the "CIE xyY color space" section of the Wikipedia article listed below by substituting `Z` with `0`.
 * @see https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_xyY_color_space
 */
const xyToXyz = ([x, y]: Vec2f): Vec3f => [x / y, 1, (1 - x - y) / y];

const XYZ_TO_LMS_CAT16: Vec3f[] = [
  [0.401288, 0.650173, -0.051461],
  [-0.250268, 1.204414, 0.045854],
  [-0.002079, 0.048952, 0.953127],
];

const LMS_TO_XYZ_CAT16: Vec3f[] = [
  [1.86206786, -1.01125463, 0.14918677],
  [0.38752654, 0.62144744, -0.00897398],
  [-0.0158415, -0.03412294, 1.04996444],
];

const xyzToLms = ([x, y, z]: Vec3f): [number, number, number] => [
  XYZ_TO_LMS_CAT16[0][0] * x +
    XYZ_TO_LMS_CAT16[0][1] * y +
    XYZ_TO_LMS_CAT16[0][2] * z,

  XYZ_TO_LMS_CAT16[1][0] * x +
    XYZ_TO_LMS_CAT16[1][1] * y +
    XYZ_TO_LMS_CAT16[1][2] * z,

  XYZ_TO_LMS_CAT16[2][0] * x +
    XYZ_TO_LMS_CAT16[2][1] * y +
    XYZ_TO_LMS_CAT16[2][2] * z,
];

/**
 * @see https://en.wikipedia.org/wiki/Standard_illuminant#D65_values
 */
const D65_XYZ: Vec3f = [0.95047, 1, 1.08883];
const D65_LMS = xyzToLms(D65_XYZ);

const RGB_TO_XYZ: Mat3x3f = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];

const XYZ_TO_RGB: Mat3x3f = [
  [3.2404542, -1.5371385, -0.4985314],
  [-0.969266, 1.8760108, 0.041556],
  [0.0556434, -0.2040259, 1.0572252],
];

export const temperatureFn = (
  kelvin: number,
): TgpuFn<(linear: d.Vec3f) => d.Vec3f> => {
  const targetXyz = xyToXyz(kelvinToXy(kelvin));
  const targetLms = xyzToLms(targetXyz);

  /**
   * @see https://en.wikipedia.org/wiki/Chromatic_adaptation#Von_Kries_transform
   */
  const vonKriesGain = Array.from(
    { length: 3 },
    (_, i) => targetLms[i] / D65_LMS[i],
  );

  const scaledXyzToLms = XYZ_TO_LMS_CAT16.map((row, i) =>
    row.map((column) => column * vonKriesGain[i]),
  );

  const adaptationMatrixXyz = mul(LMS_TO_XYZ_CAT16, scaledXyzToLms);
  const multiplier = mul(mul(XYZ_TO_RGB, adaptationMatrixXyz), RGB_TO_XYZ);
  const [[r0, g0, b0], [r1, g1, b1], [r2, g2, b2]] = multiplier;

  return tgpu.fn(
    [d.vec3f],
    d.vec3f,
  )((linear) =>
    d.vec3f(
      r0 * linear.r + g0 * linear.g + b0 * linear.b,
      r1 * linear.r + g1 * linear.g + b1 * linear.b,
      r2 * linear.r + g2 * linear.g + b2 * linear.b,
    ),
  );
};
