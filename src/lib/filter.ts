import type { MapKey, MapValue } from "../types/map";
import { cvd } from "./cvd";
import * as grayscale from "./grayscale";
import { identityVec3f } from "./identity";
import { temperatureFn } from "./temperature";

export const filterLabelToFnMap = new Map([
  ["Passthrough", identityVec3f],
  ["Protanopia Simulation", cvd.simulation.protanopia],
  ["Deuteranopia Simulation", cvd.simulation.deuteranopia],
  ["Tritanopia Simulation", cvd.simulation.tritanopia],
  ["Protanopia Daltonization", cvd.daltonization.protanopia],
  ["Deuteranopia Daltonization", cvd.daltonization.deuteranopia],
  ["Tritanopia Daltonization", cvd.daltonization.tritanopia],
  ["Average Grayscale", grayscale.average],
  ["Lightness Grayscale", grayscale.lightness],
  ["Rec. 601 Grayscale", grayscale.rec601],
  ["Rec. 709 Grayscale", grayscale.rec709],
  ["Rec. 2020 Grayscale", grayscale.rec2020],
  ["1900 K (Candle)", temperatureFn(1900)],
  ["2300 K (Warm Incandescent)", temperatureFn(2300)],
  ["2700 K (Incandescent)", temperatureFn(2700)],
  ["3400 K (Halogen)", temperatureFn(3400)],
  ["4200 K (Fluorescent)", temperatureFn(4200)],
  ["5003 K (CIE D50)", temperatureFn(5003)],
  ["5503 K (CIE D55)", temperatureFn(5503)],
  ["7504 K (CIE D75)", temperatureFn(7504)],
  ["9305 K (CIE D93)", temperatureFn(9305)],
] as const);

export type FilterLabel = MapKey<typeof filterLabelToFnMap>;
export type FilterFn = MapValue<typeof filterLabelToFnMap>;

export const filterLabels = [...filterLabelToFnMap.keys()];

export const getFilterByLabel = (label: FilterLabel): FilterFn =>
  filterLabelToFnMap.get(label) ?? identityVec3f;
