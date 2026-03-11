// public/js/tourMap.js
(function () {
  if (!window.locations || !Array.isArray(window.locations)) return;

  // Center the map; fallback to first location or a default
  const first = locations[0];
  const centerLatLng = first
    ? [first.coordinates[1], first.coordinates[0]]
    : [20.5937, 78.9629]; // India center fallback

  const map = L.map('map', {
    scrollWheelZoom: false
  }).setView(centerLatLng, 7);

  // Tiles (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Fit bounds to all markers
  const bounds = [];
  locations.forEach((loc) => {
    const lat = loc.coordinates[1];
    const lng = loc.coordinates[0];
    const marker = L.marker([lat, lng]).addTo(map);

    marker.bindPopup(`<strong>Day ${loc.day || ''}</strong><br>${loc.description || ''}`);

    bounds.push([lat, lng]);
  });

  if (bounds.length > 0) {
    const pad = 0.5; // padding for visuals
    map.fitBounds(bounds, { padding: [50, 50] });
  }
})();
