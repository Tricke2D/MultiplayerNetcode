import { Vector2, lerpVector, SIMULATION_CONFIG } from '@netcode/shared';
import { SnapshotMessage } from '@netcode/shared';

interface BufferedSnapshot {
  receivedAtMs: number;
  snapshot: SnapshotMessage;
}

const RENDER_DELAY_MS = SIMULATION_CONFIG.INTERPOLATION_DELAY_MS;
const MAX_BUFFERED_SNAPSHOTS = 30;

export class SnapshotBuffer {
  private buffer: BufferedSnapshot[] = [];

  addSnapshot(snapshot: SnapshotMessage): void {
    this.buffer.push({ receivedAtMs: Date.now(), snapshot });
    if (this.buffer.length > MAX_BUFFERED_SNAPSHOTS) {
      this.buffer.shift();
    }
  }

  getInterpolatedPosition(entityId: string): Vector2 | null {
    const renderTimestamp = Date.now() - RENDER_DELAY_MS;

    let before: BufferedSnapshot | null = null;
    let after: BufferedSnapshot | null = null;

    for (let i = 0; i < this.buffer.length - 1; i += 1) {
      const current = this.buffer[i];
      const next = this.buffer[i + 1];
      if (current.receivedAtMs <= renderTimestamp && next.receivedAtMs >= renderTimestamp) {
        before = current;
        after = next;
        break;
      }
    }

    if (!before || !after) {
      const latest = this.buffer[this.buffer.length - 1];
      const entity = latest?.snapshot.entities.find((e) => e.id === entityId);
      return entity ? entity.position : null;
    }

    const entityBefore = before.snapshot.entities.find((e) => e.id === entityId);
    const entityAfter = after.snapshot.entities.find((e) => e.id === entityId);
    if (!entityBefore || !entityAfter) return null;

    const t = (renderTimestamp - before.receivedAtMs) / (after.receivedAtMs - before.receivedAtMs);

    return lerpVector(entityBefore.position, entityAfter.position, t);
  }

  getLatestSnapshot(): SnapshotMessage | null {
    if (this.buffer.length === 0) return null;
    return this.buffer[this.buffer.length - 1].snapshot;
  }
}
