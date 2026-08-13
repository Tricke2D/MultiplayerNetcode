import { TickNumber } from '@netcode/shared';

interface PlayerSession {
  connectionId: string;
  entityId: string;
  lastProcessedInputTick: TickNumber;
  estimatedRttMs: number;
}

export class PlayerSessionStore {
  private sessions = new Map<string, PlayerSession>();

  createSession(connectionId: string, entityId: string): void {
    this.sessions.set(connectionId, {
      connectionId,
      entityId,
      lastProcessedInputTick: 0,
      estimatedRttMs: 100, // default aman, akan di-update
    });
  }

  removeSession(connectionId: string): void {
    this.sessions.delete(connectionId);
  }

  getSession(connectionId: string): PlayerSession | undefined {
    return this.sessions.get(connectionId);
  }

  getAllSessions(): PlayerSession[] {
    return Array.from(this.sessions.values());
  }

  markInputProcessed(connectionId: string, tick: TickNumber): void {
    const session = this.sessions.get(connectionId);
    if (session) session.lastProcessedInputTick = tick;
  }

  updateRtt(connectionId: string, measuredRttMs: number): void {
    const session = this.sessions.get(connectionId);
    if (!session) return;
    const alpha = 0.2;
    session.estimatedRttMs = session.estimatedRttMs * (1 - alpha) + measuredRttMs * alpha;
  }

  getRtt(connectionId: string): number {
    const session = this.sessions.get(connectionId);
    return session?.estimatedRttMs ?? 100;
  }
}
