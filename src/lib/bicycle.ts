const BICYCLE_SPECS = { // FIXME: Make configurable or get from FIT file
  wheelSize: 29 * .0254 * Math.PI,
  chainRing: [34],
  cassette: [42, 37, 32, 28, 24, 21, 19, 17, 15, 13, 11],
}

type Gear = {
  chainRing: number,
  cassette: number,
}

export function computeGear(cadence: number, speed: number): string | undefined {
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
