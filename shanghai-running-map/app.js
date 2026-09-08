/* 坐标系：WGS-84。路线坐标已本地化，页面运行时不调用地理编码接口。 */

const metroRoute = [
  [121.488034,31.372912],
  [121.490880,31.368225],
  [121.494210,31.361120],
  [121.495220,31.354005],
  [121.496090,31.347340],
  [121.493840,31.339930],
  [121.491644,31.331044]
];

const nodes = [
  { name: '上海长滩·冠东苑', segment: '起点 · 采江路 / 长滩滨江', note: '起跑点已吸附到小区临路的 OSM 可步行道路。', coord: [121.479717,31.415809], kind: 'start' },
  { name: '零点广场', segment: '长滩滨江步道', note: '临近吴淞口国际邮轮港，可作为第一段的滨江节点。', coord: [121.500550,31.405390] },
  { name: '吴淞炮台湾国家湿地公园', segment: '公园步道 / 塘后路', note: '沿江湿地和公园步道为主，绿化好，需注意开放时间。', coord: [121.504521,31.399104] },
  { name: '淞滨路地铁站', segment: '第一跑步段终点', note: '在此结束第一段跑步，换乘地铁 3 号线。', coord: [121.488260,31.373010], kind: 'metro' },
  { name: '长江南路地铁站', segment: '第二跑步段起点', note: '下车后直接向南，不再绕行何家湾路和新江湾城北部。', coord: [121.491482,31.332062], kind: 'metro' },
  { name: '国权北路', segment: '国权北路', note: '从长江南路向南的连续路段，避免先向西再折返。', coord: [121.491097,31.322514] },
  { name: '殷高东路附近', segment: '国权北路 → 东向支路', note: '沿路网向东南进入杨浦，不再向新江湾城北绕。', coord: [121.502075,31.324959] },
  { name: '黄兴公园西侧绕行点', segment: '公园西侧外部道路', note: '黄兴公园正在改造，路线不进入公园，沿西侧道路南下。', coord: [121.519111,31.302704] },
  { name: '双阳北路', segment: '双阳北路', note: '沿公园西侧向南，衔接双阳路。', coord: [121.521577,31.295909] },
  { name: '双阳路', segment: '双阳路', note: '相较主干路机动车干扰较低，适合稳定配速。', coord: [121.523801,31.290019] },
  { name: '松花江路短段', segment: '松花江路 / 内部支路', note: '只使用短段衔接，取消上一版先向东北、再向西南的折返。', coord: [121.529202,31.290139] },
  { name: '内江路', segment: '内江路', note: '只横过周家嘴路路口，不沿正在整治的周家嘴路长距离跑。', coord: [121.541617,31.282854] },
  { name: '杨树浦路', segment: '杨树浦路', note: '最后的滨江城市道路段，即将到达终点。', coord: [121.552630,31.273500] },
  { name: '国棉十七厂 / 上海国际时尚中心', segment: '终点 · 杨树浦路 2866 号附近', note: '前身为国棉十七厂，今为上海国际时尚中心。', coord: [121.555018,31.275760], kind: 'end' }
];

const explanationData = [
  { title: '无折返南下', text: '取消何家湾、新江湾城北部回环', coord: [121.502075,31.324959] },
  { title: '避开公园改造', text: '走黄兴公园西侧外部道路', coord: [121.519111,31.302704] },
  { title: '双阳路', text: '车流干扰较低 · 适合稳定配速', coord: [121.523801,31.290019] }
];

const styleUrls = [
  'https://tiles.openfreemap.org/styles/liberty',
  'https://tiles.openfreemap.org/styles/bright'
];

const statusBox = document.getElementById('map-status');

function showError(message) {
  statusBox.hidden = false;
  statusBox.textContent = message;
}

function radians(value) { return value * Math.PI / 180; }

function haversineKm(a, b) {
  const earthRadiusKm = 6371.0088;
  const dLat = radians(b[1] - a[1]);
  const dLon = radians(b[0] - a[0]);
  const lat1 = radians(a[1]);
  const lat2 = radians(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function routeDistance(route) {
  return route.slice(1).reduce((total, point, index) => total + haversineKm(route[index], point), 0);
}

function updateDistances() {
  const first = routeDistance(firstRunRoute);
  const metro = routeDistance(metroRoute);
  const second = routeDistance(secondRunRoute);
  const run = first + second;
  const values = {
    'first-distance': first,
    'second-distance': second,
    'run-distance': run,
    'metro-distance': metro,
    'overall-distance': run + metro
  };
  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).textContent = `${value.toFixed(2)} km`;
  });
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatPace(minutesPerKm) {
  const totalSeconds = Math.round(minutesPerKm * 60);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')} /km`;
}

