import { raycastAgainstAABB, getAABBFromPosition } from './collision-detector.js';
const SHOOT_MAX_DISTANCE = 50;
export function calculateRewindTicks(estimatedRttMs, clientRenderDelayMs, fixedDeltaMs) {
    const oneWayLatencyMs = estimatedRttMs / 2;
    const totalCompensationMs = oneWayLatencyMs + clientRenderDelayMs;
    return Math.round(totalCompensationMs / fixedDeltaMs);
}
export function performRewoundHitTest(request, rewindTicks, historyStore) {
    const targetTick = Math.max(0, request.shooterTick - rewindTicks);
    const historicalEntities = historyStore.getSnapshotAtTick(targetTick);
    if (!historicalEntities)
        return null;
    console.log(`[LagComp] Rewinding to tick ${targetTick} (${rewindTicks} ticks back)`);
    for (const entity of historicalEntities) {
        if (entity.id === request.shooterEntityId)
            continue;
        const aabb = getAABBFromPosition(entity.position);
        const isHit = raycastAgainstAABB(request.origin, request.direction, aabb, SHOOT_MAX_DISTANCE);
        if (isHit) {
            console.log(`[LagComp] HIT detected on ${entity.id} at (${entity.position.x.toFixed(2)}, ${entity.position.y.toFixed(2)})`);
            return entity.id;
        }
    }
    console.log(`[LagComp] MISS - no target hit`);
    return null;
}
