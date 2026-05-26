import tgpu, { d, std } from "typegpu";
import { selectMat3x3f } from "./select";

type Vec3f = [number, number, number];
type Mat3x3f = [Vec3f, Vec3f, Vec3f];

function flat(matrix: Mat3x3f) {
  return matrix.flat() as [...Vec3f, ...Vec3f, ...Vec3f];
}

function brettel1997Params(
  separationPlaneNormal: Vec3f,
  transformationMatrixNegative: Mat3x3f,
  transformationMatrixPositive: Mat3x3f,
  daltonizationMatrix: Mat3x3f,
) {
  return {
    separationPlaneNormal: d.vec3f(...separationPlaneNormal),
    transformationMatrixNegative: d.mat3x3f(
      ...flat(transformationMatrixNegative),
    ),
    transformationMatrixPositive: d.mat3x3f(
      ...flat(transformationMatrixPositive),
    ),
    daltonizationMatrix: d.mat3x3f(...flat(daltonizationMatrix)),
  };
}

/**
 * Color vision deficiency (CVD) simulation and daltonization parameters are
 * adapted from [libDaltonLens](https://github.com/DaltonLens/libDaltonLens),
 * which is based on [Brettel et al. (1997)](https://pubmed.ncbi.nlm.nih.gov/9316278/).
 */
const brettel1997ParamsFor = {
  protanopia: brettel1997Params(
    [0.00048, 0.00393, -0.00441],
    [
      [0.1498, 0.10764, 0.00384],
      [1.19548, 0.84864, -0.0054],
      [-0.34528, 0.04372, 1.00156],
    ],
    [
      [0.1457, 0.10816, 0.00386],
      [1.16172, 0.85291, -0.00524],
      [-0.30742, 0.03892, 1.00139],
    ],
    [
      [0.0, 0.7, 0.7],
      [0.0, 1.0, 0.0],
      [0.0, 0.0, 1.0],
    ],
  ),
  deuteranopia: brettel1997Params(
    [-0.00281, -0.00611, 0.00892],
    [
      [0.37298, 0.25954, -0.0198],
      [0.88166, 0.63506, 0.02784],
      [-0.25464, 0.1054, 0.99196],
    ],
    [
      [0.36477, 0.26294, -0.02006],
      [0.86381, 0.64245, 0.02728],
      [-0.22858, 0.09462, 0.99278],
    ],
    [
      [1.0, 0.0, 0.0],
      [0.7, 0.0, 0.7],
      [0.0, 0.0, 1.0],
    ],
  ),
  tritanopia: brettel1997Params(
    [0.03901, -0.02788, -0.01113],
    [
      [0.93678, 0.06154, -0.37562],
      [0.18979, 0.81526, 1.12767],
      [-0.12657, 0.1232, 0.24796],
    ],
    [
      [1.01277, -0.01243, 0.07589],
      [0.13548, 0.86812, 0.805],
      [-0.14826, 0.14431, 0.11911],
    ],
    [
      [1.0, 0.0, 0.0],
      [0.0, 1.0, 0.0],
      [0.7, 0.7, 0.0],
    ],
  ),
};

function simulationFn(params: ReturnType<typeof brettel1997Params>) {
  return tgpu.fn(
    [d.vec3f],
    d.vec3f,
  )((linear) => {
    const transformationMatrix = selectMat3x3f(
      params.transformationMatrixNegative,
      params.transformationMatrixPositive,
      std.dot(linear.rgb, params.separationPlaneNormal) >= 0.0,
    );

    return transformationMatrix.mul(linear);
  });
}

function daltonizationFn(params: ReturnType<typeof brettel1997Params>) {
  return tgpu.fn(
    [d.vec3f],
    d.vec3f,
  )((linear) => {
    const transformationMatrix = selectMat3x3f(
      params.transformationMatrixNegative,
      params.transformationMatrixPositive,
      std.dot(linear.rgb, params.separationPlaneNormal) >= 0.0,
    );

    const simulationMatrix = transformationMatrix.mul(linear);

    return linear.add(
      params.daltonizationMatrix.mul(linear.sub(simulationMatrix)),
    );
  });
}

export const cvd = {
  simulation: {
    protanopia: simulationFn(brettel1997ParamsFor.protanopia),
    deuteranopia: simulationFn(brettel1997ParamsFor.deuteranopia),
    tritanopia: simulationFn(brettel1997ParamsFor.tritanopia),
  },
  daltonization: {
    protanopia: daltonizationFn(brettel1997ParamsFor.protanopia),
    deuteranopia: daltonizationFn(brettel1997ParamsFor.deuteranopia),
    tritanopia: daltonizationFn(brettel1997ParamsFor.tritanopia),
  },
};
