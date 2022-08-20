import { range } from './util'
import { MakeTile } from './maketile'

if (process.argv.length < 6) {
  console.log(
    `Usage: node ${process.argv[1]} file min_zoom max_zoom output_dir`
  )
  process.exit(1)
} else {
  ;(async () => {
    console.log(process.argv)
    const image_file = process.argv[2]
    const zooms: Array<number> = range(
      parseInt(process.argv[3]),
      parseInt(process.argv[4]) + 1
    )
    const output_dir = process.argv[5]
    const maketile = new MakeTile(image_file, output_dir, zooms)
    await maketile.build_tile()
    process.exit(0)
  })()
}
