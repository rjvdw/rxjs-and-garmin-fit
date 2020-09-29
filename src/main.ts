import path from 'path'
import { filter, map, scan, withLatestFrom } from 'rxjs/operators'
import { replayRecordsFrom } from './lib/fit'
import { OperatorFunction, pipe, zip } from 'rxjs'

if (process.argv.length < 3) {
  console.error(`Usage: ${ process.argv[0] } ${ process.argv[1] } <FILE>`)
  process.exit(1)
}

const BICYCLE_SPECS = { // FIXME: Make configurable or get from FIT file
  wheelSize: 29 * .0254 * Math.PI,
  chainRing: [34],
  cassette: [42, 37, 32, 28, 24, 21, 19, 17, 15, 13, 11],
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

function slidingAverage(windowSize: number = 10): OperatorFunction<number, number | undefined> {
  return pipe(
    scan<number, number[]>((values, value) => values.slice(1 - windowSize).concat(value), []),
    map(values => values.length === windowSize
      ? values.reduce((sum, value) => sum + value, 0) / windowSize
      : undefined),
  )
}

type Gear = {
  chainRing: number,
  cassette: number,
}

function computeGear(cadence: number, speed: number): string | undefined {
  if (cadence === 0 || speed === 0) return undefined
  const rpm = (speed * 1000 / 60) / BICYCLE_SPECS.wheelSize
  const ratio = rpm / cadence
  const computeError = (guess: Gear) => Math.abs(ratio - guess.chainRing / guess.cassette)
  const isBetterGuess = (previousGuess: Gear, guess: Gear) => computeError(guess) < computeError(previousGuess)

  let bestGuess: Gear | undefined = undefined

  for (const chainRing of BICYCLE_SPECS.chainRing) {
    for (const cassette of BICYCLE_SPECS.cassette) {
      const guess: Gear = { chainRing, cassette }
      if (bestGuess === undefined || isBetterGuess(bestGuess, guess)) {
        bestGuess = guess
      }
    }
  }

  if (bestGuess === undefined || computeError(bestGuess) > .2) {
    return undefined
  }

  return `${ bestGuess.chainRing }x${ bestGuess.cassette }`
}

function fmt(value: number | string | undefined): string {
  if (value === undefined) return '???'
  if (typeof value === 'string') return value

  return String(Math.round(value * 100) / 100)
}

function cl(strs: TemplateStringsArray, ...values: string[]): void {
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
