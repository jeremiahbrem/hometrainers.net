export function createOverlayText(text: string): string {
  const base = [...new Array(10).fill(text)].join('').slice(0,45)
  let result = base

  for (let i = 0, j = 3; i < 15; i++, j += 3) {
    result += ` ${base.slice(j + 1)}${base.slice(0,j)}`
  }

  return result;
}