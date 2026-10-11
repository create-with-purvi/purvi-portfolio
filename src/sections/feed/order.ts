export function spreadOrder<T extends { category: string }>(items: T[]): T[] {
  const groups = new Map<string, T[]>()
  for (const it of items) {
    const list = groups.get(it.category)
    if (list) list.push(it)
    else groups.set(it.category, [it])
  }
  const keyed: { it: T; k: number }[] = []
  let g = 0
  for (const list of groups.values()) {
    const phase = (g * 0.618) % 1
    list.forEach((it, j) => keyed.push({ it, k: (j + phase) / list.length }))
    g++
  }
  return keyed.sort((a, b) => a.k - b.k).map((x) => x.it)
}
