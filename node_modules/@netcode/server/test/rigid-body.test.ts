import { integrateMotion, applyMovementInput } from '../src/physics/rigid-body.js';
import { createEntity } from '../src/state/entity.model.js';

describe('rigid-body physics', () => {
  it('integrateMotion mengubah posisi berdasarkan velocity', () => {
    const entity = createEntity('test');
    entity.position = { x: 0, y: 0 };
    entity.velocity = { x: 10, y: 5 };

    integrateMotion(entity, 0.1);
    expect(entity.position.x).toBeCloseTo(1, 5);
    expect(entity.position.y).toBeCloseTo(0.5, 5);
  });

  it('applyMovementInput mengubah velocity berdasarkan input arah', () => {
    const entity = createEntity('test');
    entity.velocity = { x: 0, y: 0 };

    applyMovementInput(entity, { up: true, down: false, left: false, right: false });
    expect(entity.velocity.y).toBe(-5);
    expect(entity.velocity.x).toBe(0);
  });

  it('determinism: hasil sama untuk entity identik', () => {
    const entityA = createEntity('a');
    entityA.velocity = { x: 5, y: 0 };
    entityA.position = { x: 0, y: 0 };

    const entityB = createEntity('b');
    entityB.velocity = { x: 5, y: 0 };
    entityB.position = { x: 0, y: 0 };

    for (let i = 0; i < 10; i++) {
      integrateMotion(entityA, 1 / 30);
      integrateMotion(entityB, 1 / 30);
    }

    expect(entityA.position.x).toBe(entityB.position.x);
    expect(entityA.position.y).toBe(entityB.position.y);
  });
});
