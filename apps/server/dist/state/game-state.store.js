export class GameStateStore {
    constructor() {
        this.entities = new Map();
        this.currentTick = 0;
    }
    addEntity(entity) {
        this.entities.set(entity.id, entity);
    }
    removeEntity(entityId) {
        this.entities.delete(entityId);
    }
    getEntity(entityId) {
        return this.entities.get(entityId);
    }
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    setCurrentTick(tick) {
        this.currentTick = tick;
    }
    getCurrentTick() {
        return this.currentTick;
    }
}
