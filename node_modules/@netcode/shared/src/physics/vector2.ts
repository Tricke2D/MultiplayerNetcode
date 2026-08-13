export interface Vector2 {
  x: number;
  y: number;
}

export function addVector(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scaleVector(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function vectorsAreEqual(a: Vector2, b: Vector2, epsilon = 1e-6): boolean {
  return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
}

export function lerpVector(a: Vector2, b: Vector2, t: number): Vector2 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}