function updateActualSummary() {
  const values = {
    'actual-distance': `${actualActivity.movingDistanceKm.toFixed(2)} km`,
    'actual-first-distance': `${actualActivity.sectionStats[0].distanceKm.toFixed(2)} km`,
    'actual-second-distance': `${actualActivity.sectionStats[1].distanceKm.toFixed(2)} km`,
    'actual-moving-time': formatDuration(actualActivity.movingSeconds),
    'actual-average-pace': formatPace(actualActivity.averagePace),
    'actual-heart-rate': `${actualActivity.averageHeartRate} / ${actualActivity.maxHeartRate} bpm`
  };
  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).textContent = value;
  });
  document.getElementById('activity-method').textContent = actualActivity.method;
}

function lineFeature(coordinates, properties = {}) {
  return { type: 'Feature', properties, geometry: { type: 'LineString', coordinates } };
}

function boundsFor(routes) {
  const bounds = new maplibregl.LngLatBounds();
  routes.flat().forEach((coordinate) => bounds.extend(coordinate));
  return bounds;
}

function closestRouteIndex(route, target) {
  let closestIndex = 0;
  let closestDistance = Infinity;
  route.forEach((point, index) => {
    const distance = haversineKm(point, target);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

async function pickAvailableStyle() {
  for (const url of styleUrls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) return url;
    } catch (error) {
      // 继续尝试下一个 OpenFreeMap 官方样式。
    }
  }
  throw new Error('OpenFreeMap 样式均无法访问');
}

function addRouteLayers(map) {
  map.addSource('running-routes', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        lineFeature(firstRunRoute, { section: 'first-run' }),
        lineFeature(secondRunRoute, { section: 'second-run' })
      ]
    }
  });

  map.addLayer({
    id: 'running-route-casing',
    type: 'line',
    source: 'running-routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 5, 15, 9], 'line-opacity': 0.88 }
  });

  map.addLayer({
    id: 'running-route',
    type: 'line',
    source: 'running-routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#159455', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 3, 15, 5.5], 'line-opacity': 0.82 }
  });

  map.addSource('actual-running-route', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: actualActivity.routeSegments.map((coordinates, index) =>
        lineFeature(coordinates, { section: index + 1, name: actualActivity.name })
      )
    }
  });

  map.addLayer({
    id: 'actual-route-casing',
    type: 'line',
    source: 'actual-running-route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 4.5, 15, 8], 'line-opacity': 0.9 }
  });

  map.addLayer({
    id: 'actual-route',
    type: 'line',
    source: 'actual-running-route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#e75d27', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 2.5, 15, 4.5], 'line-opacity': 0.9 }
  });

  map.addSource('metro-route', {
    type: 'geojson',
    data: lineFeature(metroRoute, { name: '地铁 3 号线' })
  });

  map.addLayer({
    id: 'metro-route-casing',
    type: 'line',
    source: 'metro-route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.9 }
  });

  map.addLayer({
    id: 'metro-route',
    type: 'line',
    source: 'metro-route',
    layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': '#1677d2', 'line-width': 4, 'line-opacity': 0.9, 'line-dasharray': [2, 2] }
  });
}

