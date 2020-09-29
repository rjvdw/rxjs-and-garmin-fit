export function fmt(value: number | string | undefined): string {
  if (value === undefined) return '???'
  if (typeof value === 'string') return value

  return String(Math.round(value * 100) / 100)
}

export function cl(strs: TemplateStringsArray, ...values: string[]): void {
  let raw = strs[0]
  for (let i = 0; i < values.length; i += 1) {
    raw += values[i] + strs[i + 1]
  }
  console.clear()
  console.log(raw
    .split('\n')
    .filter(str => !str.match(/^\s*$/))
    .map(str => str.replace(/^ *\|/, ''))
    .join('\n')
  )
}
