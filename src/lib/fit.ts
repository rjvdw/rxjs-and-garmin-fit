import fs from 'fs'
import EasyFit, { Activity, Record } from 'easy-fit'
import { from, Observable, timer, zip } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'

const ef = new EasyFit({
  speedUnit: 'km/h',
  lengthUnit: 'km',
})

/**
 * Replays records from a FIT file.
 *
 * @param fileName
 * @param speed    At which interval records should be replayed.
 */
export function replayRecordsFrom(fileName: string, speed: number = 1000): Observable<Record> {
  return zip(
    getRecordsFrom(fileName),
    timer(0, speed),
  ).pipe(map(([record]) => record))
}

/**
 * Reads records from a FIT file.
 *
 * @param fileName
 */
export function getRecordsFrom(fileName: string): Observable<Record> {
  return read(fileName).pipe(mergeMap(activity => from(activity.records)))
}

/**
 * Reads activities from a FIT file.
 *
 * @param fileName
 */
export function read(fileName: string): Observable<Activity> {
  return from(readFile(fileName))
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
