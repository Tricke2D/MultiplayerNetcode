import { Entity } from './entity.model.js';
import type { TickNumber } from '@netcode/shared';

export class GameStateStore {
  private entities = new Map<string, Entity>();
  private currentTick: TickNumber = 0;

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entityId: string): void {
    this.entities.delete(entityId);
  }

  getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  setCurrentTick(tick: TickNumber): void {
    this.currentTick = tick;
  }

  getCurrentTick(): TickNumber {
    return this.currentTick;
  }
}
