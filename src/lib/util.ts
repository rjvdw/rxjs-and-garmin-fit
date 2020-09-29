import { OperatorFunction, pipe } from 'rxjs'
import { map, scan } from 'rxjs/operators'

export function slidingAverage(windowSize: number = 10): OperatorFunction<number, number | undefined> {
  return pipe(
    scan<number, number[]>((values, value) => values.slice(1 - windowSize).concat(value), []),
    map(values => values.length === windowSize
      ? values.reduce((sum, value) => sum + value, 0) / windowSize
      : undefined),
  )
}
