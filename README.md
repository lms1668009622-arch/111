## 指控席前端（zhikong-seat）

本目录用于集中管理「指控席」前端代码。

- **入口页**：`monitor_map.html`（迁移后以本目录为根打开即可）
- **样式**：`style.css`
- **脚本**：`js/app.js`, `js/intel-data.js`, `js/intel.js`, `js/intel-ui.js`
- **静态资源**：`images/` 下相关图片

### 迁移说明

若本目录下尚未包含 `monitor_map.html`、`js/app.js`、`images/`，请在**项目根目录**执行：

```bash
node migrate_zhikong.js
```

或：

```bash
node frontend/zhikong-seat/copy-assets.js
```

完成复制后再以 `frontend/zhikong-seat/monitor_map.html` 为入口开发/调试。

### 规划建议

- **短期**：以本目录 `monitor_map.html` 为入口开发，与 `.cursor/skills/zhikong-seat-core` 定义的故事线与功能点一致。
- **中期**：逐步引入组件化实现（如 Vue/React），通过打包产物替换或包裹现有页面。
- **长期**：根目录旧文件可删除，由本目录独立作为指控席前端子工程。

