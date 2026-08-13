import { SIMULATION_CONFIG } from '@netcode/shared';
export class TickClock {
    constructor(onTick) {
        this.onTick = onTick;
        this.currentTick = 0;
        this.accumulatedMs = 0;
        this.lastRealTimeNs = process.hrtime.bigint();
        this.fixedDeltaMs = SIMULATION_CONFIG.FIXED_DELTA_TIME_MS;
        this.loopHandle = null;
    }
    start() {
        this.lastRealTimeNs = process.hrtime.bigint();
        this.scheduleNextFrame();
    }
    scheduleNextFrame() {
        this.loopHandle = setImmediate(() => this.frame());
    }
    frame() {
        const nowNs = process.hrtime.bigint();
        const elapsedMs = Number(nowNs - this.lastRealTimeNs) / 1000000;
        this.lastRealTimeNs = nowNs;
        this.accumulatedMs += elapsedMs;
        while (this.accumulatedMs >= this.fixedDeltaMs) {
            this.currentTick += 1;
            this.onTick(this.currentTick, this.fixedDeltaMs / 1000);
            this.accumulatedMs -= this.fixedDeltaMs;
        }
        this.scheduleNextFrame();
    }
    getCurrentTick() {
        return this.currentTick;
    }
    stop() {
        if (this.loopHandle)
            clearImmediate(this.loopHandle);
    }
}
