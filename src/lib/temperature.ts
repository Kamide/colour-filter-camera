import { srgbToLinear } from "@typegpu/color";
import { d, tgpu } from "typegpu";
import { clamp } from "typegpu/std";

/**
 * @param K kelvin
 * @see https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
 */
function temperatureToSrgb(K: number): [r: number, g: number, b: number] {
  /**
   * centikelvin
   */
  const cK = K / 100;

  let r: number;
  let g: number;
  let b: number;

  if (cK <= 66) {
    r = 255;
  } else {
    r = clamp(329.698727446 * Math.pow(cK - 60, -0.1332047592), 0, 255);
  }

  if (cK <= 66) {
    g = clamp(99.4708025861 * Math.log(cK) - 161.1195681661, 0, 255);
  } else {
    g = clamp(288.1221695283 * Math.pow(cK - 60, -0.0755148492), 0, 255);
  }

  if (cK >= 66) {
    b = 255;
  } else if (cK <= 19) {
    b = 0;
  } else {
    b = clamp(138.5177312231 * Math.log(cK - 10) - 305.0447927307, 0, 255);
  }

  return [r / 255, g / 255, b / 255];
}

export function temperatureFn(kelvin: number) {
  const srgb = d.vec3f(...temperatureToSrgb(kelvin));

  return tgpu.fn(
    [d.vec3f],
    d.vec3f,
  )((linear) => {
    return linear.mul(srgbToLinear(srgb));
  });
}
