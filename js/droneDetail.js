/**
 * 无人机蜂群战术系统 - 无人机详情（与通信网络相同的弹窗形式）
 * 点击地图无人机 icon 展示 Popup，含可见光/热红外影像回传
 */
(function(global) {
  'use strict';

  var TYPE_LABELS = { scout: '侦察型', attack: '攻击型', relay: '中继型', transport: '运输型' };

  function buildDronePopupHtml(d) {
    if (!d) return '';
    var statusText = d.status === 'mission' ? '任务中' : d.status === 'available' ? '可用' : '不可用';
    var statusColor = d.status === 'mission' ? '#ef4444' : d.status === 'available' ? '#22c55e' : '#64748b';
    var missionName = '—';
    if (global.SWARM_DATA && d.missionId) {
      var m = (global.SWARM_DATA.MISSIONS || []).find(function(x) { return x.id === d.missionId; });
      if (m) missionName = m.name;
    }
    var batColor = d.battery > 60 ? '#22c55e' : d.battery > 30 ? '#f59e0b' : '#ef4444';
    var pos = (d.lat != null && d.lng != null) ? (d.lat.toFixed(4) + '°, ' + d.lng.toFixed(4) + '°') : '—';

    return '<div class="swarm-comm-popup swarm-drone-popup">' +
      '<div class="swarm-comm-popup-title">无人机详情 · ' + (d.name || d.id) + '</div>' +
      '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">型号</span><span class="swarm-comm-val">' + (d.model || TYPE_LABELS[d.type] || d.type) + '</span></div>' +
      '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">状态</span><span class="swarm-comm-val" style="color:' + statusColor + '">' + statusText + '</span></div>' +
      '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">电量</span><span class="swarm-comm-val" style="color:' + batColor + '">' + (d.battery != null ? d.battery + '%' : '—') + '</span></div>' +
      '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">信号</span><span class="swarm-comm-val">' + (d.signal != null ? d.signal + '%' : '—') + '</span></div>' +
      '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">高度</span><span class="swarm-comm-val">' + (d.altitude > 0 ? d.altitude + ' m' : '—') + '</span></div>' +
      '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">速度</span><span class="swarm-comm-val">' + (d.speed > 0 ? d.speed + ' km/h' : '—') + '</span></div>' +
      '<div class="swarm-comm-popup-divider"></div>' +
      '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">位置</span><span class="swarm-comm-val">' + pos + '</span></div>' +
      '<div class="swarm-comm-popup-row"><span class="swarm-comm-label">所属任务</span><span class="swarm-comm-val">' + missionName + '</span></div>' +
      '<div class="swarm-comm-popup-divider"></div>' +
      '<div class="swarm-drone-popup-imagery">' +
        '<div class="swarm-drone-popup-imgrow">' +
          '<span class="swarm-comm-label">可见光</span>' +
          '<div class="swarm-drone-popup-frame">' + (d.visibleImg ? '<img src="' + d.visibleImg + '" alt="可见光" />' : '<span>● 实时回传</span>') + '</div>' +
        '</div>' +
        '<div class="swarm-drone-popup-imgrow">' +
          '<span class="swarm-comm-label">热红外</span>' +
          '<div class="swarm-drone-popup-frame thermal">' + (d.thermalImg ? '<img src="' + d.thermalImg + '" alt="热红外" />' : '<span>● 实时回传</span>') + '</div>' +
        '</div>' +
      '</div>' +
      '</div>';
  }

  global.buildDronePopupHtml = buildDronePopupHtml;
})(typeof window !== 'undefined' ? window : this);
