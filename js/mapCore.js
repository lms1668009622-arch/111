/**
 * 无人机蜂群战术系统 - 蜂群图层叠加模块
 * 地图上一个 icon 代表一架无人机（单机显示），左侧设备仍按编队管理
 */
(function(global) {
  'use strict';

  var droneMarkers = {};
  var targetMarkers = {};
  var routeLayers = [];
  var targetCircles = [];
  var relationLines = [];
  var commLines = [];

  function getMap() {
    return global.map || null;
  }

  // 单机无人机 icon：无背景的十字/X 形符号，放大约 80%
  function droneIcon(d) {
    var c = d.status === 'mission' ? '#ef4444' : d.status === 'available' ? '#22c55e' : '#64748b';
    var svg = '<svg width="43" height="43" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="12" y1="20" x2="12" y2="8" stroke="' + c + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<line x1="6" y1="8" x2="18" y2="8" stroke="' + c + '" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="8" y1="6" x2="16" y2="10" stroke="' + c + '" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="16" y1="6" x2="8" y2="10" stroke="' + c + '" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';
    return L.divIcon({
      html: '<div style="width:43px;height:43px;line-height:0;">' + svg + '</div>',
      className: 'drone-marker',
      iconSize: [43, 43],
      iconAnchor: [22, 22]
    });
  }

  function targetIcon(m) {
    var c = m.priority === 'high' ? '#ef4444' : '#f59e0b';
    return L.divIcon({
      html: '<div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:14px solid ' + c + ';filter:drop-shadow(0 0 2px #fff);"></div>',
      className: 'target-marker',
      iconSize: [16, 14],
      iconAnchor: [8, 14]
    });
  }

  function clearMapOverlays() {
    var map = getMap();
    if (!map) return;

    Object.keys(droneMarkers).forEach(function(id) {
      map.removeLayer(droneMarkers[id]);
    });
    droneMarkers = {};
    Object.keys(targetMarkers).forEach(function(id) {
      map.removeLayer(targetMarkers[id]);
    });
    targetMarkers = {};
    routeLayers.forEach(function(l) { map.removeLayer(l); });
    routeLayers = [];
    targetCircles.forEach(function(l) { map.removeLayer(l); });
    targetCircles = [];
    relationLines.forEach(function(l) { map.removeLayer(l); });
    relationLines = [];
    commLines.forEach(function(l) { map.removeLayer(l); });
    commLines = [];
  }

  function drawAll() {
    var map = getMap();
    if (!map || !global.SWARM_DATA) return;
    clearMapOverlays();

    var DRONES = global.SWARM_DATA.DRONES || [];
    var MISSIONS = global.SWARM_DATA.MISSIONS || [];

    // 单机无人机标记
    DRONES.forEach(function(d) {
      if (d.lat == null || d.lng == null) return;
      var marker = L.marker([d.lat, d.lng], { icon: droneIcon(d) })
        .addTo(map)
        .bindTooltip(
          (d.name || d.id) + ' | ' +
          (d.status === 'mission' ? '任务中' : d.status === 'available' ? '可用' : '不可用') +
          ' | ' + (d.battery != null ? d.battery : 0) + '%',
          { permanent: false, direction: 'top' }
        );
      marker._droneId = d.id;
      var popupHtml = (global.buildDronePopupHtml && global.buildDronePopupHtml(d)) || (d.name || d.id);
      marker.bindPopup(popupHtml, { className: 'swarm-comm-popup-wrap', maxWidth: 320, autoClose: false });
      droneMarkers[d.id] = marker;
    });

    // 任务航线（按任务 waypoints）
    (MISSIONS || []).filter(function(m) {
      return m.status === 'active' && m.waypoints && m.waypoints.length >= 2;
    }).forEach(function(m) {
      var pts = m.waypoints.map(function(w) { return [w.lat, w.lng]; });
      var poly = L.polyline(pts, {
        color: m.color || '#ef4444',
        weight: 3,
        opacity: 0.8,
        dashArray: '8,8'
      }).addTo(map);
      routeLayers.push(poly);
    });

    // 任务目标区与目标点
    (MISSIONS || []).filter(function(m) {
      return m.targetLat != null && m.targetLng != null && m.status !== 'completed';
    }).forEach(function(m) {
      var circle = L.circle([m.targetLat, m.targetLng], {
        radius: 8000,
        color: m.color || '#ef4444',
        fillColor: m.color || '#ef4444',
        fillOpacity: 0.15,
        weight: 2
      }).addTo(map);
      targetCircles.push(circle);
      var marker = L.marker([m.targetLat, m.targetLng], {
        icon: targetIcon({ priority: m.priority || 'high' })
      })
        .addTo(map)
        .bindTooltip(m.name + ' 目标区', { permanent: false });
      targetMarkers['mission-' + m.id] = marker;
    });

    // 单机到目标区的关联线（按任务）
    var missionDrones = {};
    DRONES.filter(function(d) { return d.missionId && d.lat != null && d.lng != null; }).forEach(function(d) {
      if (!missionDrones[d.missionId]) missionDrones[d.missionId] = [];
      missionDrones[d.missionId].push(d);
    });

    Object.keys(missionDrones).forEach(function(mid) {
      var mission = (MISSIONS || []).find(function(m) { return m.id === mid; });
      if (!mission || !mission.targetLat) return;
      var drones = missionDrones[mid];
      drones.forEach(function(d) {
        var line = L.polyline([[d.lat, d.lng], [mission.targetLat, mission.targetLng]], {
          color: '#64748b',
          weight: 1,
          opacity: 0.4,
          dashArray: '4,4'
        }).addTo(map);
        relationLines.push(line);
      });
    });

    // 编队/无人机通信网络（根据底栏开关决定是否绘制）
    if (global._showCommNetwork) {
      drawCommNetwork();
    }
  }

  // 绘制编队内部以及编队之间的通信网络
  function drawCommNetwork() {
    var map = getMap();
    if (!map || !global.SWARM_DATA) return;

    var DRONES = global.SWARM_DATA.DRONES || [];
    var FORMATIONS = global.SWARM_DATA.FORMATIONS || [];

    function buildInternalPopupHtml(formName, aName, bName, aModel, bModel) {
      var epA = (aName || '—') + (aModel ? '（' + aModel + '）' : '');
      var epB = (bName || '—') + (bModel ? '（' + bModel + '）' : '');
      return '<div class="swarm-comm-popup">' +
        '<div class="swarm-comm-popup-title">编队内部通信链路</div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">通信端点</span><span class="swarm-comm-val">' + epA + ' ↔ ' + epB + '</span></div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">所属编队</span><span class="swarm-comm-val">' + (formName || '—') + '</span></div>' +
        '<div class="swarm-comm-popup-divider"></div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">传输协议</span><span class="swarm-comm-val">蜂群自组网 Mesh</span></div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">工作频段</span><span class="swarm-comm-val">Ku 波段（12–18 GHz）</span></div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">协同关系</span><span class="swarm-comm-val">多节点链路协同 · 战术数据实时共享</span></div>' +
        '</div>';
    }

    function buildInterPopupHtml(f1Name, f2Name) {
      return '<div class="swarm-comm-popup">' +
        '<div class="swarm-comm-popup-title">编队间协同链路</div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">协同编队</span><span class="swarm-comm-val">' + (f1Name || '—') + ' ↔ ' + (f2Name || '—') + '</span></div>' +
        '<div class="swarm-comm-popup-divider"></div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">传输协议</span><span class="swarm-comm-val">战术数据链 Link-16（模拟）</span></div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">工作频段</span><span class="swarm-comm-val">L 波段（960–1215 MHz）</span></div>' +
        '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">协同关系</span><span class="swarm-comm-val">多编队联合突防 · 态势信息协同共享</span></div>' +
        '</div>';
    }

    var droneById = {};
    DRONES.forEach(function(d) { droneById[d.id] = d; });

    // 编队内部：同一编队内的无人机按顺序串联
    FORMATIONS.forEach(function(f) {
      var ids = f.droneIds || [];
      var pts = ids.map(function(id) { return droneById[id]; })
        .filter(function(d) { return d && d.lat != null && d.lng != null; });
      if (pts.length < 2) return;
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i];
        var b = pts[i + 1];
        var path = [[a.lat, a.lng], [b.lat, b.lng]];
        var line = L.polyline(path, {
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.85,
          dashArray: '4,8'
        }).addTo(map);
        if (line && line._path && L && L.DomUtil) {
          L.DomUtil.addClass(line._path, 'swarm-comm-line');
        }
        var popupHtml = buildInternalPopupHtml(f.name, a.name || a.id, b.name || b.id, a.model, b.model);
        var hit = L.polyline(path, {
          color: 'transparent',
          weight: 18,
          opacity: 0,
          interactive: true
        }).addTo(map).bindPopup(popupHtml, { className: 'swarm-comm-popup-wrap' });
        commLines.push(line);
        commLines.push(hit);
      }
    });

    // 编队之间：任务中编队中心点之间连线
    var activeForms = FORMATIONS.filter(function(f) {
      return f.status === 'mission' && f.lat != null && f.lng != null;
    });
    for (var i = 0; i < activeForms.length; i++) {
      for (var j = i + 1; j < activeForms.length; j++) {
        var f1 = activeForms[i];
        var f2 = activeForms[j];
        var netPath = [[f1.lat, f1.lng], [f2.lat, f2.lng]];
        var netLine = L.polyline(netPath, {
          color: '#ffffff',
          weight: 1.2,
          opacity: 0.8,
          dashArray: '4,8'
        }).addTo(map);
        if (netLine && netLine._path && L && L.DomUtil) {
          L.DomUtil.addClass(netLine._path, 'swarm-comm-line');
        }
        var netPopupHtml = buildInterPopupHtml(f1.name, f2.name);
        var netHit = L.polyline(netPath, {
          color: 'transparent',
          weight: 18,
          opacity: 0,
          interactive: true
        }).addTo(map).bindPopup(netPopupHtml, { className: 'swarm-comm-popup-wrap' });
        commLines.push(netLine);
        commLines.push(netHit);
      }
    }
  }

  function init() {
    if (!global.map) return;
    drawAll();
  }

  global.SwarmMap = {
    init: init,
    getMap: getMap,
    drawAll: drawAll,
    flyTo: function(lat, lng, zoom) {
      var map = getMap();
      if (map) map.setView([lat, lng], zoom || 10);
    },
    // 供左侧编队详情调用：高亮该编队下的所有无人机 icon
    highlightFormation: function(formationId) {
      var data = global.SWARM_DATA || {};
      var FORMATIONS = data.FORMATIONS || [];
      if (!formationId) {
        Object.keys(droneMarkers).forEach(function(id) {
          var m = droneMarkers[id];
          if (m && m._icon) m._icon.style.filter = 'none';
        });
        return;
      }
      var form = FORMATIONS.find(function(f) { return f.id === formationId; });
      if (!form) {
        Object.keys(droneMarkers).forEach(function(id) {
          var m = droneMarkers[id];
          if (m && m._icon) m._icon.style.filter = 'none';
        });
        return;
      }
      var set = {};
      (form.droneIds || []).forEach(function(id) { set[id] = true; });
      Object.keys(droneMarkers).forEach(function(id) {
        var m = droneMarkers[id];
        if (!m || !m._icon) return;
        m._icon.style.filter = set[id] ? 'drop-shadow(0 0 8px #3b82f6)' : 'none';
      });
    },
    // 切换通信网络展示
    toggleCommNetwork: function(enabled) {
      global._showCommNetwork = !!enabled;
      drawAll();
    }
  };
})(typeof window !== 'undefined' ? window : this);
