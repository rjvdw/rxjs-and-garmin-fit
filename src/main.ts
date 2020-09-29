import path from 'path'
import { readRecords } from './lib/fit'
import { zip } from 'rxjs'
import { filter, map, withLatestFrom } from 'rxjs/operators'
import { computeGear } from './lib/bicycle'
import { slidingAverage } from './lib/util'
import { cl, fmt } from './lib/formatting'

if (process.argv.length < 3) {
  console.error(`Usage: ${ process.argv[0] } ${ process.argv[1] } <FILE>`)
  process.exit(1)
}

const file = path.resolve(process.cwd(), process.argv[2])

const { cadence$, speed$, heartRate$ } = readRecords(file)

const avgCadence$ = cadence$.pipe(slidingAverage(10))
const avgSpeed$ = speed$.pipe(slidingAverage(10))
const avgHeartRate$ = heartRate$.pipe(slidingAverage(10))
const gear$ = zip(cadence$, speed$)
  .pipe(
    map(([cadence, speed]) => computeGear(cadence, speed)),
    filter(gear => gear !== undefined),
  )

zip(cadence$, speed$, avgCadence$, avgSpeed$, avgHeartRate$)
  .pipe(
    withLatestFrom(gear$)
  )
  .subscribe(([[cadence, speed, avgCadence, avgSpeed, heartRate], gear]) => {
    cl`
      |cadence:        ${ fmt(cadence) } (avg: ${ fmt(avgCadence) })
      |speed:          ${ fmt(speed) } (avg: ${ fmt(avgSpeed) })
      |gear:           ${ fmt(gear) }
      |avg heart rate: ${ fmt(heartRate) }
    `
  })
