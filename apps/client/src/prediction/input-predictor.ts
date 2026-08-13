import { PlayerInput } from '@netcode/shared';
import { TickNumber } from '@netcode/shared';
import { Vector2, addVector, scaleVector } from '@netcode/shared';

export interface PredictionLogEntry {
  tick: TickNumber;
  input: PlayerInput;
  predictedPosition: Vector2;
}

const MOVE_SPEED = 5;
const FIXED_DELTA_SECONDS = 1 / 30;

export class InputPredictor {
  private localPosition: Vector2 = { x: 0, y: 0 };
  private predictionLog: PredictionLogEntry[] = [];

  applyLocalInput(tick: TickNumber, input: PlayerInput): Vector2 {
    const velocity = this.inputToVelocity(input);
    const displacement = scaleVector(velocity, FIXED_DELTA_SECONDS);
    this.localPosition = addVector(this.localPosition, displacement);

    this.predictionLog.push({
      tick,
      input,
      predictedPosition: { ...this.localPosition },
    });

    return this.localPosition;
  }

  private inputToVelocity(input: PlayerInput): Vector2 {
    let x = 0;
    let y = 0;
    if (input.up) y -= 1;
    if (input.down) y += 1;
    if (input.left) x -= 1;
    if (input.right) x += 1;
    return { x: x * MOVE_SPEED, y: y * MOVE_SPEED };
  }

  getLocalPosition(): Vector2 {
    return this.localPosition;
  }

  getPredictionLog(): PredictionLogEntry[] {
    return this.predictionLog;
  }

  reset(): void {
    this.localPosition = { x: 0, y: 0 };
    this.predictionLog = [];
  }

  applyReconciliationCorrection(
    correctedPosition: Vector2,
    unconfirmedEntries: PredictionLogEntry[]
  ): void {
    let replayPosition = { ...correctedPosition };
    const replayedLog: PredictionLogEntry[] = [];

    for (const entry of unconfirmedEntries.sort((a, b) => a.tick - b.tick)) {
      const velocity = this.inputToVelocity(entry.input);
      const displacement = scaleVector(velocity, FIXED_DELTA_SECONDS);
      replayPosition = addVector(replayPosition, displacement);

      replayedLog.push({
        tick: entry.tick,
        input: entry.input,
        predictedPosition: { ...replayPosition },
      });
    }

    this.localPosition = replayPosition;
    this.predictionLog = replayedLog;
  }

  pruneConfirmedEntries(confirmedTick: TickNumber): void {
    this.predictionLog = this.predictionLog.filter((entry) => entry.tick > confirmedTick);
  }
}
