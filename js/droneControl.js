/**
 * 无人机蜂群战术系统 - 操控系统（飞控 + 挂载设备控制）
 * 底栏按钮开启后，在底部栏上方显示操控面板
 */
(function(global) {
  'use strict';

  var controlOpen = false;
  var selectedDroneId = null;

  function render() {
    var panel = document.getElementById('swarm-drone-control-panel');
    if (!panel) return;

    var data = global.SWARM_DATA;
    var drones = (data && data.DRONES) ? data.DRONES.filter(function(d) { return d.status === 'mission'; }) : [];
    var droneOptions = drones.map(function(d) {
      return '<option value="' + d.id + '">' + (d.name || d.id) + '</option>';
    }).join('');

    panel.innerHTML =
      '<div class="swarm-control-header">' +
        '<div class="swarm-control-header-left">' +
          '<span class="swarm-control-title"><i class="fas fa-sliders-h"></i> 无人机操控系统</span>' +
          '<div class="swarm-control-target">' +
            '<label>当前操控</label>' +
            '<select id="swarm-control-drone-select">' +
              '<option value="">— 选择无人机 —</option>' + droneOptions +
            '</select>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="swarm-control-close" id="swarm-control-close-btn" aria-label="关闭">×</button>' +
      '</div>' +
      '<div class="swarm-control-body">' +
        '<div class="swarm-control-section swarm-control-fc">' +
          '<div class="swarm-control-section-title"><i class="fas fa-plane"></i> 飞控</div>' +
          '<div class="swarm-control-grid swarm-control-grid-fc">' +
            '<div class="swarm-control-item">' +
              '<label>高度 (m)</label>' +
              '<div class="swarm-control-slider-wrap">' +
                '<input type="range" id="ctrl-altitude" min="200" max="4000" value="1200" class="swarm-control-slider">' +
                '<span id="ctrl-altitude-val" class="swarm-control-val">1200</span>' +
              '</div>' +
            '</div>' +
            '<div class="swarm-control-item">' +
              '<label>速度 (km/h)</label>' +
              '<div class="swarm-control-slider-wrap">' +
                '<input type="range" id="ctrl-speed" min="80" max="280" value="180" class="swarm-control-slider">' +
                '<span id="ctrl-speed-val" class="swarm-control-val">180</span>' +
              '</div>' +
            '</div>' +
            '<div class="swarm-control-item">' +
              '<label>航向 (°)</label>' +
              '<div class="swarm-control-slider-wrap">' +
                '<input type="range" id="ctrl-heading" min="0" max="360" value="90" class="swarm-control-slider">' +
                '<span id="ctrl-heading-val" class="swarm-control-val">90</span>' +
              '</div>' +
            '</div>' +
            '<div class="swarm-control-item">' +
              '<label>俯仰 (°)</label>' +
              '<div class="swarm-control-slider-wrap">' +
                '<input type="range" id="ctrl-pitch" min="-30" max="30" value="0" class="swarm-control-slider">' +
                '<span id="ctrl-pitch-val" class="swarm-control-val">0</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="swarm-control-section swarm-control-payload">' +
          '<div class="swarm-control-section-title"><i class="fas fa-camera"></i> 挂载设备 · 轮盘操控</div>' +
          '<div class="swarm-control-payload-dial">' +
            '<div class="swarm-dial-row">' +
              '<div class="swarm-dial-item">' +
                '<div class="swarm-dial-label">云台</div>' +
                '<div class="swarm-dial-wrap" id="swarm-dial-gimbal">' +
                  '<div class="swarm-dial-track"></div>' +
                  '<div class="swarm-dial-knob" id="swarm-dial-gimbal-knob"></div>' +
                '</div>' +
                '<div class="swarm-dial-val" id="swarm-dial-gimbal-val">俯仰 -45° 航向 0°</div>' +
              '</div>' +
              '<div class="swarm-dial-item">' +
                '<div class="swarm-dial-label">变焦</div>' +
                '<div class="swarm-dial-wrap swarm-dial-zoom" id="swarm-dial-zoom">' +
                  '<div class="swarm-dial-track"></div>' +
                  '<div class="swarm-dial-knob swarm-dial-knob-zoom" id="swarm-dial-zoom-knob"></div>' +
                '</div>' +
                '<div class="swarm-dial-val swarm-dial-val-zoom" id="swarm-dial-zoom-val">4×</div>' +
              '</div>' +
            '</div>' +
            '<div class="swarm-dial-toggles">' +
              '<div class="swarm-dial-toggle-group">' +
                '<label class="swarm-control-switch"><input type="checkbox" id="ctrl-visible" checked><span class="swarm-control-switch-slider"></span></label>' +
                '<span class="swarm-dial-toggle-label"><i class="fas fa-sun"></i> 可见光</span>' +
              '</div>' +
              '<div class="swarm-dial-toggle-group">' +
                '<label class="swarm-control-switch"><input type="checkbox" id="ctrl-thermal" checked><span class="swarm-control-switch-slider"></span></label>' +
                '<span class="swarm-dial-toggle-label"><i class="fas fa-fire"></i> 热红外</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    bindSliders();
    bindDials();
    bindClose();
    bindDroneSelect();
  }

  function bindSliders() {
    var sliders = [
      { id: 'ctrl-altitude', valId: 'ctrl-altitude-val', format: function(v) { return v; } },
      { id: 'ctrl-speed', valId: 'ctrl-speed-val', format: function(v) { return v; } },
      { id: 'ctrl-heading', valId: 'ctrl-heading-val', format: function(v) { return v; } },
      { id: 'ctrl-pitch', valId: 'ctrl-pitch-val', format: function(v) { return v; } }
    ];
    sliders.forEach(function(s) {
      var input = document.getElementById(s.id);
      var valEl = document.getElementById(s.valId);
      if (input && valEl) {
        input.addEventListener('input', function() {
          valEl.textContent = s.format(parseInt(input.value, 10));
        });
      }
    });
  }

  function bindClose() {
    var closeBtn = document.getElementById('swarm-control-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }
  }

  var gimbalPitch = -45;
  var gimbalPan = 0;
  var zoomVal = 4;

  function bindDials() {
    var gimbalWrap = document.getElementById('swarm-dial-gimbal');
    var gimbalKnob = document.getElementById('swarm-dial-gimbal-knob');
    var gimbalValEl = document.getElementById('swarm-dial-gimbal-val');
    var zoomWrap = document.getElementById('swarm-dial-zoom');
    var zoomKnob = document.getElementById('swarm-dial-zoom-knob');
    var zoomValEl = document.getElementById('swarm-dial-zoom-val');

    function updateGimbalKnob() {
      if (!gimbalKnob) return;
      var r = 38;
      var panRad = (gimbalPan * Math.PI) / 180;
      var pitchNorm = (gimbalPitch + 90) / 90;
      var radius = r * (1 - pitchNorm);
      if (radius < 2) radius = 2;
      var x = Math.sin(panRad) * radius;
      var y = -Math.cos(panRad) * radius;
      gimbalKnob.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    }

    function updateZoomKnob() {
      if (!zoomKnob) return;
      var angle = ((zoomVal - 1) / 19) * 270 - 135;
      var rad = (angle * Math.PI) / 180;
      var r = 32;
      var x = Math.cos(rad) * r;
      var y = Math.sin(rad) * r;
      zoomKnob.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    }

    if (gimbalWrap && gimbalKnob && gimbalValEl) {
      updateGimbalKnob();
      gimbalValEl.textContent = '俯仰 ' + gimbalPitch + '° 航向 ' + gimbalPan + '°';

      function onGimbalDrag(e) {
        e.preventDefault();
        var rect = gimbalWrap.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var x = (e.clientX || (e.touches && e.touches[0].clientX)) - cx;
        var y = (e.clientY || (e.touches && e.touches[0].clientY)) - cy;
        var dist = Math.min(38, Math.sqrt(x * x + y * y));
        var angle = Math.atan2(x, -y) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        gimbalPan = Math.round(angle);
        gimbalPitch = Math.round((dist / 38) * -90);
        gimbalValEl.textContent = '俯仰 ' + gimbalPitch + '° 航向 ' + gimbalPan + '°';
        updateGimbalKnob();
      }

      gimbalWrap.addEventListener('mousedown', function(e) {
        onGimbalDrag(e);
        document.addEventListener('mousemove', onGimbalDrag);
        document.addEventListener('mouseup', function up() {
          document.removeEventListener('mousemove', onGimbalDrag);
          document.removeEventListener('mouseup', up);
        });
      });
      gimbalWrap.addEventListener('touchstart', function(e) {
        e.preventDefault();
        onGimbalDrag(e);
        document.addEventListener('touchmove', onGimbalDrag, { passive: false });
        document.addEventListener('touchend', function end() {
          document.removeEventListener('touchmove', onGimbalDrag);
          document.removeEventListener('touchend', end);
        }, { once: true });
      });
    }

    if (zoomWrap && zoomKnob && zoomValEl) {
      updateZoomKnob();
      zoomValEl.textContent = zoomVal + '×';

      function onZoomDrag(e) {
        e.preventDefault();
        var rect = zoomWrap.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var x = (e.clientX || (e.touches && e.touches[0].clientX)) - cx;
        var y = (e.clientY || (e.touches && e.touches[0].clientY)) - cy;
        var angle = Math.atan2(x, y) * (180 / Math.PI);
        if (angle < -135) angle = -135;
        if (angle > 135) angle = 135;
        zoomVal = Math.round(1 + ((angle + 135) / 270) * 19);
        zoomVal = Math.max(1, Math.min(20, zoomVal));
        zoomValEl.textContent = zoomVal + '×';
        updateZoomKnob();
      }

      zoomWrap.addEventListener('mousedown', function(e) {
        onZoomDrag(e);
        document.addEventListener('mousemove', onZoomDrag);
        document.addEventListener('mouseup', function up() {
          document.removeEventListener('mousemove', onZoomDrag);
          document.removeEventListener('mouseup', up);
        });
      });
      zoomWrap.addEventListener('touchstart', function(e) {
        e.preventDefault();
        onZoomDrag(e);
        document.addEventListener('touchmove', onZoomDrag, { passive: false });
        document.addEventListener('touchend', function end() {
          document.removeEventListener('touchmove', onZoomDrag);
          document.removeEventListener('touchend', end);
        }, { once: true });
      });
    }
  }

  function bindDroneSelect() {
    var select = document.getElementById('swarm-control-drone-select');
    if (select) {
      select.addEventListener('change', function() {
        selectedDroneId = select.value || null;
        syncFromDrone(selectedDroneId);
      });
    }
  }

  function syncFromDrone(droneId) {
    if (!droneId || !global.SWARM_DATA) return;
    var d = global.SWARM_DATA.DRONES.find(function(x) { return x.id === droneId; });
    if (!d) return;

    var altInput = document.getElementById('ctrl-altitude');
    var speedInput = document.getElementById('ctrl-speed');
    if (altInput) { altInput.value = d.altitude || 1200; altInput.dispatchEvent(new Event('input')); }
    if (speedInput) { speedInput.value = d.speed || 180; speedInput.dispatchEvent(new Event('input')); }
  }

  function open() {
    controlOpen = true;
    var panel = document.getElementById('swarm-drone-control-panel');
    var btn = document.getElementById('btn-control-system');
    if (panel) panel.style.display = 'flex';
    if (btn) btn.classList.add('active');
    render();
  }

  function close() {
    controlOpen = false;
    var panel = document.getElementById('swarm-drone-control-panel');
    var btn = document.getElementById('btn-control-system');
    if (panel) panel.style.display = 'none';
    if (btn) btn.classList.remove('active');
  }

  function toggle() {
    controlOpen = !controlOpen;
    if (controlOpen) open(); else close();
  }

  function init() {
    var btn = document.getElementById('btn-control-system');
    if (btn) {
      btn.addEventListener('click', toggle);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(render, 100);
      });
    }
  }

  global.SwarmDroneControl = {
    init: init,
    open: open,
    close: close,
    toggle: toggle
  };
})(typeof window !== 'undefined' ? window : this);
