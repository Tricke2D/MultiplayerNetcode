import { NetworkMessage } from '@netcode/shared';

export function encodeMessage(message: NetworkMessage): string {
  return JSON.stringify(message);
}

export function decodeMessage(raw: string): NetworkMessage | null {
  try {
    const parsed = JSON.parse(raw);
    const validTypes = ['input', 'snapshot', 'welcome', 'ping', 'pong', 'shoot', 'hit_confirmed'];
    if (parsed.type && validTypes.includes(parsed.type)) {
      return parsed as NetworkMessage;
    }
    return null;
  } catch {
    return null;
  }
}
