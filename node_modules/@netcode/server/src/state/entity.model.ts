import type { Vector2 } from '@netcode/shared';

export interface Entity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  health: number;
}

export function createEntity(id: string): Entity {
  return {
    id,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    health: 100,
  };
}
