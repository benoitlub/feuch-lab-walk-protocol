import { useMemo, useState } from 'react';
import App from './App';
import SilentLink from './SilentLink';
import GhostFrame from './GhostFrame';

type Protocol = 'library' | 'walk' | 'silent' | 'ghost';

export default function LabRoot() {
  const initial = useMemo<Protocol>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('room') || params.get('protocol') === 'silent') return 'silent';
    if (params.get('protocol') === 'ghost') return 'ghost';
    return 'library';
  }, []);
  const [protocol, setProtocol] = useState<Protocol>(initial);
  const goLibrary = () => { window.history.replaceState(null, '', window.location.pathname); setProtocol('library'); };
  const open = (next: Protocol) => { window.history.replaceState(null,'',`${window.location.pathname}?protocol=${next}`); setProtocol(next); };

  if (protocol === 'walk') return <div className="protocol-wrap"><button className="lab-home-fab" onClick={goLibrary}>⌂ LAB</button><App/></div>;
  if (protocol === 'silent') return <SilentLink onBack={goLibrary}/>;
  if (protocol === 'ghost') return <GhostFrame onBack={goLibrary}/>;

  return <main className="lab-library">
    <header className="library-head"><div className="hero-mark">△</div><div><p className="eyebrow">FEUCH LAB INSTITUTE</p><h1>Protocol Library</h1><p>Mesurer d'abord. Interpréter ensuite. Déraper avec méthode.</p></div><span className="badge">BLACKLACE</span></header>
    <section className="library-grid">
      <button className="protocol-card active" onClick={()=>setProtocol('walk')}><span className="protocol-id">FLI-MW-06</span><div className="protocol-icon">6</div><h2>Marty Walk</h2><p>Six pas, accéléromètre et débrief Blacklace.</p><small>DISPONIBLE · 1 TÉLÉPHONE</small></button>
      <button className="protocol-card active" onClick={()=>open('silent')}><span className="protocol-id">FLI-B2B-20</span><div className="protocol-icon link">A↔B</div><h2>Silent Link</h2><p>20 essais OUI/NON, deux téléphones, cible côté serveur.</p><small>DISPONIBLE · 2 TÉLÉPHONES</small></button>
      <button className="protocol-card active" onClick={()=>open('ghost')}><span className="protocol-id">FLI-GHOST-02</span><div className="protocol-icon">◉</div><h2>Ghost Frame</h2><p>Stimuli brefs, essais contrôles et faux positifs mesurés.</p><small>DISPONIBLE · 1 TÉLÉPHONE</small></button>
      <article className="protocol-card dormant"><span className="protocol-id">THE ARCHIVE</span><div className="protocol-icon">▤</div><h2>Archive</h2><p>Comparer les sessions et rechercher des motifs réellement reproductibles.</p><small>BIENTÔT</small></article>
    </section>
    <footer>FEUCH LAB // EXTRAORDINARY CLAIMS, ORDINARY DATA</footer>
  </main>;
}
