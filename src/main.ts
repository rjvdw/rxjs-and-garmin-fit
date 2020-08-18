import path from 'path'
import { map } from 'rxjs/operators'
import { replayRecordsFrom } from './lib/fit'

if (process.argv.length < 3) {
  console.error(`Usage: ${ process.argv[0] } ${ process.argv[1] } <FILE>`)
  process.exit(1)
}

const file = path.resolve(process.cwd(), process.argv[2])
const records$ = replayRecordsFrom(file)
const speed$ = records$.pipe(map(r => r.speed))
const heartRate$ = records$.pipe(map(r => r.heart_rate))

speed$.subscribe(console.log)
heartRate$.subscribe(console.log)
