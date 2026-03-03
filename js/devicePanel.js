/**
 * 无人机蜂群战术系统 - 设备管理面板（左侧竖栏）
 * 按编队展示，可滚动；点击编队或地图 icon 可查看编队情况与机型详情
 */
(function(global) {
  'use strict';

  var TYPE_LABELS = { scout: '侦察', attack: '攻击', relay: '中继', transport: '运输' };
  var currentFormationId = null;

  function getFormationsByStatus(data) {
    var formations = data.FORMATIONS || [];
    return {
      inMission: formations.filter(function(f) { return f.status === 'mission'; }),
      available: formations.filter(function(f) { return f.status === 'available'; }),
      unavailable: formations.filter(function(f) { return f.status === 'unavailable'; })
    };
  }

  function formationRow(f) {
    var count = (f.droneIds || []).length;
    var statusDot = f.status === 'mission' ? '#ef4444' : f.status === 'available' ? '#22c55e' : '#64748b';
    var statusText = f.status === 'mission' ? '任务中' : f.status === 'available' ? '可用' : '不可用';
    return (
      '<div class="swarm-formation-row" data-formation-id="' + f.id + '">' +
        '<div class="swarm-formation-top">' +
          '<span class="swarm-drone-dot" style="background:' + statusDot + '"></span>' +
          '<span class="swarm-formation-name">' + f.name + '</span>' +
          '<span class="swarm-formation-badge">' + f.label + '</span>' +
        '</div>' +
        '<div class="swarm-formation-meta">' +
          '<span class="swarm-formation-count">' + count + ' 架</span>' +
          '<span class="swarm-formation-status">' + statusText + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function buildFormationDetailHtml(data, formationId) {
    var f = (data.FORMATIONS || []).find(function(x) { return x.id === formationId; });
    if (!f) return '';

    var drones = (f.droneIds || []).map(function(id) {
      return data.DRONES.find(function(d) { return d.id === id; });
    }).filter(Boolean);

    var missionHtml = '';
    if (f.missionId) {
      var mission = (data.MISSIONS || []).find(function(m) { return m.id === f.missionId; });
      if (mission) missionHtml = '<div class="swarm-formation-detail-row"><span class="swarm-fd-label">所属任务</span><span class="swarm-fd-val">' + mission.name + '</span></div>';
    }

    var pos = (f.lat != null && f.lng != null) ? (f.lat.toFixed(4) + ', ' + f.lng.toFixed(4)) : '—';
    var droneRows = drones.map(function(d) {
      var batColor = d.battery > 60 ? '#22c55e' : d.battery > 30 ? '#f59e0b' : '#ef4444';
      return (
        '<div class="swarm-drone-model-row">' +
          '<div class="swarm-dmr-top">' +
            '<span class="swarm-dmr-name">' + (d.name || d.id) + '</span>' +
            '<span class="swarm-dmr-model">' + (d.model || (TYPE_LABELS[d.type] || d.type)) + '</span>' +
          '</div>' +
          '<div class="swarm-dmr-meta">' +
            '电量 <span style="color:' + batColor + '">' + (d.battery != null ? d.battery + '%' : '—') + '</span>' +
            ' · 信号 ' + (d.signal != null ? d.signal + '%' : '—') +
            (d.altitude > 0 ? ' · 高度 ' + d.altitude + 'm' : '') +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="swarm-formation-detail" id="swarm-formation-detail-box">' +
        '<div class="swarm-formation-detail-header">' +
          '<span class="swarm-fd-title">' + f.name + ' · ' + (f.droneIds || []).length + ' 架</span>' +
          '<button type="button" class="swarm-detail-close swarm-formation-detail-close" aria-label="关闭">×</button>' +
        '</div>' +
        '<div class="swarm-formation-detail-body">' +
          '<div class="swarm-formation-detail-section">' +
            '<div class="swarm-fd-section-title">编队情况</div>' +
            '<div class="swarm-formation-detail-row"><span class="swarm-fd-label">编队代号</span><span class="swarm-fd-val">' + (f.label || f.id) + '</span></div>' +
            '<div class="swarm-formation-detail-row"><span class="swarm-fd-label">状态</span><span class="swarm-fd-val">' + (f.status === 'mission' ? '任务中' : f.status === 'available' ? '可用' : '不可用') + '</span></div>' +
            '<div class="swarm-formation-detail-row"><span class="swarm-fd-label">中心位置</span><span class="swarm-fd-val">' + pos + '</span></div>' +
            missionHtml +
          '</div>' +
          '<div class="swarm-formation-detail-section">' +
            '<div class="swarm-fd-section-title">无人机型号与详情</div>' +
            '<div class="swarm-formation-drones">' + droneRows + '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  var FALCON_FORMATION_ID = 'FORM-B';

  function updateImageryPanel(formationId, data) {
    var panel = document.getElementById('swarm-imagery-panel');
    var body = document.getElementById('swarm-imagery-panel-body');
    if (!panel || !body) return;

    if (formationId !== FALCON_FORMATION_ID) {
      panel.style.display = 'none';
      return;
    }

    var f = (data.FORMATIONS || []).find(function(x) { return x.id === formationId; });
    if (!f || !f.droneIds) {
      panel.style.display = 'none';
      return;
    }

    var drones = f.droneIds.map(function(id) {
      return data.DRONES.find(function(d) { return d.id === id; });
    }).filter(Boolean);

    var html = drones.map(function(d) {
      var visibleHtml = d.visibleImg
        ? '<div class="swarm-imagery-img-wrap"><span class="swarm-imagery-img-label">可见光</span><img src="' + d.visibleImg + '" alt="可见光" /></div>'
        : '<div class="swarm-imagery-img-wrap"><span class="swarm-imagery-img-label">可见光</span><div style="height:60px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:10px;">● 无回传</div></div>';
      var thermalHtml = d.thermalImg
        ? '<div class="swarm-imagery-img-wrap"><span class="swarm-imagery-img-label">热红外</span><img src="' + d.thermalImg + '" alt="热红外" /></div>'
        : '<div class="swarm-imagery-img-wrap"><span class="swarm-imagery-img-label">热红外</span><div style="height:60px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:10px;">● 无回传</div></div>';
      return (
        '<div class="swarm-imagery-drone-card">' +
          '<div class="swarm-imagery-drone-name">' + (d.name || d.id) + '</div>' +
          visibleHtml +
          thermalHtml +
        '</div>'
      );
    }).join('');

    body.innerHTML = html;
    panel.style.display = 'flex';
  }

  function hideImageryPanel() {
    var panel = document.getElementById('swarm-imagery-panel');
    if (panel) panel.style.display = 'none';
  }

  function showFormationDetail(formationId) {
    var data = global.SWARM_DATA;
    if (!data) return;

    currentFormationId = formationId;
    var root = document.getElementById('swarm-device-panel');
    if (!root) return;

    var body = root.querySelector('.swarm-panel-body');
    if (!body) return;

    var existing = body.querySelector('#swarm-formation-detail-box');
    if (existing) existing.remove();

    var html = buildFormationDetailHtml(data, formationId);
    if (!html) return;

    body.insertAdjacentHTML('afterbegin', html);

    var box = body.querySelector('#swarm-formation-detail-box');
    var closeBtn = box && box.querySelector('.swarm-formation-detail-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        if (box) box.remove();
        currentFormationId = null;
        hideImageryPanel();
        if (global.SwarmMap && global.SwarmMap.highlightFormation) global.SwarmMap.highlightFormation(null);
      });
    }

    box && box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    updateImageryPanel(formationId, data);

    if (global.SwarmMap) {
      var f = (data.FORMATIONS || []).find(function(x) { return x.id === formationId; });
      if (f && f.lat != null && f.lng != null) {
        global.SwarmMap.flyTo(f.lat, f.lng, 12);
      }
      if (global.SwarmMap.highlightFormation) global.SwarmMap.highlightFormation(formationId);
    }
  }

  function render() {
    var data = global.SWARM_DATA;
    if (!data || !data.FORMATIONS) return;

    var root = document.getElementById('swarm-device-panel');
    if (!root) return;

    var groups = getFormationsByStatus(data);
    var inMission = groups.inMission;
    var available = groups.available;
    var unavailable = groups.unavailable;

    root.innerHTML =
      '<div class="swarm-panel-header">' +
        '<div class="swarm-panel-title"><span class="swarm-panel-accent"></span>设备管理</div>' +
        '<div class="swarm-panel-stats">' +
          '<div class="swarm-stat-item"><span class="swarm-stat-val" style="color:#22c55e">' + available.length + '</span><span class="swarm-stat-lbl">可用编队</span></div>' +
          '<div class="swarm-stat-item"><span class="swarm-stat-val" style="color:#ef4444">' + inMission.length + '</span><span class="swarm-stat-lbl">任务中</span></div>' +
          '<div class="swarm-stat-item"><span class="swarm-stat-val" style="color:#64748b">' + unavailable.length + '</span><span class="swarm-stat-lbl">不可用</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="swarm-panel-body">' +
        '<div class="swarm-drone-group">' +
          '<div class="swarm-group-title">任务中 (' + inMission.length + ')</div>' +
          inMission.map(function(f) { return formationRow(f); }).join('') +
        '</div>' +
        '<div class="swarm-drone-group">' +
          '<div class="swarm-group-title">可用 (' + available.length + ')</div>' +
          available.map(function(f) { return formationRow(f); }).join('') +
        '</div>' +
        '<div class="swarm-drone-group">' +
          '<div class="swarm-group-title">不可用 (' + unavailable.length + ')</div>' +
          unavailable.map(function(f) { return formationRow(f); }).join('') +
        '</div>' +
      '</div>';

    root.querySelectorAll('.swarm-formation-row').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = el.getAttribute('data-formation-id');
        if (id) showFormationDetail(id);
      });
    });

    if (currentFormationId) {
      var detailHtml = buildFormationDetailHtml(data, currentFormationId);
      if (detailHtml) {
        var body = root.querySelector('.swarm-panel-body');
        if (body) body.insertAdjacentHTML('afterbegin', detailHtml);
        var box = body.querySelector('#swarm-formation-detail-box');
        var closeBtn = box && box.querySelector('.swarm-formation-detail-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', function() {
            if (box) box.remove();
            currentFormationId = null;
            hideImageryPanel();
            if (global.SwarmMap && global.SwarmMap.highlightFormation) global.SwarmMap.highlightFormation(null);
          });
        }
      }
    }

    if (currentFormationId) {
      updateImageryPanel(currentFormationId, data);
    } else {
      hideImageryPanel();
    }
  }

  function bindImageryPanelClose() {
    var imageryClose = document.querySelector('.swarm-imagery-panel-close');
    if (imageryClose && !imageryClose._bound) {
      imageryClose._bound = true;
      imageryClose.addEventListener('click', hideImageryPanel);
    }
  }

  function init() {
    if (global.SWARM_DATA) {
      render();
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(render, 50);
      });
    }
    bindImageryPanelClose();
    document.addEventListener('DOMContentLoaded', bindImageryPanelClose);
    global.showFormationDetail = showFormationDetail;
  }

  global.SwarmDevicePanel = {
    init: init,
    render: render,
    showFormationDetail: showFormationDetail
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
