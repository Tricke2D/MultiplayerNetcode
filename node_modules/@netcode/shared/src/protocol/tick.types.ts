export type TickNumber = number;

export const SIMULATION_CONFIG = {
  TICK_RATE_HZ: 30,
  FIXED_DELTA_TIME_MS: 1000 / 30,
  INTERPOLATION_DELAY_MS: 100,
} as const;
