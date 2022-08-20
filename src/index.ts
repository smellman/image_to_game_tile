import { range } from './util'
import { MakeTile } from './maketile'

if (process.argv.length < 4) {
  console.log(`Usage: node ${process.argv[1]} file output_dir`)
  process.exit(1)
} else {
  ;(async () => {
    const image_file = process.argv[2]
    const output_dir = process.argv[3]
    const maketile = new MakeTile(image_file, output_dir)
    await maketile.build_tile()
    process.exit(0)
  })()
}
