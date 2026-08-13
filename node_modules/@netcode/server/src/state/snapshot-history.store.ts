import { TickNumber } from '@netcode/shared';
import { Entity } from './entity.model.js';
import { Vector2 } from '@netcode/shared';

export interface HistoricalEntityState {
  id: string;
  position: Vector2;
}

const HISTORY_WINDOW_TICKS = 60;

export class SnapshotHistoryStore {
  private history = new Map<TickNumber, HistoricalEntityState[]>();

  recordTick(tick: TickNumber, entities: Entity[]): void {
    const snapshot = entities.map((e) => ({ id: e.id, position: { ...e.position } }));
    this.history.set(tick, snapshot);
    this.evictOldEntries(tick);
  }

  private evictOldEntries(currentTick: TickNumber): void {
    const oldestAllowedTick = currentTick - HISTORY_WINDOW_TICKS;
    for (const historicalTick of this.history.keys()) {
      if (historicalTick < oldestAllowedTick) this.history.delete(historicalTick);
    }
  }

  getSnapshotAtTick(tick: TickNumber): HistoricalEntityState[] | undefined {
    return this.history.get(tick);
  }

  getHistorySize(): number {
    return this.history.size;
  }
}
