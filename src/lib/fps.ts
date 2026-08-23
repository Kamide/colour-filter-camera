const measureFps = () => {
  const { promise, resolve } = Promise.withResolvers<number>();

  const timestamps: number[] = [];

  const computeFps = () => {
    const first = timestamps[0];
    const last = timestamps.at(-1)!;
    const elapsedSeconds = (last - first) / 1000;
    const intervals = timestamps.length - 1;
    const rawFps = intervals / elapsedSeconds;

    let snappedFps = rawFps;
    let bestDifference = Infinity;

    for (const factor of [
      24, // Film
      25, // PAL
      30, // NTSC
    ]) {
      let multiple = Math.round(rawFps / factor) * factor;

      if (multiple <= 0) {
        multiple = factor;
      }

      const difference = Math.abs(rawFps - multiple);

      if (difference < bestDifference) {
        bestDifference = difference;
        snappedFps = multiple;
      }
    }

    resolve(snappedFps);
  };

  let documentWasHidden = false;

  requestAnimationFrame(function getFrameTimestamp(timestamp) {
    if (document.visibilityState === "visible") {
      if (documentWasHidden) {
        documentWasHidden = false;
        timestamps.length = 0;
      }

      timestamps.push(timestamp);
    } else {
      documentWasHidden = true;
    }

    if (timestamps.length === 6) {
      computeFps();
    } else {
      requestAnimationFrame(getFrameTimestamp);
    }
  });

  return promise;
};

let fpsPromise: Promise<number> | undefined;

export const getFps = () => {
  if (fpsPromise == null) {
    fpsPromise = measureFps();
  }

  return fpsPromise;
};
