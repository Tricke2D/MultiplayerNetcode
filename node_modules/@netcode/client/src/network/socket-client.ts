import { 
  InputMessage, PlayerInput, NetworkMessage, PingMessage, 
  PongMessage, ShootMessage, HitConfirmedMessage 
} from '@netcode/shared';
import { TickNumber } from '@netcode/shared';
import { NetworkSimulator } from './network-simulator.js';

export class SocketClient {
  private socket: WebSocket;
  private simulator: NetworkSimulator | null;

  constructor(serverUrl: string, artificialDelayMs: number = 0) {
    this.simulator = artificialDelayMs > 0 ? new NetworkSimulator(artificialDelayMs) : null;
    this.socket = new WebSocket(serverUrl);
    this.socket.onopen = () => console.log('[Client] Terhubung ke server');
    this.socket.onclose = () => console.log('[Client] Koneksi ke server terputus');
    this.socket.onerror = (err) => console.error('[Client] WebSocket error:', err);
  }

  sendInput(tick: TickNumber, input: PlayerInput): void {
    if (this.socket.readyState !== WebSocket.OPEN) return;

    const message: InputMessage = { type: 'input', tick, input };
    const send = () => this.socket.send(JSON.stringify(message));
    
    if (this.simulator) {
      this.simulator.delay(send);
    } else {
      send();
    }
  }

  sendPong(serverSentAtMs: number): void {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    const message: PongMessage = { type: 'pong', serverSentAtMs };
    this.socket.send(JSON.stringify(message));
  }

  sendShoot(message: ShootMessage): void {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    const send = () => this.socket.send(JSON.stringify(message));
    if (this.simulator) {
      this.simulator.delay(send);
    } else {
      send();
    }
  }

  onMessage(handler: (message: NetworkMessage) => void): void {
    this.socket.onmessage = (event) => {
      const deliver = () => {
        try {
          const parsed = JSON.parse(event.data);
          const validTypes = ['input', 'snapshot', 'welcome', 'ping', 'pong', 'shoot', 'hit_confirmed'];
          if (parsed.type && validTypes.includes(parsed.type)) {
            handler(parsed as NetworkMessage);
          }
        } catch (e) {
          console.error('[Client] Failed to parse message:', e);
        }
      };
      
      if (this.simulator) {
        this.simulator.delay(deliver);
      } else {
        deliver();
      }
    };
  }

  isConnected(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }
}
