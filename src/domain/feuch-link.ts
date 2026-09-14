const FEUCH_API = 'https://octopus-engine-app.benoitlubert.workers.dev';

export type FeuchRole = 'A' | 'B';
export type BinaryChoice = 'YES' | 'NO';

export type RoomStatus = {
  status: string;
  connected: FeuchRole[];
  participantCount: number;
  session?: {
    totalTrials: number;
    trial: number;
    score: number;
    active: boolean;
    completed: boolean;
    guessed: boolean;
  } | null;
};

export async function createFeuchRoom(): Promise<string> {
  const response = await fetch(`${FEUCH_API}/feuch-link/room/create`, { method: 'POST' });
  if (!response.ok) throw new Error(`Room creation failed (${response.status})`);
  const data = await response.json() as { code?: unknown };
  if (typeof data.code !== 'string') throw new Error('Room code missing');
  return data.code.toUpperCase();
}

export async function getFeuchRoomStatus(code: string): Promise<RoomStatus> {
  const response = await fetch(`${FEUCH_API}/feuch-link/room/${encodeURIComponent(code.toUpperCase())}/status`);
  if (!response.ok) throw new Error(`Room status failed (${response.status})`);
  return response.json() as Promise<RoomStatus>;
}

export function connectFeuchRoom(code: string, role: FeuchRole): WebSocket {
  const base = FEUCH_API.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
  return new WebSocket(`${base}/feuch-link/room/${encodeURIComponent(code.toUpperCase())}/socket?role=${role}`);
}

export function sendFeuch(socket: WebSocket | null, type: string, payload?: unknown): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify({ type, payload, sentAt: Date.now() }));
  return true;
}

export function exactBinomialTail(score: number, trials: number): number {
  if (trials <= 0 || score < 0) return 1;
  const choose = (n: number, k: number) => {
    let result = 1;
    for (let i = 1; i <= k; i += 1) result = result * (n - k + i) / i;
    return result;
  };
  let probability = 0;
  for (let k = score; k <= trials; k += 1) probability += choose(trials, k) * (0.5 ** trials);
  return Math.min(1, probability);
}
