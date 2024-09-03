export function concatSet<T>(set1: Set<T>, set2: Set<T>): void {
  for (const item of set2) {
    set1.add(item);
  }
}
