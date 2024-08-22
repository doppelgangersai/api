// uniqueStrings.ts
import * as levenshtein from 'fast-levenshtein';

interface StringFrequency {
  value: string;
  count: number;
}

/**
 * Receives an array of strings and returns an array of N unique strings,
 * sorted by the number of occurrences in the original array, taking into account the minimum
 * Levenshtein distance for uniqueness.
 * @param input An array of input strings.
 * @param topN The number of strings to return.
 * @param minDistance The minimum Levenshtein distance for string uniqueness.
 * @returns An array of N unique strings.
 */

export function getUniqueStrings(
  input: string[],
  topN: number,
  minDistance: number,
): string[] {
  const frequencies: Record<string, number> = {};
  const candidates: StringFrequency[] = [];

  // Подсчитываем частоту каждой строки и проверяем на уникальность
  input
    .filter((s) => !!s)
    .forEach((str) => {
      const currentCount = (frequencies[str] || 0) + 1;
      frequencies[str] = currentCount;

      // Проверяем текущую строку на уникальность
      if (currentCount === 1 && isUnique(str, candidates, minDistance)) {
        candidates.push({ value: str, count: 0 });
      }
    });

  // Обновляем частоты только для уникальных строк
  candidates.forEach((candidate) => {
    candidate.count = frequencies[candidate.value];
  });

  // Сортируем по частоте и отбираем топ-N
  return candidates
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
    .map((item) => item.value);
}

// Вспомогательная функция для проверки уникальности строки
function isUnique(
  value: string,
  candidates: StringFrequency[],
  minDistance: number,
): boolean {
  return candidates.every(
    (candidate) => levenshtein.get(value, candidate.value) >= minDistance,
  );
}
