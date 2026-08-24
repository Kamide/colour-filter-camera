export const sleep = (duration?: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export class Timer {
  declare duration?: number;
  declare id: number | undefined;

  constructor(duration?: number) {
    this.duration = duration;
  }

  reset() {
    clearTimeout(this.id);
    this.id = undefined;
  }

  set(callback: () => void, duration?: number) {
    this.reset();
    this.id = setTimeout(callback, duration ?? this.duration);
  }
}
