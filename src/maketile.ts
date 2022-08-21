import path from 'path'
import puppeteer from 'puppeteer'
import { make_directories } from './make_directories'
import { range } from './util'
import { generateLeafletExample } from './leaflet-example'
import { writeFileSync } from 'fs'

type ImageType = 'SVG' | 'Image'

export class MakeTile {
  image_path: string
  output_dir: string
  zooms: Array<number> = []
  zoom_origin = 8
  image_type: ImageType = 'SVG'

  constructor(image_path: string, output_dir: string) {
    this.image_path = encodeURI(
      `file://${path.join(__dirname, '../', image_path).replace(/\\/g, '/')}`
    )
    console.log(this.image_path)
    this.output_dir = output_dir
    if (!this.image_path.endsWith('.svg')) {
      this.image_type = 'Image'
    }
  }

  async build_tile() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(this.image_path)
    const size = await this.getBaseVal(page, this.image_type)
    console.log(size)
    const max_size = Math.max(size.width, size.height)
    this.zoom_origin = parseInt((Math.log(max_size) / Math.log(2)).toFixed(0))
    const max_zoom = this.zoom_origin + 1
    this.zooms = range(0, max_zoom)
    if (!make_directories(this.output_dir, this.zooms)) {
      return
    }
    await page.close()
    await browser.close()
    await Promise.all(
      this.zooms.map(async (z) => {
        const zoom_count = z - this.zoom_origin
        const real_scale = 1 * Math.pow(2, zoom_count)
        console.log(`zoom: ${z} real_scale: ${real_scale}`)
        await this._make_tile(z, size.width, size.height, real_scale)
        console.log(`finished zoom: ${z}`)
      })
    )
    const html = generateLeafletExample(max_zoom)
    const html_path = path.join(this.output_dir, 'index.html')
    writeFileSync(html_path, html)
    console.log('done')
  }

  async getBaseVal(page: puppeteer.Page, image_type: ImageType) {
    if (image_type === 'SVG') {
      const baseVal = await page.evaluate(() => {
        return document.documentElement.getAttribute('viewBox')
      })
      if (baseVal !== null) {
        const width = parseInt(baseVal.split(' ')[2])
        const height = parseInt(baseVal.split(' ')[3])
        return { width: width, height: height }
      }
      return { width: 0, height: 0 }
    } else {
      const width = await page.evaluate(() => {
        return document.getElementsByTagName('img')[0].naturalWidth
      })
      const height = await page.evaluate(() => {
        return document.getElementsByTagName('img')[0].naturalHeight
      })
      return { width: width, height: height }
    }
  }

  async _make_tile(
    zoom: number,
    width: number,
    height: number,
    real_scale: number
  ) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(this.image_path)
    const start_row = 0
    const start_column = 0
    let row = start_row
    let column = start_column
    let to_x = width * real_scale
    let to_y = height * real_scale
    if (real_scale < 1) {
      to_x = width
      to_y = height
    }
    const start_x = 0
    const start_y = 0
    const max_tiles = Math.pow(2, zoom)
    let clip_size = 256 / real_scale
    const viewport = {
      width: Math.floor(to_x),
      height: Math.floor(to_y),
      deviceScaleFactor: real_scale,
    }
    await page.setViewport(viewport)

    let rect = {
      top: start_y,
      left: start_x,
      width: clip_size,
      height: clip_size,
    }
    for (column = start_column; column < max_tiles; column++) {
      for (row = start_row; row < max_tiles; row++) {
        rect.left = start_x + rect.width * column
        rect.top = start_y + rect.height * row
        if (rect.left >= to_x || rect.top >= to_y) {
          continue
        }
        if (
          real_scale > 1 &&
          (rect.left * real_scale >= to_x || rect.top * real_scale >= to_y)
        ) {
          continue
        }
        const filename = path.join(
          this.output_dir,
          zoom.toString(),
          column.toString() + '_' + row.toString() + '.png'
        )
        const screenshot = {
          path: filename,
          clip: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          },
        }
        await page.screenshot(screenshot)
      }
    }
    browser.close()
  }
}
