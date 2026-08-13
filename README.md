# 🎮 Netcode Engine

Real-time multiplayer netcode engine dengan client-side prediction, server reconciliation, entity interpolation, dan lag compensation.

Sebuah implementasi lengkap netcode untuk game multiplayer real-time yang memungkinkan gerakan instan, tembakan akurat, dan pengalaman bermain yang mulus bahkan dengan latency tinggi.

## 📋 TL;DR

### Apa?
Sebuah engine netcode untuk game multiplayer real-time yang menangani komunikasi client-server, prediksi gerakan, koreksi posisi, dan kompensasi lag.

### Untuk siapa?
Developer game yang ingin membangun multiplayer real-time dengan arsitektur client-server.

### Masalah apa?
Latency jaringan membuat game multiplayer terasa lambat dan tidak responsif. Pemain melihat tembakan mereka meleset karena posisi target sudah berbeda di server.

### Bagaimana solusinya?
Client memprediksi gerakan secara lokal (instan), server mengoreksi jika prediksi meleset, pemain lain digerakkan secara halus, dan server "memundurkan waktu" saat mengecek tembakan.

### Apa output utamanya?
Prototipe fungsional netcode engine dengan 3 fase implementasi lengkap yang dapat dijalankan di localhost.

## ❓ Problem

### Masalah

Dalam game multiplayer real-time, latency jaringan adalah musuh utama.

| Masalah | Dampak |
|---------|--------|
| Input lag | Pemain menekan tombol, karakter bergerak 100-300ms kemudian |
| Gerakan patah-patah | Pemain lain terlihat "teleport" karena update dari server jarang |
| Tembakan meleset | Pemain menembak target di layar, tapi di server target sudah pindah |

### Mengapa Ini Sulit

Game real-time membutuhkan:

- **Responsivitas instan** — pemain harus merasakan kontrol yang langsung
- **Keadilan** — tembakan harus dihitung berdasarkan apa yang pemain lihat
- **Konsistensi** — semua pemain harus melihat dunia yang sama

### Solusi yang Ada

| Pendekatan | Kelemahan |
|-----------|----------|
| Tunggu server setiap gerakan | Input lag tidak bisa diterima |
| Percaya client sepenuhnya | Mudah dicurangi (cheat) |
| Kirim posisi mentah dari server | Gerakan patah-patah (choppy) |

## 💡 Solution

### Pendekatan Kami

Kami menggabungkan 4 teknik standar industri:

1. **Client-Side Prediction** — client bergerak instan tanpa menunggu server
2. **Server Reconciliation** — server mengoreksi jika prediksi client meleset
3. **Entity Interpolation** — pemain lain digerakkan secara halus
4. **Lag Compensation** — server "rewind" waktu untuk mengecek tembakan

### Alur Kerja Sederhana

```
1. Pemain menekan tombol
   ↓
2. Client langsung memprediksi gerakan (instan!)
   ↓
3. Client mengirim input ke server
   ↓
4. Server memproses input (authoritative)
   ↓
5. Server broadcast snapshot ke semua client
   ↓
6. Client koreksi jika prediksi meleset
   ↓
7. Client render pemain lain dengan interpolasi halus
```

### Output untuk Pemain

| Aspek | Hasil |
|-------|-------|
| Gerakan | Instan, tidak ada delay terlihat |
| Gerakan pemain lain | Halus, tidak patah-patah |
| Tembakan | Akurat, sesuai apa yang dilihat pemain |
| Latency tolerance | Bekerja dengan delay hingga 150ms+ |

## ⚙️ How It Works

### Simple View

Bayangkan seperti ini:

Kamu mengendarai mobil di game balap. Karena jaringan, ada jeda antara kamu menekan gas dan mobilmu benar-benar bergerak di server.

Solusi kami:

- Mobilmu langsung bergerak di layarmu (prediksi)
- Server mencatat gerakanmu
- Kalau server berbeda (misal ada mobil lain di jalan), layarmu dikoreksi halus (reconciliation)
- Mobil pemain lain terlihat mulus karena diinterpolasi (dihaluskan)
- Kalau kamu menabrak mobil lain, server cek posisi saat kamu menembak (lag compensation)

### Technical View

#### Client-Side Prediction

Client memprediksi posisi berdasarkan input yang sama dengan server menggunakan physics engine yang identik.

#### Server Reconciliation

Server mengirim snapshot dengan `yourLastProcessedInputTick`. Client membandingkan prediksi vs snapshot. Jika meleset, client "snap" ke posisi server lalu replay semua input yang belum dikonfirmasi.

#### Entity Interpolation

