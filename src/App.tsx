import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateWalkProtocol, type BodyParameters } from './domain/protocol';

type Screen = 'intro' | 'setup' | 'protocol' | 'walk' | 'results';
type Sample = { t: number; ax: number | null; ay: number | null; az: number | null };
type VortexZone = { id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'; name: string; y: number; side: 'center' | 'left' | 'right' };

const initialBody: BodyParameters = { weightKg: 75, heightCm: 175, shoeSizeEU: 42, availableDistanceM: 6 };
const vortexZones: VortexZone[] = [
  { id: 'A', name: 'Couronne', y: 8, side: 'center' },
  { id: 'B', name: 'Œil spirituel', y: 19, side: 'right' },
  { id: 'C', name: 'Voix', y: 30, side: 'right' },
  { id: 'D', name: 'Cœur', y: 43, side: 'right' },
  { id: 'E', name: 'Organes inférieurs', y: 57, side: 'right' },
  { id: 'F', name: 'Batterie', y: 69, side: 'right' },
  { id: 'G', name: 'Sol', y: 92, side: 'center' },
  { id: 'H', name: 'Mains', y: 48, side: 'left' },
];

const phases: { id: Screen; n: number; label: string }[] = [
  { id: 'setup', n: 1, label: 'Préparer' },
  { id: 'protocol', n: 2, label: 'Apprendre' },
  { id: 'walk', n: 3, label: 'Expérimenter' },
  { id: 'results', n: 4, label: 'Résultats' },
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
      setSamples((current) => [...current.slice(-299), { t: performance.now(), ax: a?.x ?? null, ay: a?.y ?? null, az: a?.z ?? null }]);
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
          window.setTimeout(() => setScreen('results'), 500);
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
  const progress = Math.min(100, (step / protocol.targetSteps) * 100);

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-mark">△</div>
        <div className="hero-copy">
          <p className="eyebrow">FEUCH LAB INSTITUTE</p>
          <h1>Dr. Marty's Walk Protocol</h1>
          <p className="tagline">SIX STEPS. ANOTHER REALITY.</p>
        </div>
        <span className="badge">FLI-MW-06</span>
      </header>

      {screen !== 'intro' && (
        <nav className="phase-nav" aria-label="Phases du protocole">
          {phases.map((phase) => (
            <button key={phase.id} className={screen === phase.id ? 'phase active' : 'phase'} onClick={() => !running && setScreen(phase.id)}>
              <b>{phase.n}</b><span>{phase.label}</span>
            </button>
          ))}
        </nav>
      )}

      <section className="panel">
        {screen === 'intro' && (
          <div className="intro-screen">
            <p className="status">STATUS: PROBABLY SAFE</p>
            <h2>Experimental Dimensional Locomotion System</h2>
            <div className="intro-visual"><div className="portal"><span>6</span><small>STEPS</small></div></div>
            <p>Une expérience guidée inspirée du brevet abandonné US20060014125A1. Le document est réel. Les effets hyperspatiaux ne sont pas de la physique établie.</p>
            <div className="warning">Expérience uniquement dans un espace dégagé. Ne marchez jamais vers un mur, une porte, un escalier, du mobilier ou la circulation.</div>
            <button className="primary big" onClick={() => setScreen('setup')}>ENTRER DANS LE LABO</button>
          </div>
        )}

        {screen === 'setup' && (
          <>
            <p className="section-kicker">01 — PRÉPARER LE SUJET</p>
            <h2>Calibration</h2>
            <p className="lead">On calcule la longueur d'un pas, puis on vérifie que vous avez assez d'espace pour les six foulées.</p>
            <div className="grid compact-grid">
              <label>Poids (kg)<input type="number" value={body.weightKg} onChange={(e) => setBody({ ...body, weightKg: Number(e.target.value) })} /></label>
              <label>Taille (cm)<input type="number" value={body.heightCm} onChange={(e) => setBody({ ...body, heightCm: Number(e.target.value) })} /></label>
              <label>Pointure (EU)<input type="number" value={body.shoeSizeEU} onChange={(e) => setBody({ ...body, shoeSizeEU: Number(e.target.value) })} /></label>
              <label>Espace libre (m)<input type="number" step="0.1" value={body.availableDistanceM} onChange={(e) => setBody({ ...body, availableDistanceM: Number(e.target.value) })} /></label>
            </div>
            <div className="distance-card">
              <span>Distance calculée</span><strong>{protocol.requiredDistanceM} m</strong><small>+ 1 m de marge recommandé</small>
              <div className="distance-bar"><i style={{ width: `${Math.min(100, (protocol.requiredDistanceM / Math.max(body.availableDistanceM, .1)) * 100)}%` }} /></div>
            </div>
            {!protocol.safe && <div className="warning">Espace insuffisant. Il faut au moins {(protocol.requiredDistanceM + 1).toFixed(1)} m totalement dégagés.</div>}
            <button className="primary big" onClick={() => setScreen('protocol')}>VOIR COMMENT MARCHER →</button>
          </>
        )}

        {screen === 'protocol' && (
          <>
            <p className="section-kicker">02 — APPRENDRE</p>
            <h2>La séquence de marche</h2>
            <p className="lead"><strong>6 pas en ligne droite · 1 pas par seconde · bras croisés.</strong></p>

            <div className="walk-guide">
              <div className="posture-callout"><span>↳</span><b>BRAS CROISÉS</b><small>Regard droit · dos droit · marche naturelle</small></div>
              <div className="walker-strip">
                {Array.from({ length: 6 }, (_, i) => (
                  <div className="walker-step" key={i}>
                    <div className="step-badge">{i + 1}</div>
                    <div className={`walker ${i % 2 ? 'alt' : ''}`}><i className="head"/><i className="body"/><i className="arm a1"/><i className="arm a2"/><i className="leg l1"/><i className="leg l2"/></div>
                    <span>{i}s</span>
                  </div>
                ))}
              </div>
              <div className="route-line">
                {Array.from({ length: 6 }, (_, i) => <i key={i} className="foot" style={{ left: `${8 + i * 17}%` }} />)}
              </div>
              <div className="route-measure">← {protocol.requiredDistanceM} m pour 6 pas →</div>
            </div>

            <div className="protocol-dashboard">
              <Metric label="Votre longueur de pas" value={`${protocol.strideLengthM} m`} />
              <Metric label="Cadence" value="1 pas / sec" />
              <Metric label="Pas à effectuer" value="6" />
              <Metric label="Espace minimum" value={`${(protocol.requiredDistanceM + 1).toFixed(1)} m`} />
            </div>

            <div className="posture-grid">
              <div className="check-card"><h3>Votre posture</h3><p>✓ Bras croisés</p><p>✓ Regard devant</p><p>✓ Marche naturelle</p><p>✓ Rythme régulier</p></div>
              <VortexMonitor activeCount={2} />
            </div>

            <details className="science-note"><summary>Pourquoi cette distance ?</summary><p>Reconstruction arithmétique du brevet : L = (50.909573606 / masse en kg) × 1 seconde. Cette formule reproduit le document, sans valider ses affirmations hyperspatiales.</p></details>
            <button className="primary big" disabled={!protocol.safe} onClick={() => setScreen('walk')}>JE SUIS PRÊT — LANCER LE PROTOCOLE</button>
          </>
        )}

        {screen === 'walk' && (
          <>
            <p className="section-kicker">03 — EXPÉRIMENTER</p>
            <h2>{running ? 'Marchez maintenant' : 'Prêt pour la séquence ?'}</h2>
            <div className={running ? 'experiment-stage running' : 'experiment-stage'}>
              <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}>
                <div><strong>{step}<small>/6</small></strong><span>{running ? 'PAS' : 'READY'}</span></div>
              </div>
              <div className="current-instruction">
                <div className="arms-icon"><i/><i/><b/></div>
                <strong>BRAS CROISÉS</strong>
                <span>{running ? `Pas ${Math.min(step + 1, 6)} — avancez au bip` : 'Tenez le téléphone près du corps'}</span>
              </div>
              <div className="live-track">
                {Array.from({ length: 6 }, (_, i) => <div key={i} className={i < step ? 'track-step done' : i === step && running ? 'track-step current' : 'track-step'}><b>{i + 1}</b><small>{(protocol.strideLengthM * (i + 1)).toFixed(2)} m</small></div>)}
              </div>
            </div>

            <div className="live-stats"><Metric label="Distance théorique" value={`${Math.min(protocol.requiredDistanceM, protocol.strideLengthM * step).toFixed(2)} m`} /><Metric label="Échantillons mouvement" value={String(samples.length)} /><Metric label="Feuch" value={`${feuchLevel}%`} /><Metric label="Adhérence réalité" value={`${realityAdhesion}%`} /></div>
            <VortexMonitor activeCount={activeZoneCount} />
            {!running ? <button className="primary launch" onClick={startWalk}>▶ DÉMARRER LES 6 PAS</button> : <button className="danger big" onClick={() => setRunning(false)}>■ ARRÊT IMMÉDIAT</button>}
          </>
        )}

        {screen === 'results' && (
          <>
            <p className="section-kicker">04 — RAPPORT DE MARTY</p>
            <h2>Expérience terminée</h2>
            <div className="result-hero"><span>REALITY ADHESION</span><strong>{realityAdhesion}%</strong><div className="result-bar"><i style={{ width: `${realityAdhesion}%` }}/></div><p>Le sujet reste, de manière décevante, tridimensionnel.</p></div>
            <div className="protocol-dashboard"><Metric label="Pas" value={`${step}/6`} /><Metric label="Feuch level" value={`${feuchLevel}%`} /><Metric label="Distance" value={`${protocol.requiredDistanceM} m`} /><Metric label="Motion samples" value={String(samples.length)} /></div>
            <div className="report"><strong>Reality check</strong><p>Aucune preuve scientifique reconnue ne montre que cette séquence crée un vortex hyperspatial, une téléportation, une lévitation ou permet de traverser un objet solide.</p><strong>Conclusion de Marty</strong><p>Résultat non concluant. Ce qui, au Feuch Lab, signifie évidemment qu'il faut recommencer avec davantage de capteurs.</p></div>
            <button className="primary big" onClick={() => setScreen('setup')}>NOUVELLE EXPÉRIENCE</button>
          </>
        )}
      </section>

      <footer>BLACKLACE RESEARCH NETWORK // PETITS PAS, GRANDS DÉRAPAGES</footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function VortexMonitor({ activeCount }: { activeCount: number }) {
  return <div className="body-monitor" aria-label="Moniteur fictif des vortex A à H"><div className="body-silhouette" />{vortexZones.map((zone, index) => <div key={zone.id} className={`vortex-node ${zone.side} ${index < activeCount ? 'active' : ''}`} style={{ top: `${zone.y}%` }} title={`${zone.id}: ${zone.name}`}><b>{zone.id}</b><span>{zone.name}</span></div>)}<small>MONITEUR VORTEX A–H · FICTION</small></div>;
}
