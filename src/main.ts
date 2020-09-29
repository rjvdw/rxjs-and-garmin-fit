import path from 'path'
import { filter, map, withLatestFrom } from 'rxjs/operators'
import { replayRecordsFrom } from './lib/fit'
import { zip } from 'rxjs'
import { computeGear } from './lib/bicycle'
import { cl, fmt } from './lib/formatting'
import { slidingAverage } from './lib/util'

if (process.argv.length < 3) {
  console.error(`Usage: ${ process.argv[0] } ${ process.argv[1] } <FILE>`)
  process.exit(1)
}

const file = path.resolve(process.cwd(), process.argv[2])
const records$ = replayRecordsFrom(file)

const cadence$ = records$.pipe(map(r => r.cadence))
const speed$ = records$.pipe(map(r => r.speed))
const heartRate$ = records$.pipe(map(r => r.heart_rate))
const gear$ = zip(cadence$, speed$)
  .pipe(
    map(([cadence, speed]) => computeGear(cadence, speed)),
    filter(gear => gear !== undefined),
  )

const avgCadence$ = cadence$.pipe(slidingAverage(10))
const avgSpeed$ = speed$.pipe(slidingAverage(10))
const avgHeartRate$ = heartRate$.pipe(slidingAverage(10))

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

