import { useMemo, useState } from 'react';
import App from './App';
import SilentLink from './SilentLink';

type Protocol = 'library' | 'walk' | 'silent';

export default function LabRoot() {
  const initial = useMemo<Protocol>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('room') || params.get('protocol') === 'silent') return 'silent';
    return 'library';
  }, []);
  const [protocol, setProtocol] = useState<Protocol>(initial);

  const goLibrary = () => {
    window.history.replaceState(null, '', window.location.pathname);
    setProtocol('library');
  };

  if (protocol === 'walk') return <div className="protocol-wrap"><button className="lab-home-fab" onClick={goLibrary}>⌂ LAB</button><App/></div>;
  if (protocol === 'silent') return <SilentLink onBack={goLibrary}/>;

  return <main className="lab-library">
    <header className="library-head"><div className="hero-mark">△</div><div><p className="eyebrow">FEUCH LAB INSTITUTE</p><h1>Protocol Library</h1><p>Mesurer d'abord. Interpréter ensuite. Déraper avec méthode.</p></div><span className="badge">BLACKLACE</span></header>
    <section className="library-grid">
      <button className="protocol-card active" onClick={()=>setProtocol('walk')}>
        <span className="protocol-id">FLI-MW-06</span><div className="protocol-icon">6</div><h2>Marty Walk</h2><p>Six pas, bras croisés, accéléromètre et débrief Blacklace.</p><small>DISPONIBLE · 1 TÉLÉPHONE</small>
      </button>
      <button className="protocol-card active" onClick={()=>{window.history.replaceState(null,'',`${window.location.pathname}?protocol=silent`);setProtocol('silent')}}>
        <span className="protocol-id">FLI-B2B-20</span><div className="protocol-icon link">A↔B</div><h2>Silent Link</h2><p>20 essais OUI/NON, deux téléphones, cible tirée côté serveur.</p><small>DISPONIBLE · 2 TÉLÉPHONES</small>
      </button>
      <article className="protocol-card dormant"><span className="protocol-id">FLI-PATTERN</span><div className="protocol-icon">⌁</div><h2>Pattern Hunter</h2><p>Perception visuelle, motifs, contrôle aveugle et répétabilité.</p><small>EN PRÉPARATION</small></article>
      <article className="protocol-card dormant"><span className="protocol-id">THE ARCHIVE</span><div className="protocol-icon">▤</div><h2>Archive</h2><p>Comparer les sessions et rechercher des motifs réellement reproductibles.</p><small>BIENTÔT</small></article>
    </section>
    <footer>FEUCH LAB // EXTRAORDINARY CLAIMS, ORDINARY DATA</footer>
  </main>;
}
