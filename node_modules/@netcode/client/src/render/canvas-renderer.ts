import { Vector2 } from '@netcode/shared';

export interface RemoteEntityRenderData {
  id: string;
  position: Vector2;
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private readonly SCALE = 20;
  private readonly OFFSET_X = 400;
  private readonly OFFSET_Y = 300;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context tidak tersedia');
    this.ctx = context;
  }

  renderFrame(localPosition: Vector2, remoteEntities: RemoteEntityRenderData[]): void {
    const SCALE = this.SCALE;
    const OFFSET_X = this.OFFSET_X;
    const OFFSET_Y = this.OFFSET_Y;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid
    this.ctx.strokeStyle = '#2a2a4a';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.canvas.width; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }
    for (let i = 0; i < this.canvas.height; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();
    }

    // Draw remote entities (biru)
    for (const remote of remoteEntities) {
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.shadowColor = '#3b82f6';
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(
        OFFSET_X + remote.position.x * SCALE,
        OFFSET_Y + remote.position.y * SCALE,
        10,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Label ID
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#60a5fa';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(
        remote.id.slice(0, 6),
        OFFSET_X + remote.position.x * SCALE - 15,
        OFFSET_Y + remote.position.y * SCALE - 20
      );
    }

    // Draw local entity (hijau)
    this.ctx.fillStyle = '#22c55e';
    this.ctx.shadowColor = '#22c55e';
    this.ctx.shadowBlur = 25;
    this.ctx.beginPath();
    this.ctx.arc(
      OFFSET_X + localPosition.x * SCALE,
      OFFSET_Y + localPosition.y * SCALE,
      12,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Label posisi local
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(
      `(${localPosition.x.toFixed(2)}, ${localPosition.y.toFixed(2)})`,
      OFFSET_X + localPosition.x * SCALE - 40,
      OFFSET_Y + localPosition.y * SCALE - 25
    );

    // Legend
    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillRect(10, 10, 12, 12);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText('You', 28, 22);

    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(10, 30, 12, 12);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('Other', 28, 42);
  }
}
