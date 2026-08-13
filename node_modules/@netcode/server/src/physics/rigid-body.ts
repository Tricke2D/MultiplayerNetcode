import { Entity } from '../state/entity.model.js';

const MOVE_SPEED = 5;

export function applyMovementInput(
  entity: Entity,
  input: { up: boolean; down: boolean; left: boolean; right: boolean }
): void {
  let x = 0;
  let y = 0;
  if (input.up) y -= 1;
  if (input.down) y += 1;
  if (input.left) x -= 1;
  if (input.right) x += 1;

  entity.velocity = { x: x * MOVE_SPEED, y: y * MOVE_SPEED };
}

export function integrateMotion(entity: Entity, fixedDeltaSeconds: number): void {
  const displacement = {
    x: entity.velocity.x * fixedDeltaSeconds,
    y: entity.velocity.y * fixedDeltaSeconds,
  };
  entity.position = {
    x: entity.position.x + displacement.x,
    y: entity.position.y + displacement.y,
  };
}
