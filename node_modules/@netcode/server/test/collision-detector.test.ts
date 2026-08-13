import { raycastAgainstAABB, getAABBFromPosition } from '../src/physics/collision-detector.js';

describe('raycastAgainstAABB', () => {
  it('mendeteksi hit saat ray menembus box secara langsung', () => {
    const aabb = getAABBFromPosition({ x: 5, y: 0 });
    const hit = raycastAgainstAABB(
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      aabb,
      50
    );
    expect(hit).toBe(true);
  });

  it('tidak mendeteksi hit saat ray meleset dari box', () => {
    const aabb = getAABBFromPosition({ x: 5, y: 10 });
    const hit = raycastAgainstAABB(
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      aabb,
      50
    );
    expect(hit).toBe(false);
  });

  it('tidak mendeteksi hit kalau box di luar jangkauan maxDistance', () => {
    const aabb = getAABBFromPosition({ x: 100, y: 0 });
    const hit = raycastAgainstAABB(
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      aabb,
      50
    );
    expect(hit).toBe(false);
  });
});
