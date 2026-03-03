/**
 * 无人机蜂群战术系统 - 模拟数据
 * 编队：每个地图 icon 代表 5–10 架无人机，点击可查看编队与机型详情
 */
(function(global) {
  'use strict';

  var TYPE_LABELS = { scout: '侦察型', attack: '攻击型', relay: '中继型', transport: '运输型' };
  var MODELS = { scout: 'CH-5 侦察型', attack: 'Wing Loong II 攻击型', relay: 'FH-901 中继型', transport: 'Y-5 运输型' };

  const DRONES = [
    { id: 'UAV-A1', name: '侦察蜂-A1', type: 'scout', model: 'CH-5 侦察型', status: 'mission', battery: 72, altitude: 1200, speed: 185, signal: 95, lat: 25.32, lng: 119.85, missionId: 'M001' },
    { id: 'UAV-A2', name: '攻击蜂-A2', type: 'attack', model: 'Wing Loong II 攻击型', status: 'mission', battery: 65, altitude: 980, speed: 170, signal: 88, lat: 25.44, lng: 119.98, missionId: 'M001' },
    { id: 'UAV-A3', name: '侦察蜂-A3', type: 'scout', model: 'CH-5 侦察型', status: 'mission', battery: 80, altitude: 1500, speed: 195, signal: 92, lat: 25.58, lng: 120.14, missionId: 'M001' },
    { id: 'UAV-A4', name: '中继蜂-A4', type: 'relay', model: 'FH-901 中继型', status: 'mission', battery: 55, altitude: 3200, speed: 145, signal: 78, lat: 25.22, lng: 119.75, missionId: 'M001' },
    { id: 'UAV-A5', name: '侦察蜂-A5', type: 'scout', model: 'CH-5 侦察型', status: 'mission', battery: 68, altitude: 1100, speed: 180, signal: 90, lat: 25.38, lng: 119.92, missionId: 'M001' },
    { id: 'UAV-A6', name: '攻击蜂-A6', type: 'attack', model: 'Wing Loong II 攻击型', status: 'mission', battery: 70, altitude: 950, speed: 175, signal: 86, lat: 25.50, lng: 120.05, missionId: 'M001' },
    { id: 'UAV-A7', name: '侦察蜂-A7', type: 'scout', model: 'CH-5 侦察型', status: 'mission', battery: 75, altitude: 1400, speed: 190, signal: 93, lat: 25.42, lng: 119.88, missionId: 'M001' },
    // 猎鹰编队：6 架楔形编队向目标航行（间距加大），沿 M002 任务路径附近（可见光/热红外分别用 images 下对应图片）
    { id: 'UAV-B1', name: '侦察蜂-B1', type: 'scout', model: 'CH-5 侦察型', status: 'mission', battery: 88, altitude: 800, speed: 210, signal: 96, lat: 23.662, lng: 120.068, missionId: 'M002', visibleImg: 'images/可见光.png', thermalImg: 'images/热红外.png' },
    { id: 'UAV-B2', name: '攻击蜂-B2', type: 'attack', model: 'Wing Loong II 攻击型', status: 'mission', battery: 42, altitude: 850, speed: 220, signal: 85, lat: 23.672, lng: 120.038, missionId: 'M002', visibleImg: 'images/可见光2.png', thermalImg: 'images/热红外2.png' },
    { id: 'UAV-B3', name: '运输蜂-B3', type: 'transport', model: 'Y-5 运输型', status: 'mission', battery: 33, altitude: 650, speed: 120, signal: 72, lat: 23.674, lng: 120.078, missionId: 'M002', visibleImg: 'images/可见光3.png', thermalImg: 'images/热红外3.png' },
    { id: 'UAV-B4', name: '攻击蜂-B4', type: 'attack', model: 'Wing Loong II 攻击型', status: 'mission', battery: 58, altitude: 820, speed: 205, signal: 88, lat: 23.692, lng: 120.022, missionId: 'M002', visibleImg: 'images/可见光.png', thermalImg: 'images/热红外.png' },
    { id: 'UAV-B5', name: '侦察蜂-B5', type: 'scout', model: 'CH-5 侦察型', status: 'mission', battery: 82, altitude: 780, speed: 198, signal: 94, lat: 23.688, lng: 120.058, missionId: 'M002', visibleImg: 'images/可见光2.png', thermalImg: 'images/热红外2.png' },
    { id: 'UAV-B6', name: '中继蜂-B6', type: 'relay', model: 'FH-901 中继型', status: 'mission', battery: 90, altitude: 3000, speed: 140, signal: 92, lat: 23.686, lng: 120.092, missionId: 'M002', visibleImg: 'images/可见光3.png', thermalImg: 'images/热红外3.png' },
    { id: 'UAV-C1', name: '备用蜂-C1', type: 'scout', model: 'CH-5 侦察型', status: 'available', battery: 100, altitude: 0, speed: 0, signal: 100, lat: 26.04, lng: 119.27 },
    { id: 'UAV-C2', name: '备用蜂-C2', type: 'attack', model: 'Wing Loong II 攻击型', status: 'available', battery: 98, altitude: 0, speed: 0, signal: 100, lat: 26.06, lng: 119.29 },
    { id: 'UAV-C3', name: '备用蜂-C3', type: 'relay', model: 'FH-901 中继型', status: 'available', battery: 95, altitude: 0, speed: 0, signal: 100, lat: 26.08, lng: 119.25 },
    { id: 'UAV-C4', name: '备用蜂-C4', type: 'scout', model: 'CH-5 侦察型', status: 'available', battery: 100, altitude: 0, speed: 0, signal: 100, lat: 26.03, lng: 119.26 },
    { id: 'UAV-C5', name: '备用蜂-C5', type: 'attack', model: 'Wing Loong II 攻击型', status: 'available', battery: 97, altitude: 0, speed: 0, signal: 100, lat: 26.05, lng: 119.28 },
    { id: 'UAV-C6', name: '备用蜂-C6', type: 'scout', model: 'CH-5 侦察型', status: 'available', battery: 99, altitude: 0, speed: 0, signal: 100, lat: 26.07, lng: 119.24 },
    { id: 'UAV-D1', name: '故障蜂-D1', type: 'scout', model: 'CH-5 侦察型', status: 'unavailable', battery: 0, altitude: 0, speed: 0, signal: 0, lat: 26.10, lng: 119.22 },
    { id: 'UAV-D2', name: '维修蜂-D2', type: 'attack', model: 'Wing Loong II 攻击型', status: 'unavailable', battery: 12, altitude: 0, speed: 0, signal: 20, lat: 26.11, lng: 119.20 },
    { id: 'UAV-D3', name: '故障蜂-D3', type: 'relay', model: 'FH-901 中继型', status: 'unavailable', battery: 5, altitude: 0, speed: 0, signal: 10, lat: 26.09, lng: 119.21 },
    { id: 'UAV-D4', name: '维修蜂-D4', type: 'scout', model: 'CH-5 侦察型', status: 'unavailable', battery: 18, altitude: 0, speed: 0, signal: 25, lat: 26.12, lng: 119.19 },
  ];

  // 编队：每个地图 icon 代表 5–10 架，位置为编队中心
  const FORMATIONS = [
    { id: 'FORM-A', name: '金鹰编队', label: 'α', status: 'mission', missionId: 'M001', droneIds: ['UAV-A1','UAV-A2','UAV-A3','UAV-A4','UAV-A5','UAV-A6','UAV-A7'], lat: 25.42, lng: 119.96 },
    { id: 'FORM-B', name: '猎鹰编队', label: 'β', status: 'mission', missionId: 'M002', droneIds: ['UAV-B1','UAV-B2','UAV-B3','UAV-B4','UAV-B5','UAV-B6'], lat: 23.679, lng: 120.058 },
    { id: 'FORM-C', name: '哨兵编队', label: 'γ', status: 'available', droneIds: ['UAV-C1','UAV-C2','UAV-C3','UAV-C4','UAV-C5','UAV-C6'], lat: 26.055, lng: 119.265 },
    { id: 'FORM-D', name: '雷霆编队', label: 'δ', status: 'unavailable', droneIds: ['UAV-D1','UAV-D2','UAV-D3','UAV-D4'], lat: 26.105, lng: 119.205 },
  ];

  const MISSIONS = [
    { id: 'M001', name: '金鹰-前沿侦察', status: 'active', priority: 'high', droneIds: ['UAV-A1','UAV-A2','UAV-A3','UAV-A4','UAV-A5','UAV-A6','UAV-A7'], targetLat: 24.85, targetLng: 120.55, startTime: '08:15', duration: '2h 30m', description: '台湾海峡北线前沿侦察', waypoints: [{ lat: 26.05, lng: 119.30, label: 'BASE-α' }, { lat: 25.72, lng: 119.68, label: 'WP1' }, { lat: 25.28, lng: 120.08, label: 'WP2' }, { lat: 24.85, lng: 120.55, label: 'TGT' }], progress: 68, color: '#ef4444', background: '敌方在台湾北部新部署移动式防空系统及前沿指挥节点，己方须在48小时内获取该区域完整防御布势情报，为后续精确打击提供支撑。当前台湾海峡北段电磁环境复杂，对方具备一定反无人机干扰能力。', targetDescription: '台海北线目标区（N24°51′ E120°33′），位于台湾北部海岸线外侧约20海里，敌已设置多层防空预警阵地。', objectives: ['精确标定敌防空雷达阵地坐标（精度≤10m）', '获取前沿指挥节点高清影像', '确认敌兵力部署及巡逻规律', '评估目标区电磁环境及干扰强度', '安全撤离，保留蜂群80%完好率'] },
    { id: 'M002', name: '猎鹰-突防侦察', status: 'active', priority: 'high', droneIds: ['UAV-B1','UAV-B2','UAV-B3','UAV-B4','UAV-B5','UAV-B6'], targetLat: 23.6179, targetLng: 120.1413, startTime: '09:00', duration: '1h 45m', description: '台湾海峡南线登陆作战前线侦察', waypoints: [{ lat: 24.44, lng: 118.12, label: 'BASE-β' }, { lat: 24.12, lng: 118.92, label: 'WP1' }, { lat: 23.85, lng: 119.78, label: 'WP2' }, { lat: 23.6179, lng: 120.1413, label: 'TGT' }], progress: 42, color: '#dc2626', background: '基于M001侦察结果，确认南线目标区存在移动式导弹发射装置（TEL×2），对我后勤补给线构成直接威胁。情报显示目标预计2小时内完成转移，打击窗口极为紧迫。', targetDescription: '南线移动导弹阵地（N23°37′04.43″ E120°08′28.67″），目标位于中央山脉西侧平原，周边配有自卫高炮，预计2小时内撤收转移。', objectives: ['摧毁移动式导弹发射车（TEL）×2（主要目标）', '压制敌防空自卫高炮系统', '打击弹药补给车辆及雷达设备', '阻止目标完成撤收转移', '实施打击效果确认，摧毁率≥85%'] },
    { id: 'M003', name: '哨兵-边界警戒', status: 'pending', priority: 'medium', droneIds: [], targetLat: 25.80, targetLng: 120.00, startTime: '11:30', duration: '3h 00m', description: '台湾海峡北段持续监视巡逻', waypoints: [], progress: 0, color: '#f59e0b', background: '北线进入对峙阶段，敌方可能利用夜间通道进行装备和兵力的隐蔽调动。需在M001和M002完成后立即转入持续警戒，掌握敌方动向并及时预警。', targetDescription: '台湾海峡北段监视区（N25°48′ E120°00′），全长约120海里，含3个关键海上通道节点。', objectives: ['对北段海峡实施不间断全覆盖监视（≥95%覆盖率）', '识别并追踪敌方舰艇及大型装备运动', '在关键节点建立电子情报收集网络', '发现敌方规模性集结立即上报预警', '维持蜂群轮换机制确保连续覆盖'] },
    { id: 'M004', name: '隐刃-纵深渗透', status: 'completed', priority: 'high', droneIds: [], targetLat: 25.05, targetLng: 121.52, startTime: '02:30', endTime: '05:45', duration: '3h 15m', description: '台湾北部纵深目标夜间渗透侦察', waypoints: [], progress: 100, color: '#22c55e', background: '为获取台湾北部防空纵深情报，组织精锐蜂群利用夜间低光照环境实施渗透侦察。任务已于今日凌晨圆满完成，零损失。', targetDescription: '台湾北部纵深目标区（N25°03′ E121°31′），距海峡中线约80海里。', objectives: ['✓ 精确标定3处防空阵地坐标（精度8m）', '✓ 获取雷达型号及部署信息', '✓ 确认补给路线及储存点位置', '✓ 评估敌防空覆盖范围', '✓ 蜂群全部安全返回，零损失'] },
    { id: 'M005', name: '雷霆-火力压制', status: 'completed', priority: 'high', droneIds: [], targetLat: 24.18, targetLng: 120.30, startTime: '06:00', endTime: '07:30', duration: '1h 30m', description: '中线海峡敌防空节点精确压制', waypoints: [], progress: 100, color: '#22c55e', background: '对台湾海峡中线敌前沿防空节点实施饱和式打击，压制敌重火力支撑点。任务顺利完成，综合压制效果达92%。', targetDescription: '海峡中线防空节点群（N24°10′ E120°18′），含雷达站及配套防空阵地。', objectives: ['✓ 压制并摧毁敌防空雷达站×4（完成率100%）', '✓ 摧毁敌前沿指挥所（完成）', '✓ 开辟后续作战窗口（超额完成）', '✓ 综合压制效果评估达92%，满足要求', '△ 1架无人机被小口径高炮击中，任务前安全撤离'] },
  ];

  // 战例库：历史经典、重要战例
  const BATTLE_CASES = [
    { id: 'BC001', name: '纳卡冲突蜂群突防', year: '2020', region: '纳戈尔诺-卡拉巴赫', tag: '经典', summary: '阿塞拜疆运用土耳其TB2等无人机蜂群，对亚美尼亚防空阵地及装甲单位实施多波次精确打击，开创无人机蜂群成体系运用的先河。', lessons: ['无人机蜂群可有效压制传统防空体系', '低成本巡飞弹与察打一体机协同效果显著', '电磁静默与分散突防是生存关键'] },
    { id: 'BC002', name: '俄乌战场无人机侦察', year: '2022', region: '乌克兰', tag: '重要', summary: '双方广泛使用小型无人机实施前沿侦察、炮火校射与毁伤评估，无人机成为战场态势感知的核心手段。', lessons: ['单兵无人机可大幅提升炮兵效率', '反无人机成为新兴作战需求', '低成本消耗型无人机战术价值凸显'] },
    { id: 'BC003', name: '沙特炼油厂遭袭', year: '2019', region: '沙特阿拉伯', tag: '经典', summary: '胡塞武装使用无人机与巡航导弹混合编队，突破多层防空对沙特重要能源设施实施打击，引发对非对称威胁的重新认识。', lessons: ['低空慢速目标防御难度大', '多轴同时饱和攻击可瘫痪防空', '关键设施需分层立体防护'] },
    { id: 'BC004', name: '利比亚无人机空战', year: '2020', region: '利比亚', tag: '重要', summary: '全球首次无人机空战实录，TB2与无人战斗机参与对地打击与空战，展现无人机作战样式多元化。', lessons: ['无人机空战从概念走向实战', '无人-有人协同成为新范式', '战场透明化加剧生存压力'] },
  ];

  const TACTICS = [
    { id: 'T001', name: '穿透式前沿侦察', shortDesc: '深入纵深，突破防空，获取前沿战场实时情报', color: '#f59e0b', icon: '◎', overview: '蜂群无人机利用数量优势与低可探测性，深入敌方防御纵深，对前沿阵地、指挥中枢及重要目标实施高精度侦察。采用分散突防与集群饱和策略，即使部分单元被拦截，仍可确保整体侦察任务顺利完成。', phases: [{ step: '渗透突防', desc: '多架无人机分散编队，低空高速穿越敌方防空识别区，利用地形遮蔽与电磁静默降低被雷达截获概率。' }, { step: '目标搜索', desc: '到达指定区域后展开扇形搜索队形，多角度、多波段同步获取目标情报，互为补充。' }, { step: '数据回传', desc: '通过中继无人机建立稳定加密数据链，实时回传侦察数据，优先推送高价值目标信息。' }, { step: '撤离规避', desc: '任务完成后分批分散撤离，采用欺骗航线消耗敌防空拦截资源，降低己方损失。' }], advantages: ['深入纵深，覆盖常规侦察的信息盲区', '集群数量优势有效降低被全部拦截的风险', '多机协同实现多维度全方位情报获取', '低成本执行高风险任务，避免人员伤亡'], scenarios: '适用于敌方防御纵深内高价值目标侦察，尤其是交战初期快速获取战场布势情报，以及对方防空较强但难以用传统手段侦察的高风险目标区域。' },
    { id: 'T002', name: '伴随侦察/诱饵', shortDesc: '诱骗牵制与隐蔽侦察协同，掩护真实任务执行', color: '#f59e0b', icon: '◈', overview: '将蜂群分为侦察组与诱饵组，诱饵无人机主动暴露、吸引敌方防空注意力与火力拦截，为侦察组创造低干扰突防窗口。诱饵机可搭载电子干扰设备，进一步扰乱敌传感器系统。', phases: [{ step: '任务分配', desc: '将蜂群按约3:7比例分为侦察组和诱饵组，侦察组携带高分辨率传感器，诱饵组携带电子干扰模块。' }, { step: '诱饵先行', desc: '诱饵组提前进入并主动制造显著雷达特征，吸引敌防空雷达锁定和导弹拦截，消耗敌防空资源。' }, { step: '侦察跟进', desc: '趁敌防空资源被诱饵牵制，侦察组从意外方向低空突入目标区域，快速完成情报采集。' }, { step: '协同撤离', desc: '侦察完成后两组协同撤离，诱饵组持续干扰掩护，侦察组优先安全脱离。' }], advantages: ['大幅提高侦察无人机的战场生存率', '消耗敌方防空弹药资源，削弱防空能力', '同步收集敌防空系统响应模式与电磁特征', '任务灵活可扩展，诱饵/侦察比例按需调整'], scenarios: '适用于敌方防空体系较为完善的高风险目标区域侦察，以及需要对高价值侦察目标提供行动保护的场景。' },
    { id: 'T003', name: '多波次"侦察—压制—再侦察"', shortDesc: '侦打评估闭环迭代，确保目标精准高效摧毁', color: '#f59e0b', icon: '⟳', overview: '按序组织多个专一职责的作战波次：首轮侦察精确标定目标，随后攻击波次对敌防空节点与关键目标实施精确打击，再侦察波次验证打击效果，形成完整作战闭环，按需循环迭代直至目标彻底摧毁。', phases: [{ step: '第一波·侦察', desc: '侦察蜂群进入目标区域，精确标定敌防空阵地、指挥节点及高价值目标，建立实时目标数据库。' }, { step: '第二波·压制', desc: '攻击蜂群依据侦察数据对确认目标实施精确打击，优先摧毁敌防空与指挥系统。' }, { step: '第三波·再侦察', desc: '新批侦察蜂群进入打击区域，对目标损毁情况进行全面评估，标定残余威胁。' }, { step: '循环迭代', desc: '依据再侦察结果决策是否补充打击波次，直至所有作战目标全部达成，实现动态闭环作战。' }], advantages: ['构建完整作战闭环，打击效果可精确核实', '各波次功能专一，整体协同效率最优', '实时战场态势更新，支持快速迭代决策', '避免重复打击浪费，精确分配作战资源'], scenarios: '适用于具有明确防御体系的目标区域，以及需要确保高摧毁率的重要目标打击任务，尤其适合敌方纵深关键节点的逐层清除作战。' },
    { id: 'T004', name: '战场持续监视与战果评估', shortDesc: '全时不间断覆盖监视，实时战损评估，持续态势感知', color: '#f59e0b', icon: '◉', overview: '通过建立无人机蜂群轮换接替机制，对关键目标区域实施不间断监视，同步对己方作战效果进行实时量化评估，为指挥层提供连续、准确的战场态势图，支撑全程动态作战决策。', phases: [{ step: '初始部署', desc: '部署首批监视蜂群，建立初始情报网络，确定关键观测节点和覆盖区域分配，确保无盲区全覆盖。' }, { step: '轮换接替', desc: '建立标准化轮换机制，当执行蜂群电量低于25%时，后备蜂群无缝接替，确保覆盖不间断。' }, { step: '战果评估', desc: '实时比对打击前后目标状态变化，通过AI辅助图像识别自动生成量化战损评估报告。' }, { step: '态势推送', desc: '将实时战场图像与评估数据推送至各级指挥中枢，支持可视化态势显示与动态作战规划。' }], advantages: ['全天候持续情报获取，消除战场信息盲区', '战果评估精准及时，有效避免低效重复打击', '为后续规划提供连续可靠的数据支撑', '支持多目标并行监视，资源利用率最优'], scenarios: '适用于持续作战阶段的全程情报保障，关键目标毁伤精确评估，以及需要长时间连续掌握敌方动向的战役级监视任务。' },
  ];

  global.SWARM_DATA = { DRONES, FORMATIONS, MISSIONS, TACTICS, BATTLE_CASES };
})(typeof window !== 'undefined' ? window : this);
