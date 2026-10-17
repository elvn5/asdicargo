/**
 * Тарифы сборного груза (дублируют серверные в apps/api/src/common/shipping-cost.ts —
 * сервер всё равно пересчитывает стоимость заявки сам).
 */
export const WEIGHT_RATE_SOM = 50;
export const VOLUME_RATE_SOM = 10_000;

export interface ShippingEstimate {
  byWeight: number;
  byVolume: number;
  useVolume: boolean;
  total: number;
}

/** forceVolume — «в одном кубе меньше 200 кг»: считать строго по объёму. */
export function estimateShipping(
  weightKg: number,
  volumeM3: number,
  forceVolume = false,
): ShippingEstimate {
  const w = Number.isFinite(weightKg) && weightKg > 0 ? weightKg : 0;
  const v = Number.isFinite(volumeM3) && volumeM3 > 0 ? volumeM3 : 0;
  const byWeight = w * WEIGHT_RATE_SOM;
  const byVolume = v * VOLUME_RATE_SOM;
  const useVolume = forceVolume || byVolume > byWeight;
  return { byWeight, byVolume, useVolume, total: Math.round(useVolume ? byVolume : byWeight) };
}

/** «Место» груза в расширенном расчёте: габариты в метрах, вес одного места. */
export interface CargoPlace {
  length: number;
  width: number;
  height: number;
  weight: number;
  count: number;
  canLay: boolean;
}

/** Общий вес и объём по списку мест. */
export function totalsOf(places: CargoPlace[]): { weight: number; volume: number; count: number } {
  return places.reduce(
    (acc, p) => ({
      weight: acc.weight + p.weight * p.count,
      volume: acc.volume + p.length * p.width * p.height * p.count,
      count: acc.count + p.count,
    }),
    { weight: 0, volume: 0, count: 0 },
  );
}
