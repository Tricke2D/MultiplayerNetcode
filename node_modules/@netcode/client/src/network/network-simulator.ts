export class NetworkSimulator {
  constructor(private readonly artificialDelayMs: number) {}

  delay(callback: () => void): void {
    if (this.artificialDelayMs <= 0) {
      callback();
      return;
    }
    setTimeout(callback, this.artificialDelayMs);
  }
}
