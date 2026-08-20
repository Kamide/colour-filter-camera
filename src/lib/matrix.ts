export type Vec2f = [number, number];
export type Vec3f = [number, number, number];
export type Mat3x3f = [Vec3f, Vec3f, Vec3f];

export const empty = (): Mat3x3f => [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

export const flat = (matrix: Mat3x3f) =>
  matrix.flat() as [...Vec3f, ...Vec3f, ...Vec3f];

export const mul = (left: number[][], right: number[][]) => {
  const product = empty();

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      product[i][j] =
        left[i][0] * right[0][j] +
        left[i][1] * right[1][j] +
        left[i][2] * right[2][j];
    }
  }

  return product;
};
