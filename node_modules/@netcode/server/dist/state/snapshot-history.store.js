const HISTORY_WINDOW_TICKS = 60;
export class SnapshotHistoryStore {
    constructor() {
        this.history = new Map();
    }
    recordTick(tick, entities) {
        const snapshot = entities.map((e) => ({ id: e.id, position: { ...e.position } }));
        this.history.set(tick, snapshot);
        this.evictOldEntries(tick);
    }
    evictOldEntries(currentTick) {
        const oldestAllowedTick = currentTick - HISTORY_WINDOW_TICKS;
        for (const historicalTick of this.history.keys()) {
            if (historicalTick < oldestAllowedTick)
                this.history.delete(historicalTick);
        }
    }
    getSnapshotAtTick(tick) {
        return this.history.get(tick);
    }
    getHistorySize() {
        return this.history.size;
    }
}
