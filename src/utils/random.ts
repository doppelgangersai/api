/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * Returns a new array with the elements in random order.
 *
 * @param inputArray - The array to shuffle.
 * @returns A new array with shuffled elements.
 */
export const shuffleArray = <T>(inputArray: T[]): T[] => {
  // Clone the array to avoid mutating the original array
  const array = inputArray.slice();

  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};
