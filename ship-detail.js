/**
 * 指控席-船舰详情模块
 * 数据来源：后端 GET /api/zhikong/ship/:ship_id 返回 { ship, events }
 *   - ship：来自 ontology_demo5.ship 表
 *   - events：来自 link_event_ship + event 表（任务履历）
 * 前端仅使用该接口数据展示；API 失败时使用内置回退数据。
 * 挂载：window.ShipDetail.loadAndShowModal(which) / loadAndShowPage(which)
 */
(function () {
  var apiBase = '';

  // 地图/UI 的 which 与数据库 ship_id 对应：A→DDG_114, B→T_AGS62, 山东舰→AC_SD17, 055→D055_101
  var whichToShipId = { 'A': 'DDG_114', 'B': 'T_AGS62', 'shandong': 'AC_SD17', '055': 'D055_101' };

  function escapeHtml(s) {
    if (s == null || s === '') return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  /** 内置回退数据（与 ship 表 ship_id 一致），API 不可用时使用 */
  var fallbackShips = {
    'DDG_114': {
      ship_id: 'DDG_114', name: 'USS Ralph Johnson (DDG-114)', hull_number: 'DDG-114',
      type: '阿利·伯克级 导弹驱逐舰 Flight IIA', commander: '美国第七舰队（United States Seventh Fleet）',
      displacement: '约 9,200 吨', length: '155.3', beam: '20.1', draft: '9.3', max_speed: '30+ 节',
      equipment: 'Mk41垂直发射系统（VLS）：32单元 + 64单元共96单元 1门 Mk45 Mod4型 127毫米 / 62倍径舰炮； 1座 “密集阵” 20毫米近防武器系统； 2座 Mk 38型 25毫米机炮；4挺 12.7毫米重机枪 2座三联装Mk 32鱼雷发射管，发射Mk 46/Mk 50/Mk 54轻型反潜鱼雷； 2座四联装“鱼叉”反舰导弹发射器 AN/SPY-1D 相控阵雷达 AN/SLQ-32（V）3 电子战系统',
      performance: '对陆精确打击、反潜战、反舰作战与电子战能力，可独立或协同编队遂行远洋作战任务; Baseline 9 系统可同时处理空中与弹道导弹目标，SM-6 兼具防空与反导能力，大幅提升多威胁应对效率; CEC 与 Link 16 数据链支持与航母、巡洋舰、战机实时共享目标数据，实现 “传感器 - 射手” 无缝衔接;',
      attachment: 'images/DDG114.png', lat: 24.8242, lon: 125.0264, dimensions: '长 155.3 m · 宽 20.1 m',
      events: []
    },
    'T_AGS62': {
      ship_id: 'T_AGS62', name: 'USNS Bowditch (T-AGS 62)', hull_number: 'T-AGS 62',
      type: '海洋测量船 · Survey Ship', commander: '美国军事海运司令部（Military Sealift Command，MSC）',
      displacement: '约 4,762 吨', length: '100.1', beam: '17.7', draft: null, max_speed: '约 16 节',
      equipment: '孔斯贝格 EM122 型，12kHz工作频率 边缘科技 4200 型 克努森 3260 型 重力仪、磁力仪、声学多普勒流速剖面仪',
      performance: '可探测海底浅层地质结构,同步采集海底重力异常、地磁数据及海流、盐度、温度等水文参数，覆盖宽度1.5公里,测深分辨率达1米',
      attachment: 'images/AGS62.png', lat: 24.0589, lon: 120.4333, dimensions: '长 ~100 m · 宽 ~18 m',
      events: []
    },
    'AC_SD17': {
      ship_id: 'AC_SD17', name: '山东舰', hull_number: '17', type: '002型航空母舰', commander: '',
      displacement: '约6.5–7万吨', length: '315', beam: '75', draft: '10', max_speed: '约30节',
      equipment: '红旗-10近程防空导弹 H/PJ-12型 11管30毫米近防炮,H/PJ-45型单管130毫米舰炮 鱼雷发射管 + 诱饵弹发射装置 24-32架 歼-15“飞鲨”重型舰载机 12-16架 直-18系列,直-9C直升机 346A型有源相控阵雷达',
      performance: '探测距离＞400 公里，多目标追踪；舰载机作战半径约 1,200 公里，无人机构建预警、反潜与后勤保障体系；双层舰桥设计，航空指挥室与航海指挥室分离，提升电磁兼容与调度效率；一体化作战管理系统，Link 16 数据链、卫星通信、协同交战终端，保障跨平台与编队实时协同',
      attachment: 'images/山东舰.png', lat: 26.2964, lon: 121.5464, dimensions: '长 约315m · 宽 约75m',
      events: []
    },
    'D055_101': {
      ship_id: 'D055_101', name: '055型驱逐舰（现"米利厄斯"号导弹驱逐舰）', hull_number: '', type: '第四代导弹驱逐舰', commander: '',
      displacement: '标准约11,000吨', length: '180', beam: '20', draft: '6.6', max_speed: '＞30节',
      equipment: '海红旗- B 远程防空导弹 鹰击-18A亚超结合反舰导弹;鹰击-21反舰弹道导弹 长剑-10巡航导弹 反潜助飞鱼雷 1门H/PJ-45 改进型单管130毫米舰炮 1座 H/PJ - 11 型 11管30毫米近防炮 1座24 联装红旗 - 10 近程防空导弹（射程 10 公里，拦截亚 / 超音速反舰导弹）；2 座三联装鱼雷发射管（发射鱼 - 7 反潜鱼雷） S/C 波段 346B 型远程预警雷达,新型舰载电子战系统,反潜声呐系统',
      performance: '112单元兼容冷热发射,兼具远程反舰、反潜、对陆打击与电子战能力，探测距离＞400 公里，多目标追踪 双机库 + 直升机甲板，可搭载 2 架直-18F反潜直升机或直-20 通用直升机，执行反潜、反舰、搜救与补给任务 支持舰载无人机、UUV 上舰，拓展态势感知与任务半径',
      attachment: 'images/055船.png', lat: 27.0319, lon: 124.0347, dimensions: '长 180m · 宽 20m',
      events: []
    }
  };

  function shipUrl(shipId) {
    var base = apiBase || '';
    var path = '/api/zhikong/ship/' + encodeURIComponent(shipId);
    return base ? (base.replace(/\/$/, '') + path) : path;
  }

  function shipOntologyGraphUrl(shipId) {
    var base = apiBase || '';
    var path = '/api/zhikong/ship/' + encodeURIComponent(shipId) + '/ontology-graph';
    return base ? (base.replace(/\/$/, '') + path) : path;
  }

  function resolveShipId(which) {
    return whichToShipId[which] || which;
  }

  /** 将后端返回的 { ship, events } 转为展示用对象 { ...ship, events } */
  function normalizeDetailResponse(data) {
    if (!data) return null;
    if (data.ship && typeof data.ship === 'object') {
      return { ...data.ship, events: Array.isArray(data.events) ? data.events : [] };
    }
    return data;
  }

  /** 舰艇图片展示路径：统一为 images/ 下四张图 DDG114.png / AGS62.png / 山东舰.png / 055船.png */
  var shipIdToImage = {
    'DDG_114': 'images/DDG114.png',
    'T_AGS62': 'images/AGS62.png',
    'AC_SD17': 'images/山东舰.png',
    'D055_101': 'images/055船.png'
  };
  function shipImageSrc(attachment, shipId) {
    if (shipId && shipIdToImage[shipId]) return shipIdToImage[shipId];
    if (!attachment || typeof attachment !== 'string') return '';
    var s = attachment.trim();
    if (s === 'DDG114.png' || s.endsWith('/DDG114.png')) return 'images/DDG114.png';
    if (s === 'AGS62.png' || s.endsWith('/AGS62.png')) return 'images/AGS62.png';
    if (s.indexOf('山东舰') >= 0 || s === '山东舰.png' || s.endsWith('/山东舰.png')) return 'images/山东舰.png';
    if (s === '055船.png' || s.endsWith('/055船.png') || s === 'DDG69.png' || s.endsWith('/DDG69.png')) return 'images/055船.png';
    if (s.indexOf('images/') === 0 || s.indexOf('/') >= 0 || s.indexOf('http') === 0) return s;
    return 'images/' + s;
  }

  // 最近一次加载的任务事件（按 event_id 索引），用于点击“任务履历”时展示详情
  var _lastShipEventsById = {};

  function rememberShipEvents(events) {
    _lastShipEventsById = {};
    if (!events || !events.length) return;
    events.forEach(function (ev) {
      if (ev && ev.event_id) _lastShipEventsById[String(ev.event_id)] = ev;
    });
  }

  function openShipEventDetail(eventId) {
    if (!eventId) return;
    var ev = _lastShipEventsById && _lastShipEventsById[String(eventId)];
    var modal = document.getElementById('shipEventModal');
    var titleEl = document.getElementById('ship-event-title');
    var bodyEl = document.getElementById('ship-event-body');
    if (!modal || !bodyEl) return;
    if (titleEl) titleEl.textContent = '任务事件详情';
    var html;
    if (!ev) {
      html = '<div style="color:#94a3b8;font-size:13px;">暂无该事件的详细信息。</div>';
    } else {
      function v(x) { return x != null && x !== '' ? escapeHtml(String(x)) : '—'; }
      html =
        '<div style="display:flex; flex-direction:column; gap:8px; font-size:13px; color:#e2e8f0;">' +
          '<div><span style="color:#94a3b8;">事件ID：</span>' + v(ev.event_id) + '</div>' +
          '<div><span style="color:#94a3b8;">事件类型：</span>' + v(ev.event_type) + '</div>' +
          '<div><span style="color:#94a3b8;">开始时间：</span>' + v(ev.start_time) + '</div>' +
          '<div><span style="color:#94a3b8;">结束时间：</span>' + v(ev.end_time) + '</div>' +
          '<div><span style="color:#94a3b8;">事件区域：</span>' + v(ev.event_area) + '</div>' +
          '<div><span style="color:#94a3b8;">航路概况：</span>' + v(ev.route_summary) + '</div>' +
          '<div><span style="color:#94a3b8;">平均航速：</span>' + v(ev.avg_speed) + '</div>' +
          '<div><span style="color:#94a3b8;">最大航速：</span>' + v(ev.max_speed) + '</div>' +
          '<div><span style="color:#94a3b8;">行为模式：</span>' + v(ev.behavior_pattern) + '</div>' +
          '<div><span style="color:#94a3b8;">异常评分：</span>' + v(ev.anomaly_score) + '</div>' +
        '</div>';
    }
    bodyEl.innerHTML = html;
    modal.style.display = 'block';
  }

  function attachShipEventClickHandlers(root) {
    if (!root || !root.querySelectorAll) return;
    var nodes = root.querySelectorAll('.ship-event-item[data-event-id]');
    if (!nodes || !nodes.length) return;
    Array.prototype.forEach.call(nodes, function (el) {
      el.style.cursor = 'pointer';
      el.onclick = function () {
        if (window._ontologyJustDragged) return;
        var id = el.getAttribute('data-event-id');
        if (id) openShipEventDetail(id);
      };
    });
  }

  window.closeShipEventModal = function () {
    var modal = document.getElementById('shipEventModal');
    if (modal) modal.style.display = 'none';
  };

  /** 用 ship 对象填充弹窗 shipDetailModal */
  function fillModalFromShip(ship) {
    if (!ship) return;
    var titleEl = document.getElementById('ship-detail-title');
    // 基本信息：ship_id, name, hull_number, type, flag_country, commander
    var shipIdEl = document.getElementById('ship-detail-ship-id');
    var nameEl = document.getElementById('ship-detail-name');
    var hullNumberEl = document.getElementById('ship-detail-hull-number');
    var typeEl = document.getElementById('ship-detail-type');
    var flagCountryEl = document.getElementById('ship-detail-flag-country');
    var commanderEl = document.getElementById('ship-detail-commander');
    // 技术参数：displacement, length, beam, draft, max_speed
    var displEl = document.getElementById('ship-detail-displ');
    var lengthEl = document.getElementById('ship-detail-length');
    var beamEl = document.getElementById('ship-detail-beam');
    var draftEl = document.getElementById('ship-detail-draft');
    var speedEl = document.getElementById('ship-detail-speed');
    var equipEl = document.getElementById('ship-detail-equip');
    var perfEl = document.getElementById('ship-detail-performance');
    var extraEl = document.getElementById('ship-detail-extra');
    var photoImg = document.getElementById('ship-detail-photo');
    if (titleEl) titleEl.textContent = (ship.hull_number || ship.name || ship.ship_id) || '舰艇详情';
    if (shipIdEl) shipIdEl.textContent = ship.ship_id || '—';
    if (nameEl) nameEl.textContent = ship.name || '—';
    if (hullNumberEl) hullNumberEl.textContent = ship.hull_number || '—';
    if (typeEl) typeEl.textContent = ship.type || '—';
    if (flagCountryEl) flagCountryEl.textContent = ship.flag_country || '—';
    if (commanderEl) commanderEl.textContent = ship.commander || '—';
    if (displEl) displEl.textContent = ship.displacement || '—';
    if (lengthEl) lengthEl.textContent = ship.length != null && ship.length !== '' ? ship.length + (String(ship.length).match(/m|米|吨/) ? '' : ' m') : '—';
    if (beamEl) beamEl.textContent = ship.beam != null && ship.beam !== '' ? ship.beam + (String(ship.beam).match(/m|米/) ? '' : ' m') : '—';
    if (draftEl) draftEl.textContent = ship.draft != null && ship.draft !== '' ? ship.draft + (String(ship.draft).match(/m|米/) ? '' : ' m') : '—';
    if (speedEl) speedEl.textContent = ship.max_speed || '—';
    if (equipEl) equipEl.textContent = ship.equipment || '—';
    if (perfEl) perfEl.innerHTML = ship.performance ? escapeHtml(ship.performance).replace(/\n/g, '<br/>') : '—';
    if (extraEl) {
      var events = ship.events && Array.isArray(ship.events) ? ship.events : [];
      if (events.length) {
        rememberShipEvents(events);
        extraEl.innerHTML = events.map(function (ev) {
          var eid = ev.event_id ? String(ev.event_id) : '';
          var timeRange = (ev.start_time || '—') + '-' + (ev.end_time || '—');
          var area = ev.event_area ? escapeHtml(ev.event_area) : '—';
          var pattern = ev.behavior_pattern ? escapeHtml(ev.behavior_pattern) : '—';
          return '<div class="ship-event-item" data-event-id="' + escapeHtml(eid) + '" style="margin:6px 0;padding:8px;background:rgba(30,41,59,0.6);border-radius:6px;font-size:12px;color:#cbd5e1;">' + escapeHtml(timeRange) + '  ' + area + '  ' + pattern + '</div>';
        }).join('');
        attachShipEventClickHandlers(extraEl);
      } else {
        extraEl.innerHTML = '<div style="margin:6px 0;padding:8px;background:rgba(30,41,59,0.6);border-radius:6px;font-size:12px;color:#94a3b8;">暂无任务履历</div>';
      }
    }
    var photoWrap = document.getElementById('ship-detail-photo-wrap');
    var imgSrc = shipImageSrc(ship.attachment, ship.ship_id);
    if (photoImg && imgSrc) { photoImg.src = imgSrc; photoImg.style.display = 'block'; if (photoWrap) photoWrap.style.display = 'block'; } else { if (photoImg) photoImg.style.display = 'none'; if (photoWrap) photoWrap.style.display = 'none'; }
  }

  var ONTOLOGY_LAYOUT_KEY_PREFIX = 'zhikong_ontology_graph_layout_';

  function getOntologyGraphLayout(shipId) {
    try {
      var raw = localStorage.getItem(ONTOLOGY_LAYOUT_KEY_PREFIX + (shipId || ''));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveOntologyGraphLayout(shipId, layout) {
    try {
      localStorage.setItem(ONTOLOGY_LAYOUT_KEY_PREFIX + (shipId || ''), JSON.stringify(layout));
    } catch (e) {}
  }

  /** 根据当前节点位置重绘本体图谱连线（含关系表标注）；拖动过程中会实时调用 */
  function updateOntologyGraphLines(wrap) {
    if (!wrap) return;
    var center = wrap.querySelector('.ontology-graph-center');
    var nodes = wrap.querySelectorAll('.ontology-graph-node');
    var cx = 50;
    var cy = 50;
    if (center) {
      var cxVal = parseFloat(center.getAttribute('data-x'));
      var cyVal = parseFloat(center.getAttribute('data-y'));
      if (!isNaN(cxVal)) cx = cxVal;
      if (!isNaN(cyVal)) cy = cyVal;
    }
    var parts = [];
    nodes.forEach(function (node) {
      var x = parseFloat(node.getAttribute('data-x'));
      var y = parseFloat(node.getAttribute('data-y'));
      if (isNaN(x) || isNaN(y)) return;
      var dir = node.classList.contains('ontology-node-out') ? 'out' : 'in';
      var linkTable = node.getAttribute('data-link-table') || '';
      var mx = (cx + x) / 2;
      var my = (cy + y) / 2;
      parts.push('<g class="ontology-line-group">');
      parts.push('<line class="ontology-line ontology-line-' + dir + '" x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/>');
      if (linkTable) {
        parts.push('<text class="ontology-line-label" x="' + mx + '" y="' + my + '" text-anchor="middle" dominant-baseline="middle">' + escapeHtml(linkTable) + '</text>');
      }
      parts.push('</g>');
    });
    var svg = wrap.querySelector('.ontology-graph-svg');
    if (svg) svg.innerHTML = parts.join('');
  }

  /** 绑定本体图谱节点拖动，并保存位置 */
  function setupOntologyGraphDrag(wrap, shipId) {
    if (!wrap || !shipId) return;
    var dragging = null;
    var startX = 0, startY = 0, startLeft = 0, startTop = 0;

    function pct(x) { return Math.max(0, Math.min(100, x)); }

    function onMouseDown(e) {
      var target = e.target.closest('.ontology-graph-center, .ontology-graph-node');
      if (!target || !wrap.contains(target)) return;
      e.preventDefault();
      var left = parseFloat(target.style.left) || parseFloat(target.getAttribute('data-x')) || 50;
      var top = parseFloat(target.style.top) || parseFloat(target.getAttribute('data-y')) || 50;
      dragging = target;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = left;
      startTop = top;
      target.classList.add('ontology-dragging');
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
      if (!dragging || !wrap.parentElement) return;
      var rect = wrap.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      var dx = (e.clientX - startX) / rect.width * 100;
      var dy = (e.clientY - startY) / rect.height * 100;
      var left = pct(startLeft + dx);
      var top = pct(startTop + dy);
      dragging.style.left = left + '%';
      dragging.style.top = top + '%';
      dragging.setAttribute('data-x', String(left));
      dragging.setAttribute('data-y', String(top));
      updateOntologyGraphLines(wrap);
    }

    function onMouseUp() {
      if (!dragging) return;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      dragging.classList.remove('ontology-dragging');
      window._ontologyJustDragged = true;
      setTimeout(function () { window._ontologyJustDragged = false; }, 200);
      updateOntologyGraphLines(wrap);
      var layout = { center: { x: 50, y: 50 }, nodes: {} };
      var centerEl = wrap.querySelector('.ontology-graph-center');
      if (centerEl) {
        layout.center = {
          x: pct(parseFloat(centerEl.getAttribute('data-x')) || 50),
          y: pct(parseFloat(centerEl.getAttribute('data-y')) || 50)
        };
      }
      wrap.querySelectorAll('.ontology-graph-node').forEach(function (node) {
        var id = node.getAttribute('data-node-id');
        if (id) layout.nodes[id] = { x: pct(parseFloat(node.getAttribute('data-x')) || 0), y: pct(parseFloat(node.getAttribute('data-y')) || 0) };
      });
      saveOntologyGraphLayout(shipId, layout);
      dragging = null;
    }

    wrap.addEventListener('mousedown', onMouseDown, false);
  }

  /** 渲染本体图谱 HTML：连线形式，中心船舰，入项/出项用线连接；节点可拖动，位置按 ship_id 持久化 */
  function renderOntologyGraphHtml(ship, graph) {
    var events = (graph && graph.events) ? graph.events : (ship.events || []);
    var documents = (graph && graph.documents) ? graph.documents : [];
    var routeRecords = (graph && graph.route_records) ? graph.route_records : [];
    var battleExamples = (graph && graph.battle_examples) ? graph.battle_examples : [];
    var cx = 50;
    var cy = 50;
    var inX = 12;
    var outX = 88;
    var inNodes = [];
    var outNodes = [];
    events.forEach(function (ev) {
      var eid = ev.event_id ? String(ev.event_id) : '';
      inNodes.push({ type: '事件', typeClass: 'ontology-node-in-event', label: (ev.event_type || '') + (ev.event_area ? ' · ' + ev.event_area : ''), id: eid, nodeId: 'ev:' + eid, eventId: eid, linkTable: 'link_event_ship' });
    });
    documents.forEach(function (d) {
      var did = d.doc_id || '';
      inNodes.push({ type: '文书', typeClass: 'ontology-node-in-doc', label: (d.title || d.doc_id || '—') + (d.source_type ? ' (' + d.source_type + ')' : ''), id: did, nodeId: 'doc:' + did, linkTable: 'link_doc_ship' });
    });
    battleExamples.forEach(function (b) {
      var bid = b.bat_id || '';
      inNodes.push({ type: '战例', typeClass: 'ontology-node-in-bat', label: (b.bat_title || b.bat_id || '—') + (b.event_type ? ' · ' + b.event_type : ''), id: bid, nodeId: 'bat:' + bid, linkTable: 'battle_examples' });
    });
    routeRecords.forEach(function (r) {
      var rid = r.route_record_id || '';
      outNodes.push({ type: '航迹记录', typeClass: 'ontology-node-out', label: (r.route_record_id || '—') + (r.last_time ? ' ' + r.last_time : ''), id: rid, nodeId: 'route:' + rid, linkTable: 'link_ship_route_record' });
    });
    function distributeY(n, fromPct, toPct) {
      var out = [];
      for (var i = 0; i < n; i++) out.push(fromPct + (toPct - fromPct) * (n === 1 ? 0.5 : i / (n - 1)));
      return out;
    }
    var inY = distributeY(inNodes.length, 15, 85);
    var outY = distributeY(outNodes.length, 20, 80);
    inNodes.forEach(function (n, i) { n.x = inX; n.y = inY[i]; });
    outNodes.forEach(function (n, i) { n.y = outY[i]; n.x = outX; });

    var saved = getOntologyGraphLayout(ship.ship_id);
    if (saved && saved.center) { cx = saved.center.x; cy = saved.center.y; }
    inNodes.forEach(function (n) { if (saved && saved.nodes && saved.nodes[n.nodeId]) { n.x = saved.nodes[n.nodeId].x; n.y = saved.nodes[n.nodeId].y; } });
    outNodes.forEach(function (n) { if (saved && saved.nodes && saved.nodes[n.nodeId]) { n.x = saved.nodes[n.nodeId].x; n.y = saved.nodes[n.nodeId].y; } });

    var lines = [];
    inNodes.forEach(function (n) { lines.push({ x1: cx, y1: cy, x2: n.x, y2: n.y, dir: 'in' }); });
    outNodes.forEach(function (n) { lines.push({ x1: cx, y1: cy, x2: n.x, y2: n.y, dir: 'out' }); });
    var svgLines = lines.map(function (l) {
      return '<line class="ontology-line ontology-line-' + l.dir + '" x1="' + l.x1 + '" y1="' + l.y1 + '" x2="' + l.x2 + '" y2="' + l.y2 + '"/>';
    }).join('');

    var centerNode = '<div class="ontology-graph-center ontology-draggable-node" data-node-id="center" data-x="' + cx + '" data-y="' + cy + '" style="left:' + cx + '%;top:' + cy + '%;transform:translate(-50%,-50%);">' +
      '<div class="ontology-node ontology-node-ship" title="' + escapeHtml(ship.ship_id || '') + '">' +
      '<span class="ontology-node-type">船舰</span>' +
      '<span class="ontology-node-label">' + escapeHtml(ship.name || ship.ship_id || '—') + '</span>' +
      '<span class="ontology-node-id">' + escapeHtml(ship.ship_id || '') + '</span></div></div>';
    var inNodesHtmlFixed = inNodes.map(function (n) {
      var attr = n.eventId ? ' class="ontology-graph-node ontology-node-periph ' + n.typeClass + ' ship-event-item ontology-draggable-node" data-event-id="' + escapeHtml(n.eventId) + '" data-node-id="' + escapeHtml(n.nodeId) + '" data-link-table="' + escapeHtml(n.linkTable || '') + '" data-x="' + n.x + '" data-y="' + n.y + '"' : ' class="ontology-graph-node ontology-node-periph ' + n.typeClass + ' ontology-draggable-node" data-node-id="' + escapeHtml(n.nodeId) + '" data-link-table="' + escapeHtml(n.linkTable || '') + '" data-x="' + n.x + '" data-y="' + n.y + '"';
      return '<div' + attr + ' style="left:' + n.x + '%;top:' + n.y + '%;transform:translate(-50%,-50%);" title="' + escapeHtml(n.label) + '">' +
        '<span class="ontology-periph-type">' + escapeHtml(n.type) + '</span>' +
        '<span class="ontology-periph-label">' + escapeHtml(n.label.length > 18 ? n.label.slice(0, 18) + '…' : n.label) + '</span></div>';
    }).join('');
    var outNodesHtml = outNodes.map(function (n) {
      return '<div class="ontology-graph-node ontology-node-periph ' + n.typeClass + ' ontology-draggable-node" data-node-id="' + escapeHtml(n.nodeId) + '" data-link-table="' + escapeHtml(n.linkTable || '') + '" data-x="' + n.x + '" data-y="' + n.y + '" style="left:' + n.x + '%;top:' + n.y + '%;transform:translate(-50%,-50%);" title="' + escapeHtml(n.label) + '">' +
        '<span class="ontology-periph-type">' + escapeHtml(n.type) + '</span>' +
        '<span class="ontology-periph-label">' + escapeHtml(n.label.length > 18 ? n.label.slice(0, 18) + '…' : n.label) + '</span></div>';
    }).join('');
    return (
      '<div class="ontology-graph-block ontology-graph-with-lines">' +
        '<div class="ontology-graph-title">本体图谱 <span class="ontology-graph-hint">（可拖动节点调整位置，自动保存）</span></div>' +
        '<div class="ontology-graph-svg-wrap" data-ontology-ship-id="' + escapeHtml(ship.ship_id || '') + '">' +
          '<svg class="ontology-graph-svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + svgLines + '</svg>' +
          centerNode +
          inNodesHtmlFixed +
          outNodesHtml +
        '</div>' +
      '</div>'
    );
  }

  /** 用 ship 对象填充右侧详情页 shipDetailPage（含本体图谱，不再含当前位置小地图） */
  function fillPageFromShip(ship, graph) {
    if (!ship) return;
    var titleEl = document.getElementById('ship-page-title');
    var bodyEl = document.getElementById('ship-page-body');
    if (!titleEl || !bodyEl) return;
    titleEl.textContent = ship.name || '舰艇详情';
    var events = (graph && graph.events) ? graph.events : (ship.events && Array.isArray(ship.events) ? ship.events : []);
    rememberShipEvents(events);
    bodyEl.innerHTML =
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">' +
        '<div>' +
          '<div style="margin-bottom:8px;color:#60a5fa;font-weight:bold;">基本信息</div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">舰艇ID</span><span class="uav-spec-val">' + escapeHtml(ship.ship_id || '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">名称</span><span class="uav-spec-val">' + escapeHtml(ship.name || '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">舷号</span><span class="uav-spec-val">' + escapeHtml(ship.hull_number || '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">类型</span><span class="uav-spec-val">' + escapeHtml(ship.type || '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">国籍</span><span class="uav-spec-val">' + escapeHtml(ship.flag_country || '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">指挥官</span><span class="uav-spec-val">' + escapeHtml(ship.commander || '—') + '</span></div>' +
          '<div style="margin:12px 0 8px;color:#60a5fa;font-weight:bold;">技术参数</div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">排水量</span><span class="uav-spec-val">' + escapeHtml(ship.displacement || '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">长</span><span class="uav-spec-val">' + (ship.length != null && ship.length !== '' ? escapeHtml(String(ship.length).match(/m|米/) ? ship.length : ship.length + ' m') : '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">宽</span><span class="uav-spec-val">' + (ship.beam != null && ship.beam !== '' ? escapeHtml(String(ship.beam).match(/m|米/) ? ship.beam : ship.beam + ' m') : '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">吃水</span><span class="uav-spec-val">' + (ship.draft != null && ship.draft !== '' ? escapeHtml(String(ship.draft).match(/m|米/) ? ship.draft : ship.draft + ' m') : '—') + '</span></div>' +
          '<div class="uav-spec-row"><span class="uav-spec-label">最高航速</span><span class="uav-spec-val">' + escapeHtml(ship.max_speed || '—') + '</span></div>' +
          '<div style="margin:12px 0 8px;color:#60a5fa;font-weight:bold;">舰艇照片</div>' +
          (shipImageSrc(ship.attachment, ship.ship_id) ? '<div style="margin-top:4px;"><img src="' + escapeHtml(shipImageSrc(ship.attachment, ship.ship_id)) + '" alt="舰艇照片" style="max-width:100%; border:1px solid #475569; border-radius:6px;" onerror="this.style.display=\'none\'"></div>' : '<div style="color:#94a3b8;font-size:12px;">暂无图片</div>') +
        '</div>' +
        '<div>' +
          (ship.equipment ? '<div style="margin-bottom:12px;color:#60a5fa;font-weight:bold;">船舰设备</div><div>' + escapeHtml(ship.equipment) + '</div>' : '') +
          (ship.performance ? '<div style="margin:12px 0;color:#60a5fa;font-weight:bold;">性能表现</div><div>' + escapeHtml(ship.performance) + '</div>' : '') +
          '<div style="margin:12px 0;color:#60a5fa;font-weight:bold;">任务履历</div>' +
          (events && events.length ? events.map(function (ev) {
            var eid = ev.event_id ? String(ev.event_id) : '';
            var timeRange = (ev.start_time || '—') + '-' + (ev.end_time || '—');
            var area = ev.event_area ? escapeHtml(ev.event_area) : '—';
            var pattern = ev.behavior_pattern ? escapeHtml(ev.behavior_pattern) : '—';
            return '<div class="ship-event-item" data-event-id="' + escapeHtml(eid) + '" style="margin:6px 0;padding:8px;background:rgba(30,41,59,0.6);border-radius:6px;font-size:12px;color:#cbd5e1;">' + escapeHtml(timeRange) + '  ' + area + '  ' + pattern + '</div>';
          }).join('') : '<div style="margin:6px 0;padding:8px;background:rgba(30,41,59,0.6);border-radius:6px;font-size:12px;color:#94a3b8;">暂无任务履历</div>') +
          renderOntologyGraphHtml(ship, graph) +
        '</div>' +
      '</div>';
    attachShipEventClickHandlers(bodyEl);
    var ontologyWrap = bodyEl.querySelector('.ontology-graph-svg-wrap');
    if (ontologyWrap) {
      updateOntologyGraphLines(ontologyWrap);
      if (ship.ship_id) setupOntologyGraphDrag(ontologyWrap, ship.ship_id);
    }
  }

  function showModal() {
    var modal = document.getElementById('shipDetailModal');
    var overlay = document.getElementById('overlay-ship');
    if (modal) {
      modal.style.display = 'flex';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.right = '0';
      modal.style.bottom = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.maxWidth = 'none';
      modal.style.maxHeight = 'none';
      modal.style.transform = 'none';
      modal.style.borderRadius = '0';
    }
    if (overlay) overlay.style.display = 'block';
  }

  function showPage() {
    var page = document.getElementById('shipDetailPage');
    if (page) page.style.display = 'flex';
  }

  /** 请求船舰详情接口并显示弹窗；API 返回 { ship, events }，前端仅用该数据展示 */
  function loadAndShowModal(which) {
    var shipId = resolveShipId(which);
    fetch(shipUrl(shipId))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
      .then(function (data) {
        var ship = normalizeDetailResponse(data);
        if (ship) {
          fillModalFromShip(ship);
          showModal();
        }
      })
      .catch(function () {
        if (fallbackShips[shipId]) {
          fillModalFromShip(fallbackShips[shipId]);
          showModal();
        }
      });
  }

  /** 请求船舰详情接口并显示右侧详情页；同时请求本体图谱接口，用「本体图谱」替代原「当前位置」 */
  function loadAndShowPage(which) {
    var shipId = resolveShipId(which);
    var fallback = fallbackShips[shipId];
    fetch(shipOntologyGraphUrl(shipId))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
      .then(function (graph) {
        var ship = graph.ship ? { ...graph.ship, events: graph.events } : null;
        if (ship) {
          fillPageFromShip(ship, graph);
          showPage();
        } else if (fallback) {
          fillPageFromShip(fallback, { ship: fallback, events: fallback.events || [], documents: [], route_records: [], battle_examples: [] });
          showPage();
        }
      })
      .catch(function () {
        fetch(shipUrl(shipId))
          .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
          .then(function (data) {
            var ship = normalizeDetailResponse(data);
            if (ship) {
              fillPageFromShip(ship, { ship: ship, events: ship.events || [], documents: [], route_records: [], battle_examples: [] });
              showPage();
            } else if (fallback) {
              fillPageFromShip(fallback, { ship: fallback, events: fallback.events || [], documents: [], route_records: [], battle_examples: [] });
              showPage();
            }
          })
          .catch(function () {
            if (fallback) {
              fillPageFromShip(fallback, { ship: fallback, events: fallback.events || [], documents: [], route_records: [], battle_examples: [] });
              showPage();
            }
          });
      });
  }

  window.ShipDetail = {
    setApiBase: function (base) { apiBase = base || ''; },
    fillModalFromShip: fillModalFromShip,
    fillPageFromShip: fillPageFromShip,
    loadAndShowModal: loadAndShowModal,
    loadAndShowPage: loadAndShowPage,
    getFallbackShip: function (which) { return fallbackShips[resolveShipId(which)] || null; },
  };
})();
