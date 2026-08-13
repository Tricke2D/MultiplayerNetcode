export function createEntity(id) {
    return {
        id,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        health: 100,
    };
}
