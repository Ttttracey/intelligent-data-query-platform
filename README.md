<p align="center">
  <img src="assets/readme/cover.svg" alt="智能问数平台：从自然语言提问到数据洞察与可视化的脱敏交互原型" width="100%">
</p>

<p align="center">
  <strong>用自然语言提问，查看分析过程，理解数据结果。</strong><br>
  连接问数体验与数据治理后台，展示智能分析产品的页面结构、操作流程与状态反馈。
</p>

<p align="center">
  <a href="https://ttttracey.github.io/intelligent-data-query-platform/qa.html"><strong>体验智能问数 ↗</strong></a> ·
  <a href="https://ttttracey.github.io/intelligent-data-query-platform/"><strong>体验管理后台 ↗</strong></a>
</p>

<p align="center">
  <a href="#overview">项目概览</a> ·
  <a href="#preview">界面预览</a> ·
  <a href="#capabilities">功能范围</a> ·
  <a href="#journey">体验路径</a> ·
  <a href="#quickstart">本地查看</a>
</p>

---

<a id="overview"></a>
## 项目概览

当业务人员希望了解数据时，往往需要寻找数据来源、确认指标口径，再协调查询与制图。本原型围绕这一过程，探索如何用自然语言降低查询门槛，并让分析步骤与结果表达更容易理解。

项目包含两个相互配套的界面：**智能问数端**面向查询与分析，**管理后台**面向数据接入、知识配置与运营维护。

| 界面 | 面向场景 | 展示重点 |
| :--- | :--- | :--- |
| **智能问数** | 用自然语言描述需求、追问结果、查看图表与地图 | 业务域选择、意图澄清、分析过程、可视化与导出交互 |
| **管理后台** | 管理数据资产、维护问数配置、查看反馈与运行记录 | 数据源、元数据、SQL 样例、业务域、模型、权限与日志 |

> **项目形态：脱敏后的可交互前端原型。** 问答、SQL 处理、统计结果和权限操作用于演示产品流程，未连接真实生产数据库、模型推理或认证服务。

<a id="preview"></a>
## 界面预览

### 智能问数 · 从问题开始

通过示例问题快速进入体验，支持业务域选择、历史对话、问题补充与图表结果展示。

<img src="assets/readme/query-preview.png" alt="智能问数首页：历史对话、示例问题、业务域选择与提问输入框" width="100%">

### 管理后台 · 从数据资产开始

聚合数据资产概览与待办事项，按功能进入数据配置、反馈处理和管理页面。

<img src="assets/readme/admin-preview.png" alt="管理后台首页：数据资产概览、待办事项与模块导航" width="100%">

<a id="capabilities"></a>
## 功能范围

| 模块 | 可以体验什么 | 设计关注点 |
| :--- | :--- | :--- |
| **自然语言问数** | 选择业务域、使用示例问题、发起提问与连续追问 | 降低首次使用成本，让输入方式和查询范围更明确 |
| **意图澄清与分析过程** | 补充问题条件，查看意图识别、SQL 生成与结果处理的模拟步骤 | 帮助用户理解系统如何处理问题，并提供补充信息的入口 |
| **图表与空间结果** | 查看统计表、柱状图、虚拟地块和地图预览 | 匹配不同分析任务的结果表达，提供对应导出入口 |
| **对话与个人空间** | 管理历史对话，查看文件、服务资源及存储状态 | 让持续使用、资源管理和容量提示有清晰入口 |
| **数据与知识配置** | 浏览数据源、元数据、SQL 样例、业务域与业务术语页面 | 体现数据来源、语义配置与问数体验之间的关系 |
| **运营与系统管理** | 浏览模型、用户权限、参数字典、日志和统计页面 | 支持从反馈、异常与运行记录定位管理任务 |

<a id="journey"></a>
## 推荐体验路径

### 01 · 提出一个问题

打开 [智能问数演示](https://ttttracey.github.io/intelligent-data-query-platform/qa.html)，点击首页示例问题。示例覆盖业务量统计、分区建筑总量、耕地指标与地块分布，适合快速查看完整展示流程。

### 02 · 观察过程与结果

查看分析过程、最终答复以及对应图表。也可以输入一个条件不完整的问题，体验补充信息的澄清引导。地图场景使用演示网格与虚拟坐标。

### 03 · 回到管理视角

打开 [管理后台演示](https://ttttracey.github.io/intelligent-data-query-platform/)，点击登录进入。先查看数据总览与待办，再进入数据源、元数据、SQL 管理、业务域或日志等模块。

**建议：先用预置示例体验完整路径，再尝试自由输入。** 自由提问用于展示交互反馈，回复范围取决于原型内置的示例逻辑。

<a id="quickstart"></a>
## 本地查看

1. 点击仓库上方 **Code → Download ZIP**，下载并解压。
2. 用现代浏览器打开 `qa.html`，体验智能问数；打开 `index.html`，体验管理后台。
3. 后台点击登录即可进入，页面中的账号密码只用于演示。首次打开需要联网加载公开的前端图标、图表及地图组件。

无需安装服务端或配置数据库。请保持 `index.html` 与 `app.js` 位于同一目录。

<details>
<summary><strong>查看项目结构与前端组件</strong></summary>

```text
intelligent-data-query-platform/
├── index.html               管理后台页面与样式
├── app.js                   后台导航、页面渲染与演示数据
├── qa.html                  智能问数页面、交互与演示数据
├── assets/readme/           项目封面与界面预览
├── .nojekyll                GitHub Pages 静态文件配置
└── README.md                项目介绍与体验说明
```

页面由 HTML、CSS 与 JavaScript 构成，使用公开 CDN 加载 Font Awesome、Chart.js、ECharts、SheetJS 与 Leaflet。

</details>

---

相关项目：[PM Skills](https://github.com/Ttttracey/PM_skills) · 产品需求、文档与原型工作流
