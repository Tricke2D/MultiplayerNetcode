import { PlayerSessionStore } from '../state/player-session.store.js';
import { getActiveConnections } from './websocket-gateway.js';
import { encodeMessage } from './message-codec.js';
import { PingMessage } from '@netcode/shared';

const PING_INTERVAL_MS = 2000;

export function startLatencyPinger(sessionStore: PlayerSessionStore): void {
  setInterval(() => {
    for (const session of sessionStore.getAllSessions()) {
      const socket = getActiveConnections().get(session.connectionId);
      if (!socket || socket.readyState !== socket.OPEN) continue;

      const ping: PingMessage = { type: 'ping', serverSentAtMs: Date.now() };
      socket.send(encodeMessage(ping));
    }
  }, PING_INTERVAL_MS);
}
