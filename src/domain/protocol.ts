export type BodyParameters = {
  weightKg: number;
  heightCm: number;
  shoeSizeEU: number;
  availableDistanceM: number;
};

export type WalkProtocol = {
  targetSteps: number;
  cadenceBpm: number;
  strideLengthM: number;
  requiredDistanceM: number;
  targetMomentumKgMs: number;
  safe: boolean;
};

/**
 * Reconstruction of the numerical walking rule stated in US20060014125A1.
 * The patent gives a preferred walking momentum Mw = 50.909573606 kg·m/s
 * and a one-second stride period, so L = (Mw / W) * T.
 *
 * This reproduces the document's arithmetic only. It does not validate the
 * document's hyperspace claims or imply any unusual physical effect.
 */
export function calculateWalkProtocol(input: BodyParameters): WalkProtocol {
  const targetMomentumKgMs = 50.909573606;
  const targetSteps = 6;
  const cadenceBpm = 60;
  const validWeightKg = Math.max(1, input.weightKg);
  const stridePeriodSeconds = 1;
  const strideLengthM = (targetMomentumKgMs / validWeightKg) * stridePeriodSeconds;
  const requiredDistanceM = strideLengthM * targetSteps;

  return {
    targetSteps,
    cadenceBpm,
    strideLengthM: Number(strideLengthM.toFixed(3)),
    requiredDistanceM: Number(requiredDistanceM.toFixed(2)),
    targetMomentumKgMs: Number(targetMomentumKgMs.toFixed(6)),
    safe: input.availableDistanceM >= requiredDistanceM + 1,
  };
}
