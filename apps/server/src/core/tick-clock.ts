import { SIMULATION_CONFIG, type TickNumber } from '@netcode/shared';

type TickCallback = (tickNumber: TickNumber, fixedDeltaSeconds: number) => void;

export class TickClock {
  private currentTick: TickNumber = 0;
  private accumulatedMs = 0;
  private lastRealTimeNs: bigint = process.hrtime.bigint();
  private readonly fixedDeltaMs = SIMULATION_CONFIG.FIXED_DELTA_TIME_MS;
  private loopHandle: NodeJS.Immediate | null = null;

  constructor(private readonly onTick: TickCallback) {}

  start(): void {
    this.lastRealTimeNs = process.hrtime.bigint();
    this.scheduleNextFrame();
  }

  private scheduleNextFrame(): void {
    this.loopHandle = setImmediate(() => this.frame());
  }

  private frame(): void {
    const nowNs = process.hrtime.bigint();
    const elapsedMs = Number(nowNs - this.lastRealTimeNs) / 1_000_000;
    this.lastRealTimeNs = nowNs;
    this.accumulatedMs += elapsedMs;

    while (this.accumulatedMs >= this.fixedDeltaMs) {
      this.currentTick += 1;
      this.onTick(this.currentTick, this.fixedDeltaMs / 1000);
      this.accumulatedMs -= this.fixedDeltaMs;
    }

    this.scheduleNextFrame();
  }

  getCurrentTick(): TickNumber {
    return this.currentTick;
  }

  stop(): void {
    if (this.loopHandle) clearImmediate(this.loopHandle);
  }
}