function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function bindActivityPanel(map) {
  const panel = document.getElementById('activity-panel');
  const svg = document.getElementById('activity-chart');
  const readout = document.getElementById('chart-readout');
  const toggle = document.getElementById('toggle-activity');
  const markerElement = document.createElement('div');
  markerElement.className = 'activity-location-marker';
  markerElement.hidden = true;
  const locationMarker = new maplibregl.Marker({ element: markerElement, anchor: 'center' })
    .setLngLat([actualActivity.samples[0][6], actualActivity.samples[0][7]])
    .addTo(map);

  const chartDefinitions = {
    heartRate: { index: 2, label: '心率', unit: 'bpm', format: (value) => `${Math.round(value)} bpm` },
    pace: { index: 3, label: '配速', unit: 'min/km', format: formatPace, filter: (value) => value >= 3 && value <= 12 },
    elevation: { index: 4, label: '海拔', unit: 'm', format: (value) => `${value.toFixed(1)} m` },
    cadence: { index: 5, label: '步频', unit: 'spm', format: (value) => `${Math.round(value)} spm`, filter: (value) => value >= 100 && value <= 230 }
  };

  function drawChart(metricKey) {
    const definition = chartDefinitions[metricKey];
    const samples = actualActivity.samples.filter((sample) => {
      const value = sample[definition.index];
      return Number.isFinite(value) && (!definition.filter || definition.filter(value));
    });
    const width = 760;
    const height = 150;
    const padding = { left: 47, right: 16, top: 12, bottom: 25 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const xMax = actualActivity.movingDistanceKm;
    const values = samples.map((sample) => sample[definition.index]);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const rangePadding = Math.max((rawMax - rawMin) * 0.1, metricKey === 'heartRate' ? 4 : 0.5);
    const yMin = rawMin - rangePadding;
    const yMax = rawMax + rangePadding;
    const xFor = (distance) => padding.left + distance / xMax * plotWidth;
    const yFor = (value) => padding.top + (yMax - value) / (yMax - yMin) * plotHeight;
    const linePath = samples.map((sample, index) => `${index ? 'L' : 'M'}${xFor(sample[0]).toFixed(2)},${yFor(sample[definition.index]).toFixed(2)}`).join(' ');
    const areaPath = `${linePath} L${xFor(samples[samples.length - 1][0]).toFixed(2)},${padding.top + plotHeight} L${xFor(samples[0][0]).toFixed(2)},${padding.top + plotHeight} Z`;

    svg.replaceChildren();
    svg.setAttribute('aria-label', `${definition.label}随距离变化曲线`);
    for (let index = 0; index <= 4; index += 1) {
      const x = padding.left + plotWidth * index / 4;
      svg.appendChild(createSvgElement('line', { x1: x, y1: padding.top, x2: x, y2: padding.top + plotHeight, class: 'chart-grid' }));
      const label = createSvgElement('text', { x, y: height - 7, 'text-anchor': index === 0 ? 'start' : index === 4 ? 'end' : 'middle' });
      label.textContent = `${(xMax * index / 4).toFixed(1)} km`;
      svg.appendChild(label);
    }
    for (let index = 0; index <= 2; index += 1) {
      const value = yMax - (yMax - yMin) * index / 2;
      const y = padding.top + plotHeight * index / 2;
      svg.appendChild(createSvgElement('line', { x1: padding.left, y1: y, x2: padding.left + plotWidth, y2: y, class: 'chart-grid' }));
      const label = createSvgElement('text', { x: padding.left - 7, y: y + 3, 'text-anchor': 'end' });
      label.textContent = metricKey === 'pace' ? formatPace(value).replace(' /km', '') : Math.round(value);
      svg.appendChild(label);
    }
    svg.appendChild(createSvgElement('path', { d: areaPath, class: 'chart-area' }));
    svg.appendChild(createSvgElement('path', { d: linePath, class: 'chart-line' }));

    const guide = createSvgElement('line', { y1: padding.top, y2: padding.top + plotHeight, class: 'chart-guide', visibility: 'hidden' });
    const point = createSvgElement('circle', { r: 4, class: 'chart-point', visibility: 'hidden' });
    const hit = createSvgElement('rect', { x: padding.left, y: padding.top, width: plotWidth, height: plotHeight, class: 'chart-hit' });
    svg.append(guide, point, hit);

    function selectSample(event) {
      const bounds = svg.getBoundingClientRect();
      const svgX = (event.clientX - bounds.left) / bounds.width * width;
      const targetDistance = Math.max(0, Math.min(xMax, (svgX - padding.left) / plotWidth * xMax));
      let low = 0;
      let high = samples.length - 1;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (samples[middle][0] < targetDistance) low = middle + 1;
        else high = middle;
      }
      const sample = samples[Math.max(0, Math.min(samples.length - 1, low))];
      const x = xFor(sample[0]);
      const y = yFor(sample[definition.index]);
      guide.setAttribute('x1', x);
      guide.setAttribute('x2', x);
      guide.setAttribute('visibility', 'visible');
      point.setAttribute('cx', x);
      point.setAttribute('cy', y);
      point.setAttribute('visibility', 'visible');
      readout.textContent = `${sample[0].toFixed(2)} km · ${definition.label} ${definition.format(sample[definition.index])} · 第 ${sample[8]} 段`;
      locationMarker.setLngLat([sample[6], sample[7]]);
      markerElement.hidden = false;
    }

    hit.addEventListener('pointermove', selectSample);
    hit.addEventListener('pointerdown', selectSample);
    hit.addEventListener('pointerleave', () => {
      guide.setAttribute('visibility', 'hidden');
      point.setAttribute('visibility', 'hidden');
      markerElement.hidden = true;
      readout.textContent = '沿图表移动可查看对应地图位置';
    });
  }

  document.querySelectorAll('[data-chart]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-chart]').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
      drawChart(button.dataset.chart);
    });
  });

  let visible = true;
  toggle.addEventListener('click', () => {
    visible = !visible;
    panel.hidden = !visible;
    ['actual-route', 'actual-route-casing'].forEach((layerId) => map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none'));
    markerElement.hidden = true;
    toggle.setAttribute('aria-pressed', String(visible));
    toggle.textContent = visible ? '隐藏实跑数据' : '显示实跑数据';
  });

  drawChart('heartRate');
}

