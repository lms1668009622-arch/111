/**
 * 无人机蜂群战术系统 - 原始地图初始化（不覆盖）
 * 与 zhikong-seat 一致的地图配置：中心、缩放、瓦片图层、setMapStyle
 */
(function(global) {
  'use strict';

  function init() {
    var el = document.getElementById('map');
    if (!el || typeof L === 'undefined') return null;

    var map = L.map('map', {
      center: [24.0589, 120.4333],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.createPane('boundariesPane');
    var bp = map.getPane('boundariesPane');
    if (bp) { bp.style.zIndex = 420; bp.style.pointerEvents = 'none'; }
    map.createPane('labelPane');
    var lp = map.getPane('labelPane');
    if (lp) { lp.style.zIndex = 410; lp.style.pointerEvents = 'none'; }

    var layerRoadCN = L.tileLayer('https://mt{s}.google.cn/vt/lyrs=m&x={x}&y={y}&z={z}', { subdomains: '0123', maxZoom: 19 });
    var layerSatCN = L.tileLayer('https://mt{s}.google.cn/vt/lyrs=s&x={x}&y={y}&z={z}', { subdomains: '0123', maxZoom: 19 });
    var layerHybridCN = L.tileLayer('https://mt{s}.google.cn/vt/lyrs=y&x={x}&y={y}&z={z}', { subdomains: '0123', maxZoom: 19 });
    var layerTerrainCN = L.tileLayer('https://mt{s}.google.cn/vt/lyrs=p&x={x}&y={y}&z={z}', { subdomains: '0123', maxZoom: 19 });
    var layerOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { subdomains: 'abc', maxZoom: 19 });
    var layerEsri = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
    var layerLabelsCN = L.tileLayer('https://mt{s}.google.cn/vt/lyrs=h&x={x}&y={y}&z={z}', { subdomains: '0123', maxZoom: 19, pane: 'labelPane' });
    var layerBoundaries = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, pane: 'boundariesPane', opacity: 1 });

    function applyBaseLayers(layers) {
      if (global._mapBaseLayers) {
        global._mapBaseLayers.forEach(function(l) { map.removeLayer(l); });
      }
      layers.forEach(function(l) { l.addTo(map); });
      global._mapBaseLayers = layers;
    }

    global.setMapStyle = function(style) {
      var btns = {
        road: document.getElementById('btn-style-road'),
        sat: document.getElementById('btn-style-sat')
      };
      if (btns.road) { btns.road.style.background = '#334155'; btns.road.style.border = '1px solid #475569'; }
      if (btns.sat) { btns.sat.style.background = '#334155'; btns.sat.style.border = '1px solid #475569'; }
      if (style === 'road') {
        applyBaseLayers([layerRoadCN]);
        if (btns.road) { btns.road.style.background = '#3b82f6'; btns.road.style.border = '1px solid #60a5fa'; }
        var s = document.getElementById('map-status'); if (s) s.textContent = '已切换至道路图层';
        layerRoadCN.off('tileerror');
        layerRoadCN.on('tileerror', function() {
          applyBaseLayers([layerOSM]);
          var s2 = document.getElementById('map-status'); if (s2) s2.textContent = '道路图层加载失败，已切换至OSM';
        });
      } else if (style === 'sat') {
        applyBaseLayers([layerSatCN, layerLabelsCN]);
        if (btns.sat) { btns.sat.style.background = '#3b82f6'; btns.sat.style.border = '1px solid #60a5fa'; }
        var s = document.getElementById('map-status'); if (s) s.textContent = '已切换至卫星图层（中文标注）';
        layerSatCN.off('tileerror');
        layerSatCN.on('tileerror', function() {
          applyBaseLayers([layerEsri]);
          var s2 = document.getElementById('map-status'); if (s2) s2.textContent = '卫星图层加载失败，已切换至ESRI卫星';
        });
      }
    };

    global.setMapStyle('road');

    global.map = map;
    return map;
  }

  global.SwarmMapInit = { init: init };
})(typeof window !== 'undefined' ? window : this);
