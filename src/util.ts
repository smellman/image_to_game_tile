export const range = (begin: number, end: number): Array<number> | never => {
  if (end < begin) {
    throw new RangeError(`end: ${end} must be higher than begin: ${begin}`)
  }
  return [...Array(end - begin)].map((_, i) => begin + i)
}
