/**
 * 无人机蜂群战术系统 - 任务列表 + 战术系统面板（右侧竖栏）
 * 任务列表：任务中/已完成/待执行，点击查看详情（背景、目标地点、需达成目标）
 * 战术系统：四种战术，点击查看战术详情
 */
(function(global) {
  'use strict';

  var activeTab = 'missions';
  var selectedMissionId = null;
  var selectedTacticId = null;
  var selectedCaseId = null;

  function render() {
    var data = global.SWARM_DATA;
    if (!data || !data.MISSIONS || !data.TACTICS) return;

    var root = document.getElementById('swarm-task-tactic-panel');
    if (!root) return;

    var missionContent = renderMissionList(data.MISSIONS);
    var tacticContent = renderTacticGrid(data.TACTICS);
    var missionsAndTacticsContent = missionContent + '<div class="swarm-tactic-section"><div class="swarm-tactic-section-title">战术系统</div>' + tacticContent + '</div>';

    var bodyContent = activeTab === 'missions' ? missionsAndTacticsContent :
      (data.BATTLE_CASES ? renderBattleCaseList(data.BATTLE_CASES) : '<div class="swarm-empty">暂无战例</div>');

    root.innerHTML =
      '<div class="swarm-panel-tabs">' +
        '<button class="swarm-tab' + (activeTab === 'missions' ? ' active' : '') + '" data-tab="missions">任务列表</button>' +
        '<button class="swarm-tab' + (activeTab === 'cases' ? ' active' : '') + '" data-tab="cases">战例库</button>' +
      '</div>' +
      '<div class="swarm-panel-body swarm-tab-content">' + bodyContent + '</div>';

    root.querySelectorAll('.swarm-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });

    root.querySelectorAll('.swarm-mission-row').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = el.getAttribute('data-mission-id');
        selectedMissionId = (selectedMissionId === id ? null : id);
        render();
      });
    });

    root.querySelectorAll('.swarm-tactic-card').forEach(function(el) {
      el.addEventListener('click', function() {
        selectedTacticId = el.getAttribute('data-tactic-id');
        showTacticDetail(selectedTacticId);
      });
    });

    root.querySelectorAll('.swarm-case-card').forEach(function(el) {
      el.addEventListener('click', function() {
        selectedCaseId = el.getAttribute('data-case-id');
        showBattleCaseDetail(selectedCaseId);
      });
    });
  }

  function renderMissionList(missions) {
    var active = missions.filter(function(m) { return m.status === 'active'; });
    var completed = missions.filter(function(m) { return m.status === 'completed'; });
    var pending = missions.filter(function(m) { return m.status === 'pending'; });

    var statusLabel = function(s) {
      if (s === 'active') return '任务中';
      if (s === 'completed') return '已完成';
      return '待执行';
    };
    var statusClass = function(s) {
      if (s === 'active') return 'swarm-status-active';
      if (s === 'completed') return 'swarm-status-done';
      return 'swarm-status-pending';
    };

    var html = '';
    [].concat(active, pending, completed).forEach(function(m) {
      var isExpanded = selectedMissionId === m.id;
      html +=
        '<div class="swarm-mission-row' + (isExpanded ? ' expanded' : '') + '" data-mission-id="' + m.id + '">' +
          '<div class="swarm-mission-top">' +
            '<span class="swarm-mission-id">' + m.id + '</span>' +
            '<span class="swarm-mission-status ' + statusClass(m.status) + '">' + statusLabel(m.status) + '</span>' +
          '</div>' +
          '<div class="swarm-mission-name">' + m.name + '</div>' +
          '<div class="swarm-mission-desc">' + m.description + '</div>' +
          '<div class="swarm-mission-progress">' +
            '<div class="swarm-progress-bar"><div class="swarm-progress-fill" style="width:' + (m.progress || 0) + '%"></div></div>' +
            '<span>' + (m.progress || 0) + '%</span>' +
          '</div>' +
          (isExpanded ? renderMissionDetailInline(m) : '') +
        '</div>';
    });
    return '<div class="swarm-mission-list">' + html + '</div>';
  }

  function renderMissionDetailInline(m) {
    var objs = (m.objectives || []).map(function(o) {
      return '<div class="swarm-detail-obj"><span class="swarm-obj-dot"></span>' + o + '</div>';
    }).join('');
    return '<div class="swarm-mission-detail-inline">' +
      '<div class="swarm-detail-block">' +
        '<div class="swarm-detail-label">任务背景</div>' +
        '<p class="swarm-detail-text">' + (m.background || '—') + '</p>' +
      '</div>' +
      '<div class="swarm-detail-block">' +
        '<div class="swarm-detail-label">目标地点</div>' +
        '<p class="swarm-detail-text">' + (m.targetDescription || '—') + '</p>' +
      '</div>' +
      '<div class="swarm-detail-block">' +
        '<div class="swarm-detail-label">需达成目标</div>' +
        '<div class="swarm-detail-objectives">' + objs + '</div>' +
      '</div>' +
      '</div>';
  }

  function renderTacticGrid(tactics) {
    var html = tactics.map(function(t) {
      return (
        '<div class="swarm-tactic-card" data-tactic-id="' + t.id + '">' +
          '<div class="swarm-tactic-icon">' + t.icon + '</div>' +
          '<div class="swarm-tactic-name">' + t.name + '</div>' +
          '<div class="swarm-tactic-desc">' + t.shortDesc + '</div>' +
        '</div>'
      );
    }).join('');
    return '<div class="swarm-tactic-grid">' + html + '</div>';
  }

  function renderBattleCaseList(cases) {
    var html = (cases || []).map(function(c) {
      return (
        '<div class="swarm-case-card" data-case-id="' + c.id + '">' +
          '<div class="swarm-case-top">' +
            '<span class="swarm-case-tag">' + (c.tag || '') + '</span>' +
            '<span class="swarm-case-year">' + (c.year || '') + '</span>' +
          '</div>' +
          '<div class="swarm-case-name">' + (c.name || '') + '</div>' +
          '<div class="swarm-case-region">' + (c.region || '') + '</div>' +
          '<div class="swarm-case-summary">' + (c.summary || '') + '</div>' +
        '</div>'
      );
    }).join('');
    return '<div class="swarm-case-list">' + html + '</div>';
  }

  function showBattleCaseDetail(id) {
    var data = global.SWARM_DATA;
    if (!data) return;
    var c = (data.BATTLE_CASES || []).find(function(x) { return x.id === id; });
    if (!c) return;

    var lessonsHtml = (c.lessons || []).map(function(l) {
      return '<div class="swarm-detail-obj"><span class="swarm-obj-dot"></span>' + l + '</div>';
    }).join('');

    var overlay = document.getElementById('swarm-detail-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'swarm-detail-overlay';
      overlay.className = 'swarm-detail-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML =
      '<div class="swarm-detail-modal">' +
        '<div class="swarm-detail-header">' +
          '<span>战例详情 · ' + (c.name || '') + '</span>' +
          '<button class="swarm-detail-close" onclick="SwarmTaskTacticPanel.closeDetail()">&times;</button>' +
        '</div>' +
        '<div class="swarm-detail-body">' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">' + (c.year || '') + ' · ' + (c.region || '') + ' · ' + (c.tag || '') + '</div>' +
            '<p class="swarm-detail-text">' + (c.summary || '—') + '</p>' +
          '</div>' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">经验启示</div>' +
            '<div class="swarm-detail-objectives">' + (lessonsHtml || '—') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    overlay.classList.add('show');

    overlay.querySelector('.swarm-detail-close').addEventListener('click', global.SwarmTaskTacticPanel.closeDetail);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) global.SwarmTaskTacticPanel.closeDetail();
    });
  }

  function showMissionDetail(id) {
    var data = global.SWARM_DATA;
    if (!data) return;
    var m = data.MISSIONS.find(function(x) { return x.id === id; });
    if (!m) return;

    var objs = (m.objectives || []).map(function(o) {
      return '<div class="swarm-detail-obj"><span class="swarm-obj-dot"></span>' + o + '</div>';
    }).join('');

    var overlay = document.getElementById('swarm-detail-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'swarm-detail-overlay';
      overlay.className = 'swarm-detail-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML =
      '<div class="swarm-detail-modal">' +
        '<div class="swarm-detail-header">' +
          '<span>任务详情 · ' + m.name + '</span>' +
          '<button class="swarm-detail-close" onclick="SwarmTaskTacticPanel.closeDetail()">&times;</button>' +
        '</div>' +
        '<div class="swarm-detail-body">' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">任务背景</div>' +
            '<p class="swarm-detail-text">' + (m.background || '—') + '</p>' +
          '</div>' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">目标地点</div>' +
            '<p class="swarm-detail-text">' + (m.targetDescription || '—') + '</p>' +
          '</div>' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">需达成目标</div>' +
            '<div class="swarm-detail-objectives">' + objs + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    overlay.classList.add('show');

    overlay.querySelector('.swarm-detail-close').addEventListener('click', global.SwarmTaskTacticPanel.closeDetail);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) global.SwarmTaskTacticPanel.closeDetail();
    });
  }

  function showTacticDetail(id) {
    var data = global.SWARM_DATA;
    if (!data) return;
    var t = data.TACTICS.find(function(x) { return x.id === id; });
    if (!t) return;

    var phases = (t.phases || []).map(function(p, i) {
      return '<div class="swarm-tactic-phase"><span class="swarm-phase-num">' + (i + 1) + '</span><div><div class="swarm-phase-step">' + p.step + '</div><div class="swarm-phase-desc">' + p.desc + '</div></div></div>';
    }).join('');

    var advs = (t.advantages || []).map(function(a) {
      return '<div class="swarm-tactic-adv">' + a + '</div>';
    }).join('');

    var overlay = document.getElementById('swarm-detail-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'swarm-detail-overlay';
      overlay.className = 'swarm-detail-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML =
      '<div class="swarm-detail-modal">' +
        '<div class="swarm-detail-header">' +
          '<span>战术详情 · ' + t.name + '</span>' +
          '<button class="swarm-detail-close" onclick="SwarmTaskTacticPanel.closeDetail()">&times;</button>' +
        '</div>' +
        '<div class="swarm-detail-body">' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">' + t.icon + ' ' + t.shortDesc + '</div>' +
            '<p class="swarm-detail-text">' + (t.overview || '—') + '</p>' +
          '</div>' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">执行阶段</div>' +
            '<div class="swarm-tactic-phases">' + phases + '</div>' +
          '</div>' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">核心优势</div>' +
            '<div class="swarm-tactic-advs">' + advs + '</div>' +
          '</div>' +
          '<div class="swarm-detail-block">' +
            '<div class="swarm-detail-label">适用场景</div>' +
            '<p class="swarm-detail-text">' + (t.scenarios || '—') + '</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    overlay.classList.add('show');

    overlay.querySelector('.swarm-detail-close').addEventListener('click', global.SwarmTaskTacticPanel.closeDetail);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) global.SwarmTaskTacticPanel.closeDetail();
    });
  }

  function closeDetail() {
    var overlay = document.getElementById('swarm-detail-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  global.SwarmTaskTacticPanel = {
    init: function() {
      if (global.SWARM_DATA) render();
      else document.addEventListener('DOMContentLoaded', function() { setTimeout(render, 50); });
    },
    render: render,
    closeDetail: closeDetail
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', global.SwarmTaskTacticPanel.init);
  } else {
    global.SwarmTaskTacticPanel.init();
  }
})(typeof window !== 'undefined' ? window : this);
