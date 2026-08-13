const MAX_BUFFERED_TICKS = 300;
export class InputBufferStore {
    constructor() {
        this.buffers = new Map();
    }
    recordInput(playerId, tick, input) {
        const playerBuffer = this.buffers.get(playerId) ?? [];
        playerBuffer.push({ tick, input });
        if (playerBuffer.length > MAX_BUFFERED_TICKS) {
            playerBuffer.shift();
        }
        this.buffers.set(playerId, playerBuffer);
    }
    getInputAtTick(playerId, tick) {
        const playerBuffer = this.buffers.get(playerId);
        return playerBuffer?.find((entry) => entry.tick === tick)?.input;
    }
}
