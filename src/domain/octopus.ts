import type { MotionAnalysis } from './analysis';

export type BlacklaceVoice = 'MARTY' | 'NIKOLAS' | 'LOLO' | 'MAX' | 'SLOBODANE' | 'NATASHA';

export type CharacterDebrief = {
  name: BlacklaceVoice;
  role: string;
  text: string;
};

export type OctopusDebrief = {
  characters: CharacterDebrief[];
  source: 'octopus' | 'fallback';
  summary?: string;
};

const OCTOPUS_URL = 'https://octopus-engine-app.benoitlubert.workers.dev/mission';

export const CHARACTER_PORTRAITS: Record<BlacklaceVoice, string> = {
  MARTY: "Expérimentateur brillant, enthousiaste, intuitif et excessif. Il adore relier les anomalies au Feuch, mais ne doit jamais transformer une hypothèse en fait mesuré.",
  NIKOLAS: "Analyste rationnel et méthodique. Il vérifie les biais, le hasard, la qualité des mesures et la reproductibilité. Sec mais pas cynique.",
  LOLO: "Cobaye curieux, spontané et très humain. Il parle surtout de ce qu'il a ressenti, de ce qui était étrange ou amusant, sans prétendre que son ressenti prouve quoi que ce soit.",
  MAX: "Max Liberty est sceptique, sarcastique, vif et drôle. Il dégonfle les grandes conclusions avec une remarque courte, mordante mais jamais méprisante.",
  SLOBODANE: "Théoricien spéculatif. Il cherche des structures, des répétitions et des coïncidences temporelles. Ses hypothèses peuvent être audacieuses mais doivent rester explicitement des hypothèses.",
  NATASHA: "Observatrice précise, peu bavarde. Elle cherche les motifs réellement présents dans les données et ne s'intéresse à une anomalie que si elle peut être reproduite ou comparée à d'autres sessions.",
};

const fallback: CharacterDebrief[] = [
  { name: 'MARTY', role: 'HYPOTHÈSE', text: "Le protocole est terminé. Le Feuch n'a pas signé le rapport, ce qui est déjà très Feuch." },
  { name: 'NIKOLAS', role: 'CONTRÔLE', text: "Une mesure isolée ne suffit pas. Il faut répéter le protocole dans les mêmes conditions." },
  { name: 'LOLO', role: 'RESSENTI', text: "Je note surtout le rythme, l'équilibre et ce que j'ai réellement ressenti pendant les six pas." },
  { name: 'MAX', role: 'COMMENTAIRE', text: "Six pas, toujours solide. Pour l'instant le mur peut dormir tranquille." },
  { name: 'SLOBODANE', role: 'THÉORIE', text: "Le moment d'apparition d'un signal peut être plus intéressant que son intensité. À comparer." },
  { name: 'NATASHA', role: 'ANALYSE', text: "Archivez la session. Une anomalie ne devient intéressante que lorsqu'elle revient." },
];

function parseCharacters(raw: string): CharacterDebrief[] | null {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as { characters?: unknown } | unknown[];
    const list = Array.isArray(parsed) ? parsed : parsed.characters;
    if (!Array.isArray(list)) return null;
    const allowed = new Set(Object.keys(CHARACTER_PORTRAITS));
    const result = list.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      const name = typeof record.name === 'string' ? record.name.toUpperCase() : '';
      const role = typeof record.role === 'string' ? record.role : '';
      const text = typeof record.text === 'string' ? record.text.trim() : '';
      if (!allowed.has(name) || !text) return [];
      return [{ name: name as BlacklaceVoice, role: role || 'DEBRIEF', text }];
    });
    return result.length >= 4 ? result : null;
  } catch {
    return null;
  }
}

export async function requestBlacklaceDebrief(input: {
  analysis: MotionAnalysis;
  steps: number;
  distanceM: number;
}): Promise<OctopusDebrief> {
  const operationId = `feuch_walk_${Date.now()}`;
  const prompt = `Tu rédiges le débrief d'une expérience du Feuch Lab Institute.\n\nDONNÉES MESURÉES / CALCULÉES — ne rien inventer :\n- pas effectués: ${input.steps}/6\n- distance théorique: ${input.distanceM} m\n- échantillons capteur: ${input.analysis.sampleCount}\n- durée capteur: ${input.analysis.durationS} s\n- moyenne accélération: ${input.analysis.meanMagnitude ?? 'indisponible'} m/s²\n- pic accélération: ${input.analysis.peakMagnitude ?? 'indisponible'} m/s²\n- variabilité: ${input.analysis.variability ?? 'indisponible'}\n- classification locale: ${input.analysis.anomaly}\n\nPORTRAITS DES PERSONNAGES :\n${Object.entries(CHARACTER_PORTRAITS).map(([name, portrait]) => `${name}: ${portrait}`).join('\n')}\n\nRÈGLES :\n1. Chaque personnage commente exactement les mêmes données selon son portrait.\n2. Toujours distinguer mesure, ressenti et hypothèse.\n3. Ne jamais affirmer qu'un vortex, une traversée de mur ou un phénomène paranormal a été détecté.\n4. Si une anomalie existe, parler de signal à reproduire, pas de preuve.\n5. Ton Blacklace: drôle, étrange, crédible, concis.\n6. Retourne UNIQUEMENT du JSON valide, sans markdown, sous la forme {"characters":[{"name":"MARTY","role":"HYPOTHÈSE","text":"..."}, ...]}.\n7. Inclure exactement MARTY, NIKOLAS, LOLO, MAX, SLOBODANE, NATASHA, une seule fois chacun.`;

  try {
    const response = await fetch(OCTOPUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operationId,
        title: 'Feuch Lab · Blacklace character debrief',
        objective: 'Generate distinct Blacklace character interpretations grounded in measured experiment data.',
        requiredCapabilities: ['content.generate'],
        authorizedResources: [],
        prompt,
        context: {
          id: operationId,
          label: 'FLI-MW-06 experiment debrief',
          objective: 'Interpret one walk experiment without inventing measurements.',
          metadata: { universe: 'blacklace', experiment: 'FLI-MW-06' },
        },
      }),
    });
    if (!response.ok) throw new Error(`Octopus HTTP ${response.status}`);
    const payload = await response.json() as { status?: string; summary?: string; output?: Record<string, unknown> };
    const raw = typeof payload.output?.text === 'string'
      ? payload.output.text
      : typeof payload.output?.content === 'string'
        ? payload.output.content
        : '';
    const characters = parseCharacters(raw);
    if (!characters) throw new Error('Octopus response could not be parsed');
    return { characters, source: 'octopus', summary: payload.summary };
  } catch {
    return { characters: fallback, source: 'fallback' };
  }
}
