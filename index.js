// create a map    
const map = L.map("map").setView([-1.286389, 36.817223], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// feature group to store draw items

const drawItems = new L.FeatureGroup();
map.addLayer(drawItems);

// draw controls

const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawItems },
  draw: {
    // circle: false,
    rectangle: false,
    marker: false,
    circlemarker: false,
  },
});

map.addControl(drawControl);

// handle draw events
map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawItems.addLayer(layer);

  const geojson = layer.toGeoJSON();
  let result = "";

  if (geojson.geometry.type === "LineString") {
    const length = turf.length(geojson, { units: "kilometers" });
    result = `Distance: ${length.toFixed(2)} km`;
  }
  layer.bindPopup(result).openPopup();
});