Client menyimpan 30 snapshot terakhir. Untuk setiap entity remote, client mencari 2 snapshot yang mengapit waktu render (100ms yang lalu), lalu melakukan linear interpolation (lerp) di antaranya.

#### Lag Compensation

Server menyimpan history posisi semua entity selama 60 tick (~2 detik). Saat client menembak, server menghitung RTT player, lalu rewind ke tick yang sesuai dengan apa yang shooter lihat, baru melakukan hit detection.

#### RTT Tracking

Server mengirim `PingMessage` setiap 2 detik. Client membalas `PongMessage` dengan `serverSentAtMs` yang sama. Server menghitung RTT dan melakukan exponential moving average untuk stabilitas.

## ✨ Key Features

### User-facing Features

| Fitur | Deskripsi |
|-------|-----------|
| Gerakan instan | Tidak ada delay antara input dan gerakan |
| Multiplayer | Mendukung multiple client dalam satu server |
| Visual feedback | Warna berbeda untuk pemain sendiri (hijau) dan pemain lain (biru) |
| Tembakan | Klik untuk menembak dengan hit detection |
| Latency tolerance | Bekerja dengan artificial delay 150ms |

### Technical Capabilities

| Kemampuan | Deskripsi |
|-----------|-----------|
| Tick-based simulation | Fixed timestep 30Hz dengan accumulator pattern |
| Deterministic physics | Physics engine menghasilkan hasil yang sama untuk input yang sama |
| Dual-build shared package | Kode bersama (types, physics) tersedia untuk CJS dan ESM |
| Personalized snapshots | Snapshot per client dengan `yourLastProcessedInputTick` |
| Snapshot history | 60 tick history untuk lag compensation |
| RTT measurement | Server mengukur RTT sendiri (anti-cheat) |
| Rewind hit detection | Hit detection terhadap posisi historis |
| Network simulator | Artificial delay untuk testing |

## 🎯 Risk Scoring

### Risk Level (Sederhana)

| Level | Makna | Tindakan |
|-------|-------|----------|
| HIGH | Risiko tinggi, prediksi sangat meleset | Perlu koreksi segera |
| MEDIUM | Ada potensi masalah | Perlu review |
| LOW | Tidak ada divergence terdeteksi | Tidak ada tindakan |

### Technical Detail

- **Divergence threshold:** 0.05 unit simulasi
- **Prediction log:** Menyimpan history input untuk replay
- **Prune:** Entry yang sudah dikonfirmasi dibuang otomatis
- **Replay:** Input yang belum dikonfirmasi di-replay setelah snap

## 🏗️ Architecture

### Simple Architecture Explanation

Pengguna membuka browser (client) dan terhubung ke server Node.js via WebSocket. Server menjalankan game loop 30Hz, memproses input dari semua client, dan mengirim snapshot kembali. Client memprediksi gerakan secara lokal, sementara server menjadi sumber kebenaran (authoritative).

### Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  BROWSER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │   Canvas    │  │  Predictor  │  │  Reconciler │  │  Snapshot Buffer │    │
│  │  Renderer   │◄─│    (Local)  │  │  (Replay)   │  │  (Interpolation) │    │  
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────────┘    │
│         ▲                ▲               ▲                  ▲               │
│         └────────────────┼───────────────┼──────────────────┘               │
│                          │               │                                  │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                     Socket Client (WebSocket)                    │       │
│  │  - sendInput()   - sendShoot()   - sendPong()   - onMessage()    │       │
│  └──────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ WebSocket (ws://localhost:8080)
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   SERVER                                    │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                      WebSocket Gateway                             │     │
│  │  - Connection handler   - Message parser   - Broadcast             │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                        │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                        Game Loop (30Hz)                            │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │     │
│  │  │  TickClock   │  │  InputBuffer │  │   PlayerSessionStore    │   │     │ 
│  │  │  (Fixed DT)  │  │  (Per Player)│  │   (RTT Tracking)        │   │     │
│  │  └──────────────┘  └──────────────┘  └─────────────────────────┘   │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │     │
│  │  │  Physics     │  │  GameState   │  │   SnapshotHistory       │   │     │
│  │  │  (RigidBody) │  │  (Entities)  │  │   (60 tick window)      │   │     │
│  │  └──────────────┘  └──────────────┘  └─────────────────────────┘   │     │
│  │  ┌──────────────────────────────────────────────────────────────┐  │     │
│  │  │              Lag Compensation Service                        │  │     │
│  │  │  - calculateRewindTicks()   - performRewoundHitTest()        │  │     │
│  │  └──────────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### User Flow

1. Buka browser di http://localhost:5173
2. Client terhubung ke server via WebSocket
3. Tekan WASD — karakter bergerak instan
4. Klik di canvas — menembak ke arah kursor
5. Lihat pemain lain (biru) — bergerak halus

### Internal Processing Flow

#### INPUT FLOW:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Client                      │  Server                                       │
│                              │                                               │
│  1. Keydown                  │                                               │
│  2. applyLocalInput()        │                                               │
│  3. sendInput(tick, input)  ─┼──► 4. recordInput(tick, input)                │
│                              │  5. Game loop (every 33ms)                    │
│                              │      ├─ getInputAtTick(tick)                  │
│                              │      ├─ applyMovementInput(entity, input)     │
│                              │      ├─ integrateMotion(entity, dt)           │
│                              │      ├─ markInputProcessed(tick)              │
│                              │      └─ recordTick(history)                   │
│                              │  6. broadcastPersonalizedSnapshots()          │
│  8. onMessage(snapshot) ◄─── ┼──┘                                            │
│  9. reconcile()              │                                               │
│      ├─ if diverged: snap    │                                               │
│      └─ else: prune log      │                                               │
│  10. renderFrame()           │                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### SHOOT FLOW:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Client                      │  Server                                       │
│                              │                                               │
│  1. Mouse click              │                                               │
│  2. sendShoot(origin, dir) ──┼──► 3. calculateRewindTicks(RTT, delay)        │
│                              │  4. performRewoundHitTest(tick - rewind)      │
│                              │      ├─ getSnapshotAtTick()                   │
│                              │      ├─ raycastAgainstAABB()                  │
│                              │      └─ return hitEntityId or null            │
│                              │  5. sendHitConfirmed(targetId)                │
│  7. onMessage(hit_confirmed)◄┼──┘                                            │
│  8. console.log('Hit!')      │                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Technology | Role | Why It Is Used |
|------------|------|----------------|
| Node.js v20+ | Runtime server | Event-driven, cocok untuk real-time server |
| TypeScript | Bahasa utama | Type safety untuk kode yang kompleks |
| ws | WebSocket library | WebSocket mentah (bukan Socket.io) untuk kontrol penuh |
| Vite | Bundler client | Fast build & hot reload untuk browser |
| npm workspaces | Monorepo management | Memisahkan server, client, dan shared code |
| Jest + ts-jest | Testing framework | Unit test untuk determinism & lag compensation |
| Docker | Containerization | Menjalankan server di container |
| ESLint + Prettier | Code hygiene | Maintain code quality (direkomendasikan) |

## 📋 Requirements

### Required

| Requirement | Minimum |
|-------------|---------|
| Node.js | v20+ (LTS) |
| npm | v10+ |
| Docker | v24+ (opsional untuk container) |
| Git | v2+ |

### Recommended

| Requirement | Rekomendasi |
|-------------|------------|
| RAM | 4GB+ |
| Browser | Chrome/Edge/Firefox terbaru |
| VS Code | Dengan plugin TypeScript |
| Postman | Untuk testing WebSocket (opsional) |

### Ports Used

| Port | Service |
|------|---------|
| 8080 | WebSocket Server |
| 5173 | Vite Dev Server (Client) |

## 🚀 Quick Start

### Option A — Quick Start (Docker)

Cara termudah untuk menjalankan server:

```bash
# 1. Clone repository
git clone <repository-url>
cd netcode-engine

# 2. Build dan jalankan server
docker compose up --build
```

Server akan berjalan di `ws://localhost:8080`.

### Option B — Manual Setup

Untuk developer yang ingin menjalankan setiap komponen secara manual:

```bash
# 1. Clone repository
git clone <repository-url>
cd netcode-engine

# 2. Install dependencies
npm install

# 3. Build shared package
npm run build:shared

# 4. Build server
npm run build --workspace=@netcode/server

# 5. Run server (Terminal 1)
npm run dev:server
```

Server berjalan di `ws://localhost:8080`

```bash
# 6. Run client (Terminal 2)
npm run dev --workspace=@netcode/client
```

Client berjalan di http://localhost:5173

### Buka 2 Client untuk Test Multiplayer

```bash
# Buka tab normal
http://localhost:5173

# Buka tab incognito/private
http://localhost:5173
```

## 🎮 Usage

### Setelah Aplikasi Berjalan

1. Buka browser di http://localhost:5173
2. Lihat canvas — lingkaran hijau adalah pemainmu
3. Gerakkan dengan WASD atau Arrow Keys
4. Tembak dengan klik kiri di canvas ke arah target
5. Buka Console (F12) untuk melihat log:
   - `[Client] Welcome! Entity ID: conn-X`
   - `[Tick X] Position: (x, y)`
   - `[Hit! #N] You hit conn-X! 🎯`

### Multiplayer Test

1. Buka tab kedua (incognito/private) di http://localhost:5173
2. Client kedua akan muncul sebagai lingkaran biru
3. Gerakkan salah satu — pemain lain bergerak halus
4. Tembak ke arah pemain lain — hit terkonfirmasi

### Yang Akan Terlihat di Console

#### Client Console:

```
[Client] Terhubung ke server
[Client] Welcome! Entity ID: conn-1
[Tick 60] Pos: (0.00, 0.00) | Remote: 1
[Reconcile #20] ✅ No divergence. Log: 17
[Shoot] Fired at (2.50, 1.20)
[Hit! #1] You hit conn-3 at tick 5605! 🎯
```

#### Server Console:

```
[Server] Netcode engine server berjalan di 0.0.0.0:8080
[Server] Snapshot history window: 60 ticks (~2 detik)
[WS] Client connected: conn-1 (total: 1)
[WS] Client connected: conn-2 (total: 2)
[RTT] conn-1: 152ms (sample: 148ms)
[LagComp] Rewinding to tick 1234 (8 ticks back)
[LagComp] HIT detected on conn-3 at (5.00, 2.00)
[Shot] conn-1 hit conn-3!
```

## 📡 API Reference

### WebSocket Messages

#### Client → Server

| Message Type | Payload | Keterangan |
|-------------|---------|-----------|
| input | `{ type: 'input', tick: number, input: PlayerInput }` | Kirim input pemain |
| shoot | `{ type: 'shoot', tick: number, origin: Vector2, direction: Vector2 }` | Kirim tembakan |
| pong | `{ type: 'pong', serverSentAtMs: number }` | Balas ping server |

#### Server → Client

| Message Type | Payload | Keterangan |
|-------------|---------|-----------|
| welcome | `{ type: 'welcome', entityId: string }` | Dikirim sekali saat connect |
| snapshot | `{ type: 'snapshot', tick: number, yourLastProcessedInputTick: number, entities: Entity[] }` | State game tiap tick |
| ping | `{ type: 'ping', serverSentAtMs: number }` | Kirim ping untuk RTT |
| hit_confirmed | `{ type: 'hit_confirmed', targetEntityId: string, tick: number }` | Konfirmasi hit |

### Type Definitions

```typescript
interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
}

interface Vector2 {
  x: number;
  y: number;
}

interface Entity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  health: number;
}

interface SnapshotMessage {
  type: 'snapshot';
  tick: TickNumber;
  yourLastProcessedInputTick: TickNumber;
  entities: Entity[];
}
```

## 🧪 Testing

### Menjalankan Test

```bash
# Jalankan semua test
npm run test --workspace=@netcode/server
```

### Test Coverage

| Test File | Coverage | Status |
|-----------|----------|--------|
| test/rigid-body.test.ts | Physics determinism | ✅ Passing |
| test/collision-detector.test.ts | Raycast & AABB | ✅ Passing |
| test/lag-compensation.test.ts | Rewind & hit detection | ✅ Passing |

### Jenis Test

| Jenis Test | Deskripsi |
|-----------|-----------|
| Determinism test | Memastikan physics engine menghasilkan output yang sama untuk input yang sama |
| Raycast test | Memastikan raycast terhadap AABB bekerja dengan benar |
| Lag compensation test | Memastikan rewind hit detection bekerja sesuai spec |

## 🐳 Docker

### Quick Docker Start

```bash
# Build dan jalankan server
docker compose up --build
```

### Environment Variables

| Variable | Default | Keterangan |
|----------|---------|-----------|
| PORT | 8080 | Port server WebSocket |
| HOST | 0.0.0.0 | Host binding |

### Production Configuration

Untuk production, disarankan:

- Gunakan `NODE_ENV=production`
- Gunakan `HOST=0.0.0.0`
- Gunakan port non-default untuk keamanan

## 📁 Project Structure

```
netcode-engine/
├── apps/
│   ├── server/                          # Authoritative game server
│   │   ├── src/
│   │   │   ├── core/                    # TickClock (fixed timestep)
│   │   │   ├── network/                 # WebSocket, message-codec, latency-pinger
│   │   │   ├── physics/                 # RigidBody, collision, lag-compensation
│   │   │   ├── state/                   # GameState, PlayerSession, SnapshotHistory
│   │   │   ├── config/                  # Server configuration
│   │   │   └── main.ts                  # Entry point
│   │   ├── test/                        # Unit tests
│   │   ├── Dockerfile
│   │   └── package.json
│   └── client/                          # Browser client
│       ├── src/
│       │   ├── network/                 # SocketClient
│       │   ├── prediction/              # InputPredictor, Reconciliation, SnapshotBuffer
│       │   ├── render/                  # CanvasRenderer
│       │   └── main.ts                  # Entry point
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── packages/
│   └── shared/                          # Shared types & physics
│       ├── src/
│       │   ├── protocol/                # tick.types, message.types
│       │   └── physics/                 # Vector2
│       └── package.json
├── docker-compose.yml
├── package.json                          # npm workspaces root
└── README.md
```

## ⚠️ Limitations

| Limitation | Current State | Impact | Planned Solution |
|-----------|---------------|--------|------------------|
| Tidak ada anti-cheat | Client bisa kirim input curang | Keamanan rendah | Validasi & rate limiting |
| AABB hitbox | Hanya bounding box axis-aligned | Tidak presisi untuk FPS | Rotated bounding boxes |
| Asumsi latency simetris | Menggunakan RTT/2 | Tidak akurat untuk latency asimetris | Measure upload/download separately |
| No jitter/packet loss | Network simulator hanya delay tetap | Testing tidak realistis | Network simulator dengan jitter & packet loss |
| Single-server | Tidak scalable untuk banyak match | Tidak untuk production skala besar | Horizontal scaling dengan Redis |
| No reconnection | Player loss state saat disconnect | Pengalaman pengguna buruk | Session resume dengan token |

## 🗺️ Roadmap

| Fase | Minggu | Cakupan | Status |
|------|--------|--------|--------|
| Fase 1 | 1-5 | Foundation, WebSocket, tick loop, physics, client-side prediction | ✅ |
| Fase 2 | 6-10 | Server reconciliation, replay logic, entity interpolation | ✅ |
| Fase 3 | 11-14 | Snapshot history, RTT tracking, lag compensation, testing | ✅ |

## 🔧 Troubleshooting

### Server Tidak Bisa Start

**Problem:** Server gagal start dengan error `address already in use`.

**Why It Happens:** Port 8080 sudah digunakan oleh proses lain.

**Solution:**

```bash
# Cek proses yang menggunakan port 8080
netstat -ano | findstr 8080

# Kill proses dengan PID yang ditemukan
taskkill /PID <PID> /F

# Atau ganti port di .env
PORT=8081
```

### Client Tidak Bisa Connect

**Problem:** Client gagal connect dengan error `WebSocket connection failed`.

**Why It Happens:** Server tidak berjalan atau port berbeda.

**Solution:**

```bash
# Cek server running
curl http://localhost:8080

# Pastikan server running di terminal terpisah
npm run dev:server
```

### Module Not Found

**Problem:** Error `Cannot find module '@netcode/shared'`.

**Why It Happens:** Shared package belum di-build.

**Solution:**

```bash
# Build shared package
npm run build:shared
```

### Tests Gagal

**Problem:** Test gagal dengan error `SyntaxError: The requested module '@netcode/shared' does not provide an export`.

**Why It Happens:** Shared package belum di-build atau cache Jest corrupt.

**Solution:**

```bash
# Build shared
npm run build:shared

# Clear Jest cache
npx jest --clearCache

# Run tests
npm run test --workspace=@netcode/server
```

### Docker Build Gagal

**Problem:** Docker build gagal dengan error.

**Why It Happens:** Dockerfile menggunakan path yang tidak ditemukan.

**Solution:**

```bash
# Pastikan di root project
docker compose up --build

# Atau build manual
docker build -f apps/server/Dockerfile -t netcode-server .
```

## 🤝 Contributing

### Development Guidelines

1. Fork repository
2. Buat branch untuk fitur/bugfix: `git checkout -b feature/your-feature`
3. Commit dengan pesan jelas
4. Push ke fork
5. Buat Pull Request

### Setup Development

```bash
# Clone fork
git clone https://github.com/Tricke2D/MultiplayerNetcode
cd netcode-engine

# Install dependencies
npm install

# Build shared
npm run build:shared

# Build server
npm run build --workspace=@netcode/server

# Build client
npm run build --workspace=@netcode/client

# Run server
npm run dev:server

# Run client
npm run dev --workspace=@netcode/client
```

### Running Tests

```bash
npm run test --workspace=@netcode/server
```

## 📄 License & Credits

- **License:** MIT
- **Author:** Muhamad Syukron Zakka
- **Repository:** https://github.com/Tricke2D/MultiplayerNetcode
