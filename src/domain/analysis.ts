export type MotionSample = { t: number; ax: number | null; ay: number | null; az: number | null };

export type MotionAnalysis = {
  sampleCount: number;
  durationS: number;
  meanMagnitude: number | null;
  peakMagnitude: number | null;
  variability: number | null;
  anomaly: 'insufficient-data' | 'stable' | 'motion-spike';
};

export function analyzeMotion(samples: MotionSample[]): MotionAnalysis {
  const magnitudes = samples
    .map(({ ax, ay, az }) => ax == null || ay == null || az == null ? null : Math.sqrt(ax * ax + ay * ay + az * az))
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const durationS = samples.length > 1 ? Math.max(0, (samples[samples.length - 1].t - samples[0].t) / 1000) : 0;
  if (magnitudes.length < 8) return { sampleCount: samples.length, durationS, meanMagnitude: null, peakMagnitude: null, variability: null, anomaly: 'insufficient-data' };
  const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
  const variance = magnitudes.reduce((sum, value) => sum + (value - mean) ** 2, 0) / magnitudes.length;
  const variability = Math.sqrt(variance);
  const peak = Math.max(...magnitudes);
  const motionSpike = peak > mean + Math.max(2.5, variability * 3.5);
  return {
    sampleCount: samples.length,
    durationS: Number(durationS.toFixed(2)),
    meanMagnitude: Number(mean.toFixed(2)),
    peakMagnitude: Number(peak.toFixed(2)),
    variability: Number(variability.toFixed(2)),
    anomaly: motionSpike ? 'motion-spike' : 'stable',
  };
}
