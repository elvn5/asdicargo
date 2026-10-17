/**
 * Тарифы сборного груза — те же, что в калькуляторе на сайте.
 * Берётся бо́льшая из стоимостей по весу и по объёму
 * (эквивалентно правилу «меньше 200 кг в кубе — считаем по объёму»).
 */
export const WEIGHT_RATE_SOM = 50;
export const VOLUME_RATE_SOM = 10_000;

export function estimateShippingCost(weightKg: number, volumeM3: number | null): number {
  const byWeight = weightKg * WEIGHT_RATE_SOM;
  const byVolume = (volumeM3 ?? 0) * VOLUME_RATE_SOM;
  return Math.round(Math.max(byWeight, byVolume));
}
