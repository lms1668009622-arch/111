/**
 * 无人机蜂群战术系统 - 智能音控
 * 语音说明任务 + 战术系统选择，派遣对应无人机集群执行任务
 */
(function(global) {
  'use strict';

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = null;
  var isListening = false;
  var parsedMission = null;
  var parsedTactic = null;
  var parsedFormation = null;

  // 关键词 → 任务/战术/编队 映射
  var MISSION_KEYWORDS = {
    '金鹰': 'M001', '前沿侦察': 'M001', '北线': 'M001',
    '猎鹰': 'M002', '突防侦察': 'M002', '南线': 'M002',
    '哨兵': 'M003', '边界警戒': 'M003', '监视': 'M003',
    '隐刃': 'M004', '纵深渗透': 'M004',
    '雷霆': 'M005', '火力压制': 'M005'
  };
  var TACTIC_KEYWORDS = {
    '穿透': 'T001', '穿透式': 'T001', '前沿侦察战术': 'T001',
    '伴随': 'T002', '诱饵': 'T002', '伴随侦察': 'T002',
    '多波次': 'T003', '侦察压制': 'T003', '再侦察': 'T003',
    '持续监视': 'T004', '战果评估': 'T004', '监视评估': 'T004'
  };
  var FORMATION_KEYWORDS = {
    '金鹰编队': 'FORM-A', 'α': 'FORM-A', '阿尔法': 'FORM-A',
    '猎鹰编队': 'FORM-B', 'β': 'FORM-B', '贝塔': 'FORM-B',
    '哨兵编队': 'FORM-C', 'γ': 'FORM-C', '伽马': 'FORM-C',
    '雷霆编队': 'FORM-D', 'δ': 'FORM-D', '德尔塔': 'FORM-D'
  };

  function parseVoiceText(text) {
    var missionId = null, tacticId = null, formationId = null;
    var missions = global.SWARM_DATA && global.SWARM_DATA.MISSIONS ? global.SWARM_DATA.MISSIONS : [];
    var tactics = global.SWARM_DATA && global.SWARM_DATA.TACTICS ? global.SWARM_DATA.TACTICS : [];
    var formations = global.SWARM_DATA && global.SWARM_DATA.FORMATIONS ? global.SWARM_DATA.FORMATIONS : [];

    var t = (text || '').toLowerCase().replace(/\s/g, '');
    var keys = Object.keys(MISSION_KEYWORDS);
    for (var i = 0; i < keys.length; i++) {
      if (t.indexOf(keys[i].toLowerCase()) !== -1) {
        missionId = MISSION_KEYWORDS[keys[i]];
        break;
      }
    }
    keys = Object.keys(TACTIC_KEYWORDS);
    for (var j = 0; j < keys.length; j++) {
      if (t.indexOf(keys[j].toLowerCase()) !== -1) {
        tacticId = TACTIC_KEYWORDS[keys[j]];
        break;
      }
    }
    keys = Object.keys(FORMATION_KEYWORDS);
    for (var k = 0; k < keys.length; k++) {
      if (t.indexOf(keys[k].toLowerCase()) !== -1) {
        formationId = FORMATION_KEYWORDS[keys[k]];
        break;
      }
    }

    var mission = missionId ? missions.find(function(m) { return m.id === missionId; }) : null;
    var tactic = tacticId ? tactics.find(function(tx) { return tx.id === tacticId; }) : null;
    var formation = formationId ? formations.find(function(f) { return f.id === formationId; }) : null;

    return { mission: mission, tactic: tactic, formation: formation, raw: text };
  }

  function showToast(msg, type) {
    type = type || 'info';
    var toast = document.getElementById('swarm-voice-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'swarm-voice-toast';
      toast.className = 'swarm-voice-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'swarm-voice-toast swarm-voice-toast-' + type + ' show';
    setTimeout(function() {
      toast.classList.remove('show');
    }, 2500);
  }

  function dispatch() {
    var formationId = parsedFormation ? parsedFormation.id : null;
    var missionId = parsedMission ? parsedMission.id : null;
    var tacticId = parsedTactic ? parsedTactic.id : null;

    if (!formationId && !missionId) {
      showToast('请先语音选择任务和编队', 'warn');
      return;
    }

    var formation = formationId && global.SWARM_DATA ? (global.SWARM_DATA.FORMATIONS || []).find(function(f) { return f.id === formationId; }) : null;
    var availFormation = formationId ? formation : (global.SWARM_DATA.FORMATIONS || []).find(function(f) { return f.status === 'available'; });
    if (!availFormation) {
      showToast('无可用编队可派遣', 'warn');
      return;
    }

    var mission = missionId && global.SWARM_DATA ? (global.SWARM_DATA.MISSIONS || []).find(function(m) { return m.id === missionId; }) : null;
    var tactic = tacticId && global.SWARM_DATA ? (global.SWARM_DATA.TACTICS || []).find(function(t) { return t.id === tacticId; }) : null;

    var desc = availFormation.name + ' 已派遣';
    if (mission) desc += '执行「' + mission.name + '」';
    if (tactic) desc += '，采用「' + tactic.name + '」战术';
    desc += '。';

    showToast(desc, 'success');

    if (global.SwarmDevicePanel && global.SwarmDevicePanel.showFormationDetail) {
      global.SwarmDevicePanel.showFormationDetail(availFormation.id);
    }
    if (global.SwarmMap && availFormation.lat != null && availFormation.lng != null && global.SwarmMap.flyTo) {
      global.SwarmMap.flyTo(availFormation.lat, availFormation.lng, 12);
    }
  }

  function startListening() {
    if (!SpeechRecognition) {
      showToast('当前浏览器不支持语音识别', 'warn');
      return;
    }
    if (isListening) return;

    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN';

      recognition.onresult = function(event) {
        var text = (event.results[0] && event.results[0][0]) ? event.results[0][0].transcript : '';
        var parsed = parseVoiceText(text);
        parsedMission = parsed.mission;
        parsedTactic = parsed.tactic;
        parsedFormation = parsed.formation;
        updateDisplay(text, parsed);
      };

      recognition.onerror = function(e) {
        isListening = false;
        updateMicButton(false);
        showToast('语音识别出错：' + (e.error || '未知'), 'warn');
      };

      recognition.onend = function() {
        isListening = false;
        updateMicButton(false);
      };
    }

    recognition.start();
    isListening = true;
    updateMicButton(true);
    showToast('请说出任务和战术，如：派遣哨兵编队执行边界警戒，采用持续监视战术', 'info');
  }

  function stopListening() {
    if (recognition && isListening) {
      recognition.stop();
    }
    isListening = false;
    updateMicButton(false);
  }

  function updateMicButton(listening) {
    var btn = document.getElementById('swarm-voice-mic-btn');
    var icon = document.getElementById('swarm-voice-mic-icon');
    if (btn && icon) {
      btn.className = 'swarm-voice-mic-btn' + (listening ? ' listening' : '');
      icon.className = 'fas fa-microphone' + (listening ? ' swarm-voice-pulse' : '');
    }
  }

  function updateDisplay(rawText, parsed) {
    var root = document.getElementById('swarm-voice-control-panel');
    if (!root) return;

    var rawEl = root.querySelector('.swarm-voice-result-text');
    var missionEl = root.querySelector('.swarm-voice-parsed-mission');
    var tacticEl = root.querySelector('.swarm-voice-parsed-tactic');
    var formationEl = root.querySelector('.swarm-voice-parsed-formation');

    if (rawEl) rawEl.textContent = rawText || '—';
    if (missionEl) missionEl.textContent = parsed && parsed.mission ? parsed.mission.name : '—';
    if (tacticEl) tacticEl.textContent = parsed && parsed.tactic ? parsed.tactic.name : '—';
    if (formationEl) formationEl.textContent = parsed && parsed.formation ? parsed.formation.name : '—';
  }

  function render() {
    var root = document.getElementById('swarm-voice-control-panel');
    if (!root) return;

    root.innerHTML =
      '<div class="swarm-voice-header">' +
        '<span class="swarm-voice-title"><i class="fas fa-microphone-alt"></i> 智能音控</span>' +
      '</div>' +
      '<div class="swarm-voice-body">' +
        '<div class="swarm-voice-hint">语音说明任务与战术，派遣无人机集群</div>' +
        '<div class="swarm-voice-mic-wrap">' +
          '<button type="button" id="swarm-voice-mic-btn" class="swarm-voice-mic-btn" title="点击开始语音输入">' +
            '<i id="swarm-voice-mic-icon" class="fas fa-microphone"></i>' +
          '</button>' +
        '</div>' +
        '<div class="swarm-voice-result">' +
          '<div class="swarm-voice-result-label">识别结果</div>' +
          '<div class="swarm-voice-result-text">—</div>' +
        '</div>' +
        '<div class="swarm-voice-parsed">' +
          '<div class="swarm-voice-parsed-row"><span class="swarm-voice-parsed-label">任务</span><span class="swarm-voice-parsed-mission">—</span></div>' +
          '<div class="swarm-voice-parsed-row"><span class="swarm-voice-parsed-label">战术</span><span class="swarm-voice-parsed-tactic">—</span></div>' +
          '<div class="swarm-voice-parsed-row"><span class="swarm-voice-parsed-label">编队</span><span class="swarm-voice-parsed-formation">—</span></div>' +
        '</div>' +
        '<button type="button" class="swarm-voice-dispatch-btn" id="swarm-voice-dispatch-btn">派遣执行</button>' +
      '</div>';

    var micBtn = root.querySelector('#swarm-voice-mic-btn');
    var dispatchBtn = root.querySelector('#swarm-voice-dispatch-btn');

    if (micBtn) {
      micBtn.addEventListener('mousedown', function() { startListening(); });
      micBtn.addEventListener('mouseup', function() { stopListening(); });
      micBtn.addEventListener('mouseleave', function() { stopListening(); });
      micBtn.addEventListener('touchstart', function(e) { e.preventDefault(); startListening(); });
      micBtn.addEventListener('touchend', function(e) { e.preventDefault(); stopListening(); });
    }

    if (dispatchBtn) {
      dispatchBtn.addEventListener('click', dispatch);
    }
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(render, 80);
      });
    } else {
      setTimeout(render, 80);
    }
  }

  global.SwarmVoiceControl = {
    init: init,
    render: render
  };
})(typeof window !== 'undefined' ? window : this);
