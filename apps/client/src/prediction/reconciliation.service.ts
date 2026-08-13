import { Vector2, vectorsAreEqual } from '@netcode/shared';
import { SnapshotMessage } from '@netcode/shared';
import { PredictionLogEntry } from './input-predictor.js';

const DIVERGENCE_THRESHOLD = 0.05;

export interface ReconciliationResult {
  didDiverge: boolean;
  correctedPosition: Vector2;
  unconfirmedEntries: PredictionLogEntry[];
}

export function reconcile(
  snapshot: SnapshotMessage,
  localEntityId: string,
  predictionLog: PredictionLogEntry[]
): ReconciliationResult | null {
  const authoritativeEntity = snapshot.entities.find((e) => e.id === localEntityId);
  if (!authoritativeEntity) return null;

  const confirmedTick = snapshot.yourLastProcessedInputTick;
  const predictedEntry = predictionLog.find((entry) => entry.tick === confirmedTick);

  if (!predictedEntry) {
    return {
      didDiverge: false,
      correctedPosition: authoritativeEntity.position,
      unconfirmedEntries: predictionLog.filter((entry) => entry.tick > confirmedTick),
    };
  }

  const didDiverge = !vectorsAreEqual(
    predictedEntry.predictedPosition,
    authoritativeEntity.position,
    DIVERGENCE_THRESHOLD
  );

  const unconfirmedEntries = predictionLog.filter((entry) => entry.tick > confirmedTick);

  return {
    didDiverge,
    correctedPosition: authoritativeEntity.position,
    unconfirmedEntries,
  };
}
