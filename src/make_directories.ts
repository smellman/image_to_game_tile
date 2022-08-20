import * as fs from 'fs'
import * as path from 'path'

const make_directory = (dir: string): boolean => {
  try {
    fs.mkdirSync(dir)
  } catch (e) {
    return false
  }
  return true
}

export const make_directories = (dir: string, zoom: Array<number>): boolean => {
  if (!make_directory(dir)) {
    console.debug(`${dir} is exist`)
  }
  return zoom.every((z) => {
    const new_dir = dir + path.sep + z.toString()
    if (!make_directory(new_dir)) {
      return false
    }
    return true
  })
}
