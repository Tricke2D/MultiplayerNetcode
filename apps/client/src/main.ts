import { SocketClient } from './network/socket-client.js';
import { InputPredictor } from './prediction/input-predictor.js';
import { CanvasRenderer, RemoteEntityRenderData } from './render/canvas-renderer.js';
import { reconcile } from './prediction/reconciliation.service.js';
import { SnapshotBuffer } from './prediction/snapshot-buffer.js';
import { TickNumber, PlayerInput, NetworkMessage, ShootMessage } from '@netcode/shared';

const ARTIFICIAL_DELAY_MS = 150;

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const renderer = new CanvasRenderer(canvas);
const predictor = new InputPredictor();
const snapshotBuffer = new SnapshotBuffer();
const socket = new SocketClient('ws://localhost:8080', ARTIFICIAL_DELAY_MS);

let localEntityId: string | null = null;
let localTick: TickNumber = 0;
let reconcileCount = 0;
let divergenceCount = 0;
let hitCount = 0;

const keys: Record<string, boolean> = {};
let mouseX = 0;
let mouseY = 0;

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  e.preventDefault();
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  e.preventDefault();
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
  if (!localEntityId) return;
  
  const rect = canvas.getBoundingClientRect();
  const scale = 20;
  const offsetX = 400;
  const offsetY = 300;
  
  const worldX = (mouseX - offsetX) / scale;
  const worldY = (mouseY - offsetY) / scale;
  
  const localPos = predictor.getLocalPosition();
  const direction = {
    x: worldX - localPos.x,
    y: worldY - localPos.y,
  };
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  if (length === 0) return;
  direction.x /= length;
  direction.y /= length;

  const shootMsg: ShootMessage = {
    type: 'shoot',
    tick: localTick,
    origin: { ...localPos },
    direction,
  };
  socket.sendShoot(shootMsg);
  console.log(`[Shoot] Fired at (${worldX.toFixed(2)}, ${worldY.toFixed(2)})`);
});

function readKeyboardInput(): PlayerInput {
  return {
    up: keys['w'] || keys['ArrowUp'],
    down: keys['s'] || keys['ArrowDown'],
    left: keys['a'] || keys['ArrowLeft'],
    right: keys['d'] || keys['ArrowRight'],
    shoot: keys[' '],
  };
}

function getRemoteEntities(localId: string): RemoteEntityRenderData[] {
  const latest = snapshotBuffer.getLatestSnapshot();
  if (!latest) return [];

  return latest.entities
    .filter((e) => e.id !== localId)
    .map((e) => {
      const interpolated = snapshotBuffer.getInterpolatedPosition(e.id);
      return {
        id: e.id,
        position: interpolated || e.position,
      };
    });
}

socket.onMessage((message: NetworkMessage) => {
  if (message.type === 'welcome') {
    localEntityId = message.entityId;
    console.log('[Client] Welcome! Entity ID:', localEntityId);
    return;
  }

  if (message.type === 'ping') {
    socket.sendPong(message.serverSentAtMs);
    return;
  }

  if (message.type === 'hit_confirmed') {
    hitCount++;
    console.log(`[Hit! #${hitCount}] You hit ${message.targetEntityId} at tick ${message.tick}! ??`);
    return;
  }

  if (message.type === 'snapshot') {
    snapshotBuffer.addSnapshot(message);

    if (localEntityId) {
      reconcileCount++;
      const result = reconcile(message, localEntityId, predictor.getPredictionLog());
      
      if (result) {
        if (result.didDiverge) {
          divergenceCount++;
          console.log(`[Reconcile #${reconcileCount}] ?? DIVERGENCE detected!`);
          predictor.applyReconciliationCorrection(result.correctedPosition, result.unconfirmedEntries);
        } else {
          predictor.pruneConfirmedEntries(message.yourLastProcessedInputTick);
          if (reconcileCount % 20 === 0) {
            console.log(`[Reconcile #${reconcileCount}] ? No divergence. Log: ${predictor.getPredictionLog().length}`);
          }
        }
      }
    }
  }
});

function gameLoop(): void {
  localTick++;
  const input = readKeyboardInput();
  
  const predictedPosition = predictor.applyLocalInput(localTick, input);
  
  if (socket.isConnected()) {
    socket.sendInput(localTick, input);
  }

  const remoteEntities = localEntityId ? getRemoteEntities(localEntityId) : [];

  renderer.renderFrame(predictedPosition, remoteEntities);

  if (localTick % 60 === 0) {
    console.log(`[Tick ${localTick}] Pos: (${predictedPosition.x.toFixed(2)}, ${predictedPosition.y.toFixed(2)}) | Remote: ${remoteEntities.length} | Hits: ${hitCount}`);
  }

  requestAnimationFrame(gameLoop);
}

console.log('[Client] Starting game loop...');
console.log(`[Client] Artificial delay: ${ARTIFICIAL_DELAY_MS}ms`);
console.log('[Client] Click on canvas to shoot!');
gameLoop();
