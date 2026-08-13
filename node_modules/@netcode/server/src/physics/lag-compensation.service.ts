import { Vector2 } from '@netcode/shared';
import { SnapshotHistoryStore } from '../state/snapshot-history.store.js';
import { TickNumber, SIMULATION_CONFIG } from '@netcode/shared';
import { raycastAgainstAABB, getAABBFromPosition } from './collision-detector.js';

const SHOOT_MAX_DISTANCE = 50;

export interface ShootRequest {
  shooterEntityId: string;
  shooterTick: TickNumber;
  origin: Vector2;
  direction: Vector2;
}

export function calculateRewindTicks(
  estimatedRttMs: number,
  clientRenderDelayMs: number,
  fixedDeltaMs: number
): number {
  const oneWayLatencyMs = estimatedRttMs / 2;
  const totalCompensationMs = oneWayLatencyMs + clientRenderDelayMs;
  return Math.round(totalCompensationMs / fixedDeltaMs);
}

export function performRewoundHitTest(
  request: ShootRequest,
  rewindTicks: number,
  historyStore: SnapshotHistoryStore
): string | null {
  const targetTick = Math.max(0, request.shooterTick - rewindTicks);
  const historicalEntities = historyStore.getSnapshotAtTick(targetTick);
  if (!historicalEntities) return null;

  console.log(`[LagComp] Rewinding to tick ${targetTick} (${rewindTicks} ticks back)`);

  for (const entity of historicalEntities) {
    if (entity.id === request.shooterEntityId) continue;

    const aabb = getAABBFromPosition(entity.position);
    const isHit = raycastAgainstAABB(
      request.origin,
      request.direction,
      aabb,
      SHOOT_MAX_DISTANCE
    );
    
    if (isHit) {
      console.log(`[LagComp] HIT detected on ${entity.id} at (${entity.position.x.toFixed(2)}, ${entity.position.y.toFixed(2)})`);
      return entity.id;
    }
  }

  console.log(`[LagComp] MISS - no target hit`);
  return null;
}
