import { createWebSocketGateway, getActiveConnections } from './network/websocket-gateway.js';
import { serverConfig } from './config/server.config.js';
import { TickClock } from './core/tick-clock.js';
import { GameStateStore } from './state/game-state.store.js';
import { InputBufferStore } from './state/input-buffer.store.js';
import { PlayerSessionStore } from './state/player-session.store.js';
import { SnapshotHistoryStore } from './state/snapshot-history.store.js';
import { applyMovementInput, integrateMotion } from './physics/rigid-body.js';
import { encodeMessage } from './network/message-codec.js';
import { startLatencyPinger } from './network/latency-pinger.js';
function bootstrap() {
    const gameStateStore = new GameStateStore();
    const inputBufferStore = new InputBufferStore();
    const playerSessionStore = new PlayerSessionStore();
    const snapshotHistoryStore = new SnapshotHistoryStore();
    createWebSocketGateway(gameStateStore, inputBufferStore, playerSessionStore, snapshotHistoryStore);
    // Start RTT ping/pong
    startLatencyPinger(playerSessionStore);
    const tickClock = new TickClock((tickNumber, fixedDeltaSeconds) => {
        gameStateStore.setCurrentTick(tickNumber);
        for (const session of playerSessionStore.getAllSessions()) {
            const entity = gameStateStore.getEntity(session.entityId);
            if (!entity)
                continue;
            const input = inputBufferStore.getInputAtTick(session.connectionId, tickNumber);
            if (input) {
                applyMovementInput(entity, input);
                playerSessionStore.markInputProcessed(session.connectionId, tickNumber);
            }
            integrateMotion(entity, fixedDeltaSeconds);
        }
        snapshotHistoryStore.recordTick(tickNumber, gameStateStore.getAllEntities());
        broadcastPersonalizedSnapshots(gameStateStore, playerSessionStore, tickNumber);
    });
    tickClock.start();
    console.log(`[Server] Netcode engine server berjalan di ${serverConfig.host}:${serverConfig.port}`);
    console.log(`[Server] Snapshot history window: 60 ticks (~2 detik)`);
    console.log(`[Server] RTT ping interval: 2000ms`);
}
function broadcastPersonalizedSnapshots(store, sessionStore, tick) {
    const entities = store.getAllEntities().map((e) => ({
        id: e.id,
        position: e.position,
        velocity: e.velocity,
    }));
    for (const session of sessionStore.getAllSessions()) {
        const socket = getActiveConnections().get(session.connectionId);
        if (!socket || socket.readyState !== socket.OPEN)
            continue;
        const snapshot = {
            type: 'snapshot',
            tick,
            yourLastProcessedInputTick: session.lastProcessedInputTick,
            entities,
        };
        socket.send(encodeMessage(snapshot));
    }
}
bootstrap();
