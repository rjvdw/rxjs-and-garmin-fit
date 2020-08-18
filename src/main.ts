import path from 'path'
import { filter, map, scan } from 'rxjs/operators'
import { replayRecordsFrom } from './lib/fit'
import { OperatorFunction, pipe } from 'rxjs'

if (process.argv.length < 3) {
  console.error(`Usage: ${ process.argv[0] } ${ process.argv[1] } <FILE>`)
  process.exit(1)
}

const file = path.resolve(process.cwd(), process.argv[2])
const records$ = replayRecordsFrom(file)
const speed$ = records$.pipe(map(r => r.speed))
const heartRate$ = records$.pipe(map(r => r.heart_rate))

speed$.pipe(slidingAverage(10)).subscribe(console.log)
heartRate$.pipe(slidingAverage(10)).subscribe(console.log)

function slidingAverage(windowSize: 10): OperatorFunction<number, number> {
  return pipe(
    scan<number, number[]>((values, value) => values.slice(1 - windowSize).concat(value), []),
    filter(values => values.length === windowSize),
    map(values => values.reduce((sum, value) => sum + value, 0) / windowSize),
  )
}
