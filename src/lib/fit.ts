import fs from 'fs'
import EasyFit, { Activity, Record } from 'easy-fit'
import { from, Observable, OperatorFunction, timer, zip } from 'rxjs'
import { map, mergeMap, pluck } from 'rxjs/operators'

const ef = new EasyFit({
  speedUnit: 'km/h',
  lengthUnit: 'km',
})

type Records = {
  speed$: Observable<number>
  cadence$: Observable<number>
  heartRate$: Observable<number>
}

/**
 * Replays records from a FIT file.
 *
 * @param fileName
 * @param speed    At which interval records should be replayed.
 */
export function readRecords(fileName: string, speed: number = 1000): Records {
  const records$ = from(readFile(fileName)).pipe(mergeMap(activity => from(activity.records)))

  const getObservableFor = <T>(get: OperatorFunction<Record, T>, interval: number): Observable<T> =>
    zip(
      records$.pipe(get),
      timer(Math.floor(Math.random() * speed / 10), interval),
    ).pipe(map(([value]) => value))

  return {
    speed$: getObservableFor(pluck('speed'), speed),
    cadence$: getObservableFor(pluck('cadence'), speed),
    heartRate$: getObservableFor(pluck('heart_rate'), 3 * speed),
  }
}

async function readFile(fileName: string): Promise<Activity> {
  const data = await fs.promises.readFile(fileName)
  return await parse(data)
}

function parse(data: Buffer): Promise<Activity> {
  return new Promise<Activity>((resolve, reject) => {
    ef.parse(data, (err, activity) => {
      if (err) {
        reject(new Error(err))
        return
      }

      resolve(activity)
    })
  })
}
