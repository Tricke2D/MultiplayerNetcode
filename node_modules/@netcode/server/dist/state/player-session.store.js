export class PlayerSessionStore {
    constructor() {
        this.sessions = new Map();
    }
    createSession(connectionId, entityId) {
        this.sessions.set(connectionId, {
            connectionId,
            entityId,
            lastProcessedInputTick: 0,
            estimatedRttMs: 100, // default aman, akan di-update
        });
    }
    removeSession(connectionId) {
        this.sessions.delete(connectionId);
    }
    getSession(connectionId) {
        return this.sessions.get(connectionId);
    }
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    markInputProcessed(connectionId, tick) {
        const session = this.sessions.get(connectionId);
        if (session)
            session.lastProcessedInputTick = tick;
    }
    updateRtt(connectionId, measuredRttMs) {
        const session = this.sessions.get(connectionId);
        if (!session)
            return;
        const alpha = 0.2;
        session.estimatedRttMs = session.estimatedRttMs * (1 - alpha) + measuredRttMs * alpha;
    }
    getRtt(connectionId) {
        const session = this.sessions.get(connectionId);
        return session?.estimatedRttMs ?? 100;
    }
}
