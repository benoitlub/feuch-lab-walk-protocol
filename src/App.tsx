import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateWalkProtocol, type BodyParameters } from './domain/protocol';

type Screen = 'intro' | 'setup' | 'protocol' | 'walk' | 'results';
type Sample = { t: number; ax: number | null; ay: number | null; az: number | null };

type VortexZone = {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  name: string;
  y: number;
  side: 'center' | 'left' | 'right';
};

const initialBody: BodyParameters = {
  weightKg: 75,
  heightCm: 175,
  shoeSizeEU: 42,
  availableDistanceM: 6,
};

const vortexZones: VortexZone[] = [
  { id: 'A', name: 'Top', y: 8, side: 'center' },
  { id: 'B', name: 'Spiritual eye', y: 19, side: 'right' },
  { id: 'C', name: 'Voice', y: 30, side: 'right' },
  { id: 'D', name: 'Heart', y: 43, side: 'right' },
  { id: 'E', name: 'Lower organs', y: 57, side: 'right' },
  { id: 'F', name: 'Battery', y: 69, side: 'right' },
  { id: 'G', name: 'Ground', y: 92, side: 'center' },
  { id: 'H', name: 'Hands', y: 48, side: 'left' },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [body, setBody] = useState<BodyParameters>(initialBody);
  const protocol = useMemo(() => calculateWalkProtocol(body), [body]);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const onMotion = (event: DeviceMotionEvent) => {
      const a = event.accelerationIncludingGravity;
      setSamples((current) => [
        ...current.slice(-299),
        { t: performance.now(), ax: a?.x ?? null, ay: a?.y ?? null, az: a?.z ?? null },
      ]);
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setStep((current) => {
        const next = current + 1;
        navigator.vibrate?.(80);
        if (next >= protocol.targetSteps) {
          window.clearInterval(timer);
          setRunning(false);
          window.setTimeout(() => setScreen('results'), 300);
        }
        return next;
      });
    }, 60000 / protocol.cadenceBpm);
    return () => window.clearInterval(timer);
  }, [running, protocol.cadenceBpm, protocol.targetSteps]);

  function startWalk() {
    setStep(0);
    setSamples([]);
    startedAt.current = performance.now();
    setRunning(true);
  }

  const feuchLevel = Math.min(99, Math.round(8 + step * 11 + samples.length / 20));
  const realityAdhesion = Math.max(1, 100 - Math.round(feuchLevel * 0.36));
  const activeZoneCount = Math.min(vortexZones.length, Math.max(1, step + 2));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">FEUCH LAB INSTITUTE</p>
          <h1>Dr. Marty's Walk Protocol</h1>
        </div>
        <span className="badge">FLI-MW-06</span>
      </header>

      <section className="panel">
        {screen === 'intro' && (
          <>
            <p className="status">STATUS: PROBABLY SAFE</p>
            <h2>Experimental Dimensional Locomotion System</h2>
            <p>
              A playful laboratory interface inspired by the abandoned patent application
              US20060014125A1. The document is real; its hyperspace claims are not established physics.
            </p>
            <div className="warning">
              Use only in a clear, open area. Never walk toward a wall, door, furniture, stairs,
              traffic, or any obstacle.
            </div>
            <button onClick={() => setScreen('setup')}>BEGIN CALIBRATION</button>
          </>
        )}

        {screen === 'setup' && (
          <>
            <h2>Subject calibration</h2>
            <div className="grid">
              <label>Weight (kg)<input type="number" value={body.weightKg} onChange={(e) => setBody({ ...body, weightKg: Number(e.target.value) })} /></label>
              <label>Height (cm)<input type="number" value={body.heightCm} onChange={(e) => setBody({ ...body, heightCm: Number(e.target.value) })} /></label>
              <label>Shoe size (EU)<input type="number" value={body.shoeSizeEU} onChange={(e) => setBody({ ...body, shoeSizeEU: Number(e.target.value) })} /></label>
              <label>Clear walking distance (m)<input type="number" step="0.1" value={body.availableDistanceM} onChange={(e) => setBody({ ...body, availableDistanceM: Number(e.target.value) })} /></label>
            </div>
            <button onClick={() => setScreen('protocol')}>CALCULATE PROTOCOL</button>
          </>
        )}

        {screen === 'protocol' && (
          <>
            <h2>Historical protocol reconstruction</h2>
            <div className="metrics">
              <Metric label="Target steps" value={String(protocol.targetSteps)} />
              <Metric label="Cadence" value={`${protocol.cadenceBpm} bpm`} />
              <Metric label="Stride from patent" value={`${protocol.strideLengthM} m`} />
              <Metric label="Required space" value={`${protocol.requiredDistanceM} m`} />
              <Metric label="Target momentum" value={`${protocol.targetMomentumKgMs} kg·m/s`} />
              <Metric label="Safety buffer" value="+1 m" />
            </div>
            <div className="formula">L = (50.909573606 / mass in kg) × 1 second</div>
            <p className="note">
              This reproduces the arithmetic stated in the patent. It does not validate the claimed hyperspace mechanism.
              Height and shoe size are kept for subject/footprint calibration but do not alter the patent's displayed stride formula.
            </p>
            {!protocol.safe && <div className="warning">Not enough clear space. Increase the open distance before starting.</div>}
            <div className="actions">
              <button className="secondary" onClick={() => setScreen('setup')}>BACK</button>
              <button disabled={!protocol.safe} onClick={() => setScreen('walk')}>ENTER WALK MODE</button>
            </div>
          </>
        )}

        {screen === 'walk' && (
          <>
            <p className="status">EXPERIMENTAL MOBILITY DIVISION</p>
            <h2>Walk mode</h2>
            <div className="lab-grid">
              <div className="vortex">
                <div className="vortex-ring" style={{ transform: `scale(${1 + step * 0.04})` }} />
                <div className="vortex-core">{step}/{protocol.targetSteps}</div>
              </div>
              <VortexMonitor activeCount={activeZoneCount} />
            </div>
            <div className="metrics">
              <Metric label="Feuch level" value={`${feuchLevel}%`} />
              <Metric label="Reality adhesion" value={`${realityAdhesion}%`} />
              <Metric label="Sensor samples" value={String(samples.length)} />
              <Metric label="Vortex monitor" value={`${activeZoneCount}/8`} />
            </div>
            <p className="note">
              The A-H monitor follows the labels used by the patent, but its activation animation, Feuch Level and Reality Adhesion are fictional visualizations.
            </p>
            {!running ? <button onClick={startWalk}>START 6-STEP SEQUENCE</button> : <button className="danger" onClick={() => setRunning(false)}>STOP NOW</button>}
          </>
        )}

        {screen === 'results' && (
          <>
            <p className="status">DR. MARTY'S REPORT</p>
            <h2>Experiment complete</h2>
            <div className="metrics">
              <Metric label="Steps" value={`${step}/${protocol.targetSteps}`} />
              <Metric label="Feuch level" value={`${feuchLevel}%`} />
              <Metric label="Reality adhesion" value={`${realityAdhesion}%`} />
              <Metric label="Motion samples" value={String(samples.length)} />
            </div>
            <div className="report">
              <strong>Patent claim</strong>
              <p>The document claims that a timed six-stride walking sequence at a target momentum could generate a hyperspace vortex.</p>
              <strong>Reality check</strong>
              <p>No accepted scientific evidence shows that this produces hyperspace vortices, teleportation, levitation, or passage through solid objects.</p>
              <strong>Marty's conclusion</strong>
              <p>Subject remains disappointingly three-dimensional. Further paperwork recommended.</p>
            </div>
            <button onClick={() => setScreen('setup')}>NEW EXPERIMENT</button>
          </>
        )}
      </section>

      <footer>BLACKLACE RESEARCH NETWORK // INTERNAL USE ONLY</footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function VortexMonitor({ activeCount }: { activeCount: number }) {
  return (
    <div className="body-monitor" aria-label="Fictional A to H vortex monitor">
      <div className="body-silhouette" />
      {vortexZones.map((zone, index) => (
        <div
          key={zone.id}
          className={`vortex-node ${zone.side} ${index < activeCount ? 'active' : ''}`}
          style={{ top: `${zone.y}%` }}
          title={`${zone.id}: ${zone.name}`}
        >
          <b>{zone.id}</b><span>{zone.name}</span>
        </div>
      ))}
      <small>FICTIONAL SENSOR OVERLAY</small>
    </div>
  );
}
