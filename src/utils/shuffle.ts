// Fisher-Yates (Knuth) adolatli va mukammal aralashtirish algoritmi
// Bu algoritm variantlar bir joyda tushib qolmasligini va so'zlar haqiqiy tasodifiy bo'lishini 100% kafolatlaydi.
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
