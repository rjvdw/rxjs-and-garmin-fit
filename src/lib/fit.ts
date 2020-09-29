import fs from 'fs'
import EasyFit, { Activity } from 'easy-fit'
import { from, Observable, timer, zip } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'

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

  // FIXME: hard coding key to be either speed, cadence, or heart_rate as these all contain a number
  const getObservableFor = (key: 'speed' | 'cadence' | 'heart_rate', interval: number): Observable<number> =>
    zip(
      records$.pipe(map(r => r[key])),
      timer(0, interval),
    ).pipe(map(([value]) => value))

  return {
    speed$: getObservableFor('speed', speed),
    cadence$: getObservableFor('cadence', speed),
    heartRate$: getObservableFor('heart_rate', speed),
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
