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
  safe: boolean;
};

export function calculateWalkProtocol(input: BodyParameters): WalkProtocol {
  const estimatedStride = Math.max(0.45, Math.min(0.95, input.heightCm * 0.00415));
  const targetSteps = 6;
  const cadenceBpm = 60;
  const requiredDistanceM = Number((estimatedStride * targetSteps).toFixed(2));

  return {
    targetSteps,
    cadenceBpm,
    strideLengthM: Number(estimatedStride.toFixed(2)),
    requiredDistanceM,
    safe: input.availableDistanceM >= requiredDistanceM + 1,
  };
}
