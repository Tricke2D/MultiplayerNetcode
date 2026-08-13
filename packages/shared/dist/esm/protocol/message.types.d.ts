import { TickNumber } from './tick.types.js';
export interface PlayerInput {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    shoot: boolean;
}
export interface InputMessage {
    type: 'input';
    tick: TickNumber;
    input: PlayerInput;
}
export interface SnapshotMessage {
    type: 'snapshot';
    tick: TickNumber;
    yourLastProcessedInputTick: TickNumber;
    entities: Array<{
        id: string;
        position: {
            x: number;
            y: number;
        };
        velocity: {
            x: number;
            y: number;
        };
    }>;
}
export interface WelcomeMessage {
    type: 'welcome';
    entityId: string;
}
export interface PingMessage {
    type: 'ping';
    serverSentAtMs: number;
}
export interface PongMessage {
    type: 'pong';
    serverSentAtMs: number;
}
export interface ShootMessage {
    type: 'shoot';
    tick: TickNumber;
    origin: {
        x: number;
        y: number;
    };
    direction: {
        x: number;
        y: number;
    };
}
export interface HitConfirmedMessage {
    type: 'hit_confirmed';
    targetEntityId: string;
    tick: TickNumber;
}
export type NetworkMessage = InputMessage | SnapshotMessage | WelcomeMessage | PingMessage | PongMessage | ShootMessage | HitConfirmedMessage;
//# sourceMappingURL=message.types.d.ts.map