function safeText(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

function addMarkers(map) {
  const markerObjects = nodes.map((node) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = `route-marker ${node.kind || ''}`;
    element.setAttribute('aria-label', node.name);

    const popup = new maplibregl.Popup({ offset: 16, maxWidth: '300px' }).setHTML(
      `<h2 class="popup-title">${safeText(node.name)}</h2>` +
      `<div class="popup-segment">${safeText(node.segment)}</div>` +
      `<p class="popup-copy">${safeText(node.note)}</p>`
    );

    return new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat(node.coord)
      .setPopup(popup)
      .addTo(map);
  });

  const noteMarkers = explanationData.map((item) => {
    const element = document.createElement('div');
    element.className = 'route-explanation';
    const title = document.createElement('strong');
    title.textContent = item.title;
    const text = document.createElement('span');
    text.textContent = item.text;
    element.append(title, text);
    return new maplibregl.Marker({ element, anchor: 'bottom-left', offset: [8, -8] })
      .setLngLat(item.coord)
      .addTo(map);
  });

  return { markerObjects, noteMarkers };
}

function bindControls(map, markerGroups) {
  const parkWestIndex = closestRouteIndex(secondRunRoute, [121.519111, 31.302704]);
  const viewRoutes = {
    all: [firstRunRoute, metroRoute, secondRunRoute, ...actualActivity.routeSegments],
    'after-metro': [secondRunRoute, actualActivity.routeSegments[1]],
    'after-park-west': [secondRunRoute.slice(parkWestIndex)]
  };

  document.querySelectorAll('[data-fit]').forEach((button) => {
    button.addEventListener('click', () => {
      map.fitBounds(boundsFor(viewRoutes[button.dataset.fit]), { padding: 72, duration: 700, maxZoom: 14.2 });
    });
  });

  let markersVisible = true;
  const markerButton = document.getElementById('toggle-markers');
  markerButton.addEventListener('click', () => {
    markersVisible = !markersVisible;
    markerGroups.markerObjects.forEach((marker) => { marker.getElement().hidden = !markersVisible; });
    markerButton.setAttribute('aria-pressed', String(markersVisible));
    markerButton.textContent = markersVisible ? '隐藏节点' : '显示节点';
  });

  let notesVisible = true;
  const noteButton = document.getElementById('toggle-notes');
  noteButton.addEventListener('click', () => {
    notesVisible = !notesVisible;
    markerGroups.noteMarkers.forEach((marker) => { marker.getElement().hidden = !notesVisible; });
    noteButton.setAttribute('aria-pressed', String(notesVisible));
    noteButton.textContent = notesVisible ? '隐藏路线说明' : '显示路线说明';
  });
}

async function initializeMap() {
  updateDistances();
  updateActualSummary();

  if (!window.maplibregl) {
    showError('地图组件加载失败。请确认设备已连接互联网，然后刷新页面。');
    return;
  }

  try {
    const style = await pickAvailableStyle();
    const map = new maplibregl.Map({
      container: 'map',
      style,
      center: [121.514, 31.345],
      zoom: 11.2,
      minZoom: 8,
      maxZoom: 19,
      attributionControl: false,
      cooperativeGestures: false,
      touchZoomRotate: true,
      dragRotate: false,
      pitchWithRotate: false
    });

    // OpenFreeMap 偶尔会返回样式中未包含的 POI 图标名。
    // 使用透明占位图标，避免它们影响地图或在 Console 中反复报警。
    map.on('styleimagemissing', (event) => {
      if (!map.hasImage(event.id)) {
        map.addImage(event.id, { width: 1, height: 1, data: new Uint8Array([0, 0, 0, 0]) });
      }
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    let loaded = false;
    map.on('load', () => {
      loaded = true;
      addRouteLayers(map);
      const markers = addMarkers(map);
      bindControls(map, markers);
      bindActivityPanel(map);
      map.fitBounds(boundsFor([firstRunRoute, metroRoute, secondRunRoute, ...actualActivity.routeSegments]), { padding: 66, duration: 0, maxZoom: 13.1 });
    });

    map.on('error', (event) => {
      if (!loaded) {
        showError('地图底图加载失败。请检查网络连接并刷新页面；本项目不需要 API Key。');
      } else if (event.error) {
        console.warn('MapLibre/OpenFreeMap:', event.error.message || event.error);
      }
    });
  } catch (error) {
    console.error(error);
    showError('OpenFreeMap Liberty 和 Bright 样式当前均无法访问。请检查网络连接后刷新页面，无需填写任何 Token。');
  }
}

initializeMap();
