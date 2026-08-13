import { PlayerInput } from '@netcode/shared';
import { TickNumber } from '@netcode/shared';

interface BufferedInput {
  tick: TickNumber;
  input: PlayerInput;
}

const MAX_BUFFERED_TICKS = 300;

export class InputBufferStore {
  private buffers = new Map<string, BufferedInput[]>();

  recordInput(playerId: string, tick: TickNumber, input: PlayerInput): void {
    const playerBuffer = this.buffers.get(playerId) ?? [];
    playerBuffer.push({ tick, input });

    if (playerBuffer.length > MAX_BUFFERED_TICKS) {
      playerBuffer.shift();
    }

    this.buffers.set(playerId, playerBuffer);
  }

  getInputAtTick(playerId: string, tick: TickNumber): PlayerInput | undefined {
    const playerBuffer = this.buffers.get(playerId);
    return playerBuffer?.find((entry) => entry.tick === tick)?.input;
  }
}
