(function () {
  'use strict';

  var data = window.BIAOYI_DATA;
  if (!data) return;

  function initMap() {
    var node = document.getElementById('biaoyi-map');
    if (!node) return;
    if (!window.maplibregl) {
      node.innerHTML = '<div class="map-fallback">地图组件加载失败，下面的数据分析和图表仍可正常阅读。</div>';
      return;
    }
    try {
      var map = new maplibregl.Map({
        container: 'biaoyi-map',
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [120.116, 30.235],
        zoom: 11.7,
        attributionControl: true
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.on('load', function () {
        map.addSource('complete-route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: data.route } }
        });
        map.addLayer({
          id: 'route-halo', type: 'line', source: 'complete-route',
          paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.82 }
        });
        map.addLayer({
          id: 'route-line', type: 'line', source: 'complete-route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#198754', 'line-width': 4.5, 'line-opacity': 0.92 }
        });
        var bounds = new maplibregl.LngLatBounds();
        data.route.forEach(function (p) { bounds.extend(p); });
        map.fitBounds(bounds, { padding: 44, duration: 0 });
      });
      data.markers.forEach(function (m, i) {
        var el = document.createElement('div');
        el.className = 'route-marker' + (i === data.markers.length - 1 ? ' end' : '');
        el.textContent = i === 0 ? '起' : (i === data.markers.length - 1 ? '终' : String(i));
        new maplibregl.Marker({ element: el })
          .setLngLat(m.coord)
          .setPopup(new maplibregl.Popup({ offset: 17 }).setHTML('<strong>' + m.name + '</strong><br>' + m.note))
          .addTo(map);
      });
      map.on('error', function (e) {
        if (!map.loaded() && e && e.error) node.setAttribute('data-map-error', e.error.message || '地图资源加载失败');
      });
    } catch (err) {
      node.innerHTML = '<div class="map-fallback">地图初始化失败：' + String(err.message || err) + '</div>';
    }
  }

  var SVG = 'http://www.w3.org/2000/svg';
  function el(name, attrs, text) {
    var n = document.createElementNS(SVG, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function linear(domainMin, domainMax, rangeMin, rangeMax) {
    return function (v) { return rangeMin + (v - domainMin) / (domainMax - domainMin || 1) * (rangeMax - rangeMin); };
  }

  function drawProfile() {
    var host = document.getElementById('profile-chart');
    if (!host) return;
    host.innerHTML = '';
    var width = Math.max(640, host.clientWidth || 760), height = 310;
    var pad = { l: 48, r: 48, t: 18, b: 36 }, innerW = width - pad.l - pad.r, innerH = height - pad.t - pad.b;
    var svg = el('svg', { viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': '海拔和心率随距离变化图' });
    var x = linear(0, 25, pad.l, pad.l + innerW), yE = linear(0, 400, pad.t + innerH, pad.t), yH = linear(120, 180, pad.t + innerH, pad.t);
    [0,100,200,300,400].forEach(function (v) {
      svg.appendChild(el('line', { x1: pad.l, x2: pad.l + innerW, y1: yE(v), y2: yE(v), stroke: '#e6ece8' }));
      svg.appendChild(el('text', { x: pad.l - 8, y: yE(v) + 4, 'text-anchor': 'end', fill: '#718078', 'font-size': 11 }, v + 'm'));
    });
    [0,5,10,15,20,25].forEach(function (v) {
      svg.appendChild(el('line', { x1: x(v), x2: x(v), y1: pad.t, y2: pad.t + innerH, stroke: '#edf1ef' }));
      svg.appendChild(el('text', { x: x(v), y: height - 10, 'text-anchor': 'middle', fill: '#718078', 'font-size': 11 }, v + 'km'));
    });
    [120,140,160,180].forEach(function (v) {
      svg.appendChild(el('text', { x: width - pad.r + 8, y: yH(v) + 4, fill: '#c24141', 'font-size': 11 }, v));
    });
    var ep = data.profile.map(function (p) { return x(p[0]).toFixed(1) + ',' + yE(p[1]).toFixed(1); }).join(' ');
    var hp = data.profile.map(function (p) { return x(p[0]).toFixed(1) + ',' + yH(p[2]).toFixed(1); }).join(' ');
    var area = pad.l + ',' + (pad.t + innerH) + ' ' + ep + ' ' + (pad.l + innerW) + ',' + (pad.t + innerH);
    svg.appendChild(el('polygon', { points: area, fill: '#dff1e7', opacity: .88 }));
    svg.appendChild(el('polyline', { points: ep, fill: 'none', stroke: '#198754', 'stroke-width': 2 }));
    svg.appendChild(el('polyline', { points: hp, fill: 'none', stroke: '#d64545', 'stroke-width': 1.7, opacity: .82 }));
    svg.appendChild(el('text', { x: pad.l + 8, y: pad.t + 15, fill: '#198754', 'font-size': 12, 'font-weight': 700 }, '海拔'));
    svg.appendChild(el('text', { x: pad.l + 52, y: pad.t + 15, fill: '#d64545', 'font-size': 12, 'font-weight': 700 }, '心率'));
    var cursor = el('line', { y1: pad.t, y2: pad.t + innerH, stroke: '#2d3833', 'stroke-width': 1, display: 'none' });
    svg.appendChild(cursor);
    var overlay = el('rect', { x: pad.l, y: pad.t, width: innerW, height: innerH, fill: 'transparent' });
    svg.appendChild(overlay);
    host.appendChild(svg);
    var tip = document.createElement('div'); tip.className = 'chart-tooltip'; host.appendChild(tip);
    overlay.addEventListener('mousemove', function (evt) {
      var r = svg.getBoundingClientRect(), px = (evt.clientX - r.left) * width / r.width;
      var dist = Math.max(0, Math.min(25, (px - pad.l) / innerW * 25));
      var best = data.profile.reduce(function (a,b) { return Math.abs(b[0]-dist) < Math.abs(a[0]-dist) ? b : a; });
      var cx = x(best[0]); cursor.setAttribute('x1', cx); cursor.setAttribute('x2', cx); cursor.setAttribute('display', 'block');
      tip.innerHTML = best[0].toFixed(2) + ' km<br>海拔 ' + Math.round(best[1]) + ' m · 心率 ' + best[2] + ' bpm';
      tip.style.display = 'block'; tip.style.left = (cx / width * 100) + '%'; tip.style.top = (Math.min(yE(best[1]), yH(best[2])) / height * 100) + '%';
    });
    overlay.addEventListener('mouseleave', function () { cursor.setAttribute('display','none'); tip.style.display='none'; });
  }

  function drawSplits() {
    var host = document.getElementById('split-chart');
    if (!host) return;
    host.innerHTML = '';
    var width = Math.max(620, host.clientWidth || 760), height = 290, pad={l:48,r:48,t:18,b:45};
    var svg=el('svg',{viewBox:'0 0 '+width+' '+height,role:'img','aria-label':'每五公里移动配速和平均心率图'}), iw=width-pad.l-pad.r, ih=height-pad.t-pad.b;
    var y=linear(24,12,pad.t+ih,pad.t), yHr=linear(135,170,pad.t+ih,pad.t), barW=iw/data.splits.length*.55;
    [12,15,18,21,24].forEach(function(v){svg.appendChild(el('line',{x1:pad.l,x2:pad.l+iw,y1:y(v),y2:y(v),stroke:'#e6ece8'}));svg.appendChild(el('text',{x:pad.l-8,y:y(v)+4,'text-anchor':'end',fill:'#718078','font-size':11},v+"'"));});
    var pts=[];
    data.splits.forEach(function(s,i){var cx=pad.l+iw*(i+.5)/data.splits.length, top=y(s.pace);svg.appendChild(el('rect',{x:cx-barW/2,y:top,width:barW,height:pad.t+ih-top,rx:3,fill:'#52a879'}));svg.appendChild(el('text',{x:cx,y:top-6,'text-anchor':'middle',fill:'#166c44','font-size':11,'font-weight':700},s.paceLabel));svg.appendChild(el('text',{x:cx,y:height-15,'text-anchor':'middle',fill:'#596861','font-size':11},s.label));pts.push(cx.toFixed(1)+','+yHr(s.hr).toFixed(1));});
    svg.appendChild(el('polyline',{points:pts.join(' '),fill:'none',stroke:'#d64545','stroke-width':2.2}));
    data.splits.forEach(function(s,i){var cx=pad.l+iw*(i+.5)/data.splits.length;svg.appendChild(el('circle',{cx:cx,cy:yHr(s.hr),r:4,fill:'#d64545'}));svg.appendChild(el('text',{x:cx+7,y:yHr(s.hr)-7,fill:'#c23d3d','font-size':10},Math.round(s.hr)));});
    svg.appendChild(el('text',{x:width-pad.r+5,y:pad.t+5,fill:'#d64545','font-size':10},'bpm'));
    host.appendChild(svg);
  }

  function renderAll() { drawProfile(); drawSplits(); }
  initMap(); renderAll();
  var timer;
  window.addEventListener('resize', function(){ clearTimeout(timer); timer=setTimeout(renderAll,180); });
})();
