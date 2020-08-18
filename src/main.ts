import path from 'path'
import { filter, map, scan } from 'rxjs/operators'
import { replayRecordsFrom } from './lib/fit'
import { OperatorFunction, pipe, zip } from 'rxjs'

if (process.argv.length < 3) {
  console.error(`Usage: ${ process.argv[0] } ${ process.argv[1] } <FILE>`)
  process.exit(1)
}

const file = path.resolve(process.cwd(), process.argv[2])
const records$ = replayRecordsFrom(file)

const cadence$ = records$.pipe(map(r => r.cadence))
const speed$ = records$.pipe(map(r => r.speed))
const heartRate$ = records$.pipe(map(r => r.heart_rate))

const avgCadance$ = cadence$.pipe(slidingAverage(10))
const avgSpeed$ = speed$.pipe(slidingAverage(10))
const avgHeartRate$ = heartRate$.pipe(slidingAverage(10))

zip(avgCadance$, avgSpeed$, avgHeartRate$)
  .pipe(
    map(([cadance, speed, heartRate]) => ({ cadance, speed, heartRate })),
  )
  .subscribe(console.log)

function slidingAverage(windowSize: 10): OperatorFunction<number, number> {
  return pipe(
    scan<number, number[]>((values, value) => values.slice(1 - windowSize).concat(value), []),
    filter(values => values.length === windowSize),
    map(values => values.reduce((sum, value) => sum + value, 0) / windowSize),
  )
}
