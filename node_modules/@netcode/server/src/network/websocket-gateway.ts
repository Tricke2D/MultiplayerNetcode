import { WebSocketServer, WebSocket } from 'ws';
import { serverConfig } from '../config/server.config.js';
import { decodeMessage, encodeMessage } from './message-codec.js';
import { GameStateStore } from '../state/game-state.store.js';
import { InputBufferStore } from '../state/input-buffer.store.js';
import { PlayerSessionStore } from '../state/player-session.store.js';
import { SnapshotHistoryStore } from '../state/snapshot-history.store.js';
import { createEntity } from '../state/entity.model.js';
import { WelcomeMessage, HitConfirmedMessage, SIMULATION_CONFIG } from '@netcode/shared';
import { performRewoundHitTest, calculateRewindTicks } from '../physics/lag-compensation.service.js';

const activeConnections = new Map<string, WebSocket>();
let connectionCounter = 0;

function generateConnectionId(): string {
  connectionCounter += 1;
  return `conn-${connectionCounter}`;
}

export function createWebSocketGateway(
  gameStateStore: GameStateStore,
  inputBufferStore: InputBufferStore,
  playerSessionStore: PlayerSessionStore,
  snapshotHistoryStore: SnapshotHistoryStore
): WebSocketServer {
  const wss = new WebSocketServer({ port: serverConfig.port, host: serverConfig.host });

  wss.on('connection', (socket: WebSocket) => {
    const connectionId = generateConnectionId();
    activeConnections.set(connectionId, socket);

    const entity = createEntity(connectionId);
    gameStateStore.addEntity(entity);
    playerSessionStore.createSession(connectionId, entity.id);

    const welcome: WelcomeMessage = { type: 'welcome', entityId: entity.id };
    socket.send(encodeMessage(welcome));

    console.log(`[WS] Client connected: ${connectionId} (total: ${activeConnections.size})`);

    socket.on('message', (rawData) => {
      const message = decodeMessage(rawData.toString());
      if (!message) return;

      switch (message.type) {
        case 'input':
          inputBufferStore.recordInput(connectionId, message.tick, message.input);
          break;

        case 'pong': {
          const measuredRtt = Date.now() - message.serverSentAtMs;
          playerSessionStore.updateRtt(connectionId, measuredRtt);
          const rtt = playerSessionStore.getRtt(connectionId);
          break;
        }

        case 'shoot': {
          const session = playerSessionStore.getSession(connectionId);
          if (!session) return;

          const rewindTicks = calculateRewindTicks(
            session.estimatedRttMs,
            SIMULATION_CONFIG.INTERPOLATION_DELAY_MS || 100,
            SIMULATION_CONFIG.FIXED_DELTA_TIME_MS
          );

          const hitEntityId = performRewoundHitTest(
            {
              shooterEntityId: entity.id,
              shooterTick: gameStateStore.getCurrentTick(),
              origin: message.origin,
              direction: message.direction,
            },
            rewindTicks,
            snapshotHistoryStore
          );

          if (hitEntityId) {
            const hitConfirmed: HitConfirmedMessage = {
              type: 'hit_confirmed',
              targetEntityId: hitEntityId,
              tick: gameStateStore.getCurrentTick(),
            };
            socket.send(encodeMessage(hitConfirmed));
            console.log(`[Shot] ${connectionId} hit ${hitEntityId}!`);
          } else {
            console.log(`[Shot] ${connectionId} missed.`);
          }
          break;
        }

        default:
          break;
      }
    });

    socket.on('close', () => {
      activeConnections.delete(connectionId);
      gameStateStore.removeEntity(entity.id);
      playerSessionStore.removeSession(connectionId);
      console.log(`[WS] Client disconnected: ${connectionId} (total: ${activeConnections.size})`);
    });

    socket.on('error', (err) => {
      console.error(`[WS] Error pada koneksi ${connectionId}:`, err);
    });
  });

  return wss;
}

export function getActiveConnections(): Map<string, WebSocket> {
  return activeConnections;
}
