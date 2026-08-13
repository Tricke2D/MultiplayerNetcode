const ENTITY_HALF_SIZE = 0.5;
export function getAABBFromPosition(position) {
    return {
        minX: position.x - ENTITY_HALF_SIZE,
        maxX: position.x + ENTITY_HALF_SIZE,
        minY: position.y - ENTITY_HALF_SIZE,
        maxY: position.y + ENTITY_HALF_SIZE,
    };
}
function getEntityAABB(entity) {
    return getAABBFromPosition(entity.position);
}
export function areEntitiesColliding(a, b) {
    const boxA = getEntityAABB(a);
    const boxB = getEntityAABB(b);
    const overlapX = boxA.minX < boxB.maxX && boxA.maxX > boxB.minX;
    const overlapY = boxA.minY < boxB.maxY && boxA.maxY > boxB.minY;
    return overlapX && overlapY;
}
export function raycastAgainstAABB(origin, direction, aabb, maxDistance) {
    const invDirX = direction.x !== 0 ? 1 / direction.x : Infinity;
    const invDirY = direction.y !== 0 ? 1 / direction.y : Infinity;
    let tMinX = (aabb.minX - origin.x) * invDirX;
    let tMaxX = (aabb.maxX - origin.x) * invDirX;
    if (tMinX > tMaxX)
        [tMinX, tMaxX] = [tMaxX, tMinX];
    let tMinY = (aabb.minY - origin.y) * invDirY;
    let tMaxY = (aabb.maxY - origin.y) * invDirY;
    if (tMinY > tMaxY)
        [tMinY, tMaxY] = [tMaxY, tMinY];
    const tEnter = Math.max(tMinX, tMinY);
    const tExit = Math.min(tMaxX, tMaxY);
    if (tEnter > tExit)
        return false;
    if (tExit < 0)
        return false;
    if (tEnter > maxDistance)
        return false;
    return true;
}
