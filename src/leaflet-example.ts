export const generateLeafletExample = (max_zoom: number) => {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Game Tile</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css" integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ==" crossorigin="" />
    <script src="https://unpkg.com/leaflet@1.8.0/dist/leaflet.js" integrity="sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ==" crossorigin=""></script>
    <style>
    #map {
      width: 500px;
      height: 500px;
    }
    </style>
  </head>
  <body>
    <h1>Game Tile</h1>
    <div id="map"></div>
    <script>
      const map = L.map('map', {
        crs: L.CRS.Simple,
        maxZoom: ${max_zoom - 1}
      })
      map.setView(map.unproject([0, 0], 8), 8)
      L.tileLayer('./{z}/{x}_{y}.png', {
        maxZoom: ${max_zoom - 1}
      }).addTo(map)
    </script>
  </body>
</html>
`
  return html
}
