/* ============ 智能问数平台 · 后端管理系统 原型交互 ============ */

/* ---------- 导航配置（一级分组 + 二级子项，可折叠） ---------- */
const NAV = [
  { id:"g-home", icon:"fa-house", name:"主页面", link:"dashboard" },
  { id:"g-access", icon:"fa-plug", name:"数据接入", items:[
    { id:"db_access",  icon:"fa-database", name:"数据库接入", root:"数据接入" },
    { id:"filedata",   icon:"fa-file-arrow-up", name:"文件数据接入", root:"数据接入", hidden:true },
    { id:"datasource", icon:"fa-server", name:"数据源管理", root:"数据接入" },
    { id:"metadata",   icon:"fa-sitemap", name:"元数据管理", root:"数据接入" },
  ]},
  { id:"g-gov", icon:"fa-database", name:"SQL管理", items:[
    { id:"sqlsample",icon:"fa-code", name:"SQL 样例管理", root:"SQL管理" },
    { id:"correct",  icon:"fa-wand-magic-sparkles", name:"SQL 纠偏反馈", root:"SQL管理" },
    { id:"exception",icon:"fa-triangle-exclamation", name:"SQL 执行异常", root:"SQL管理" },
  ]},
  { id:"g-app", icon:"fa-layer-group", name:"数据应用", items:[
    /* hidden:true 仅隐藏菜单入口，页面功能保留；后续恢复显示：把 hidden 改为 false 或删除该字段 */
    { id:"domain_create", icon:"fa-folder-plus", name:"业务域创建", root:"数据应用", hidden:true },
    { id:"domain", icon:"fa-layer-group", name:"业务域管理", root:"数据应用" },
    { id:"glossary", icon:"fa-book", name:"业务术语管理", root:"数据应用" },
    { id:"bizapp", icon:"fa-cube", name:"业务应用管理", root:"数据应用" },
  ]},
  { id:"g-ops", icon:"fa-gears", name:"系统管理", items:[
    { id:"model", icon:"fa-microchip", name:"模型管理", root:"系统管理" },
    { id:"user",  icon:"fa-users-gear", name:"用户与权限", root:"系统管理" },
    { id:"sysparam",icon:"fa-sliders", name:"系统参数配置", root:"系统管理" },
    { id:"sysdict", icon:"fa-book", name:"系统字典管理", root:"系统管理" },
    { id:"logs",  icon:"fa-clock-rotate-left", name:"日志审计", root:"系统管理" },
    { id:"stats", icon:"fa-chart-pie", name:"统计分析", root:"系统管理" },
  ]},
];

/* ---------- 登录 / 主题 / 侧边栏 ---------- */
function enterApp(){ document.getElementById('login').classList.add('hidden'); }
function toggleSidebar(){ document.getElementById('app').classList.toggle('collapsed'); }
function showHelp(){ alert('帮助中心\n\n如需使用指引或功能说明，请联系平台管理员或查看《智能问数平台 · 后端管理系统操作手册》。'); }
function toggleTheme(){
  const html=document.documentElement;
  const cur=html.getAttribute('data-theme');
  const nx=cur==='dark'?'light':'dark';
  html.setAttribute('data-theme',nx);
  const tb=document.querySelector('#themeBtn i');
  if(tb) tb.className = nx==='dark'?'fa-solid fa-moon':'fa-solid fa-sun';
  if(window._charts) setTimeout(()=>{ if(currentView==='dashboard'||currentView==='stats') renderView(currentView); },50);
}
function updateThemeLabel(){
  const cur=document.documentElement.getAttribute('data-theme');
  const lbl=document.getElementById('themeLabel');
  if(lbl) lbl.textContent = cur==='dark'?'切换浅色模式':'切换深色模式';
}
function toggleUserMenu(e){
  e.stopPropagation();
  const av=document.getElementById('avatar');
  if(av) av.classList.toggle('open');
}
function logout(){
  closeUserMenu();
  document.getElementById('login').classList.remove('hidden');
}
function closeUserMenu(){ const av=document.getElementById('avatar'); if(av) av.classList.remove('open'); }
document.addEventListener('click',function(e){ if(!e.target.closest('#avatar')) closeUserMenu(); });

/* ---------- 渲染导航（一级/二级可折叠，一级可直链） ---------- */
let currentView='dashboard';
function buildNav(){
  const nav=document.getElementById('nav'); let h='';
  let firstItem=true;
  NAV.forEach(g=>{
    if(g.hidden) return;                                  // 隐藏整个一级分组
    const kids=(g.items||[]).filter(it=>!it.hidden);       // 过滤隐藏的二级菜单
    if(!g.link && !kids.length) return;                    // 子项全部隐藏时，分组一并不渲染
    h+=`<div class="nav-group" data-gid="${g.id}">`;
    if(g.link){ // 一级直链（无子菜单）
      h+=`<div class="nav-parent is-link${g.link===currentView?' active':''}" data-id="${g.link}" data-root="${g.name}" data-name="我的主页" onclick="navHome()"><i class="fa-solid ${g.icon}"></i><span>${g.name}</span></div>`;
    } else {
      const open=firstItem?' is-open':''; firstItem=false;
      h+=`<div class="nav-parent" onclick="toggleGroup('${g.id}')"><i class="fa-solid ${g.icon}"></i><span>${g.name}</span><i class="fa-solid fa-chevron-down nav-caret"></i></div>`;
      h+=`<div class="nav-children${open}">`;
      kids.forEach(it=>{
        h+=`<div class="nav-item${it.id===currentView?' active':''}" data-id="${it.id}" data-root="${it.root}" data-name="${it.name}" onclick="go('${it.id}')"><i class="fa-solid ${it.icon}"></i><span>${it.name}</span></div>`;
      });
      h+=`</div>`;
    }
    h+=`</div>`;
  });
  nav.innerHTML=h;
}
/* 从 NAV 配置中查菜单元信息（含被隐藏的项），供面包屑等场景回退使用 */
function navMetaOf(id){
  for(const g of NAV){
    if(g.link===id) return {root:g.name, name:'我的主页'};
    for(const it of (g.items||[])) if(it.id===id) return {root:it.root||g.name, name:it.name};
  }
  return null;
}
/* 菜单显隐开关：navSetHidden('domain_create',false) 即可恢复显示 */
function navSetHidden(id, hidden){
  const meta=NAV.find(g=>g.id===id) || NAV.flatMap(g=>g.items||[]).find(it=>it.id===id);
  if(!meta) return false;
  meta.hidden=!!hidden; buildNav();
  document.querySelectorAll('.nav-item,.nav-parent').forEach(n=>n.classList.toggle('active',n.dataset.id===currentView));
  const grp=document.querySelector(`.nav-item[data-id="${currentView}"]`)?.closest('.nav-group');
  if(grp) grp.classList.add('is-open');
  return true;
}
function toggleGroup(gid){
  const app=document.getElementById('app');
  if(app.classList.contains('collapsed')){ app.classList.remove('collapsed'); }
  const g=document.querySelector(`.nav-group[data-gid="${gid}"]`);
  if(g) g.classList.toggle('is-open');
}
function navHome(){
  const app=document.getElementById('app');
  if(app.classList.contains('collapsed')) app.classList.remove('collapsed');
  go('dashboard');
}
function go(id){ metaGuardLeave(()=>goView(id)); }
function goView(id){
  currentView=id;
  document.querySelectorAll('.nav-item,.nav-parent').forEach(n=>n.classList.toggle('active',n.dataset.id===id));
  const el=document.querySelector(`.nav-item[data-id="${id}"],.nav-parent[data-id="${id}"]`);
  const grp=el && el.closest('.nav-group');
  if(grp && grp.querySelector('.nav-children')) grp.classList.add('is-open');
  // 面包屑：菜单项存在时取 DOM，被隐藏时回退到 NAV 配置（保证隐藏页仍可直接访问）
  const crumb = el ? {root:el.dataset.root||'', name:el.dataset.name||''} : navMetaOf(id);
  if(crumb){
    document.getElementById('crumbRoot').textContent=crumb.root;
    document.getElementById('crumbCur').textContent=crumb.name;
  }
  metaSnap=null; metaDirty=false;   // 离开元数据页，清除未保存跟踪
  renderView(id);
  document.getElementById('content').scrollTo?.(0,0);
  window.scrollTo(0,0);
}

/* ---------- 视图渲染入口 ---------- */
function renderView(id){
  const c=document.getElementById('content');
  c.innerHTML=`<div class="view active">${(VIEWS[id]||VIEWS.soon)()}</div>`;
  if(id==='dashboard') initDashCharts();
  if(id==='stats') initStatCharts();
}

/* ---------- 小工具 ---------- */
const ph=(t,s,ra)=>`<div class="page-head"><div><h2>${t}</h2><p>${s}</p></div><div class="head-actions">${ra||''}</div></div>`;
function escHtml(s){return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* ================= 各视图 ================= */
const VIEWS={};

/* ---- 1. 我的主页 ---- */
VIEWS.dashboard=()=>{
  /* 各模块配色 → 强调色变量映射 */
  const HC={blue:'var(--accent)',cyan:'var(--accent-2)',green:'var(--success)',purple:'var(--purple)',orange:'var(--warn)',red:'var(--danger)'};
  /* 我的主页覆盖的 8 个模块：数据总览 + 待办提示统一来源于此 */
  const mods=[
    {id:'datasource',icon:'fa-server',name:'我的数据源',color:'blue',
      stats:[['已接入','24'],['已启用','22'],['连接异常','2']],
      todo:3,todoTxt:'3个数据源连接异常，需排查处理'},
    {id:'metadata',icon:'fa-sitemap',name:'我的元数据',color:'cyan',
      stats:[['表/视图','1,368'],['待补全表','32'],['待补全字段','96']],
      todo:96,todoTxt:'32张数据表，共96个字段待补全'},
    {id:'sqlsample',icon:'fa-code',name:'我的SQL样例',color:'green',
      stats:[['样例总数','2,047'],['命中率','76.3%'],['已启用','18']],
      todo:12,todoTxt:'12 条新提交样例待评估并启用',hideTodo:true},
    {id:'correct',icon:'fa-wand-magic-sparkles',name:'纠偏反馈',color:'purple',
      stats:[['待处理','36'],['本周新增','12'],['已采纳','158']],
      todo:36,todoTxt:'36条SQL纠偏反馈待查看处理'},
    {id:'exception',icon:'fa-triangle-exclamation',name:'执行异常',color:'red',
      stats:[['待处理','8'],['本周新增','5'],['已处理','156']],
      todo:8,todoTxt:'8 条 SQL 执行异常待跟进处理'},
    {id:'domain',icon:'fa-layer-group',name:'我的业务域',color:'orange',
      stats:[['已创建','12'],['已启用','10'],['待授权','2']],
      todo:2,todoTxt:'2个已启用的业务域待授权处理'},
    {id:'glossary',icon:'fa-book',name:'术语数据',color:'blue',
      stats:[['术语','320'],['已启用','24'],['已映射','9']],
      todo:24,todoTxt:'24 条术语已启用，9 条映射关系已建立',hideTodo:true},
    {id:'bizapp',icon:'fa-cube',name:'我的业务应用',color:'cyan',
      stats:[['已注册','16'],['已启用','13'],['已停用','3']],
      todo:3,todoTxt:'3 个业务应用已停用，建议评估是否重新启用或下线',hideTodo:true},
  ];
  /* 数据总览需隐藏的模块卡片（仅隐藏卡片，不影响下方待办提示列表） */
  const OV_HIDE=['sqlsample','correct','exception','glossary'];
  const todoPill=c=>c==='red'?'err':(c==='orange'?'warn':'info');
  /* 数据总览：4 张模块卡片（隐藏 SQL样例/纠偏反馈/执行异常/术语数据），点击进入对应模块 */
  const ov=mods.filter(m=>!OV_HIDE.includes(m.id)).map(m=>`
    <div class="ov-card" onclick="go('${m.id}')">
      <div class="ov-top"><div class="ic ${m.color}"><i class="fa-solid ${m.icon}"></i></div><div class="nm">${m.name}</div></div>
      <div class="ov-stats">
        ${m.stats.map((s,i)=>`<div class="ov-stat"><span class="ol">${s[0]}</span><span class="ov" ${i===0?`style="color:${HC[m.color]}"`:''}>${s[1]}</span></div>`).join('')}
      </div>
    </div>`).join('');
  /* 待办提示：仅展示未隐藏的待处理事项，点击进入对应模块 */
  const todo=mods.filter(m=>!m.hideTodo).map(m=>`
    <div class="todo-item" onclick="go('${m.id}')">
      <div class="dl-ic ic ${m.color}"><i class="fa-solid ${m.icon}"></i></div>
      <div class="tx"><b>${m.name}</b><span>${m.todoTxt}</span></div>
      <span class="pill ${todoPill(m.color)}">${m.todo} 项</span>
      <span class="go">去处理 <i class="fa-solid fa-angle-right"></i></span>
    </div>`).join('');
  return `
${ph('我的主页','欢迎回来，演示管理员 · 这里汇总你名下的数据资产与待办事项 · '+new Date().toLocaleDateString('zh-CN'),
  '<button class="btn"><i class="fa-solid fa-rotate"></i>刷新</button>')}
<div class="sec-head"><h3>数据总览</h3><span class="sub">实时统计你名下的数据资产</span></div>
<div class="overview-grid">${ov}</div>
<div class="sec-head"><h3>待办提示</h3><span class="sub">需要你关注和处理的事项</span><span class="slot"><i class="fa-solid fa-circle-info" style="color:var(--accent)"></i> 点击卡片或列表项可进入对应模块处理</span></div>
<div class="todo-list">${todo}</div>`;
};

/* ---- 2. 数据源管理 ---- */
/* 数据源列表（暂仅数据库类型），en: unen=未启用 / en=已启用 / stop=已停用 */
const DS_LIST=[
  {name:'规划审批库',type:'PostgreSQL',icon:'fa-database',host:'192.0.2.5:5432',db:'demo_approval',schema:'public',acct:'demo_reader_01',tables:186,health:'on',en:'en',check:'2 分钟前'},
  {name:'不动产登记库',type:'MySQL',icon:'fa-database',host:'192.0.2.6:3306',db:'demo_registry',schema:'re_sch',acct:'demo_reader_02',tables:245,health:'on',en:'en',check:'3 分钟前'},
  {name:'国土空间规划库',type:'PostGIS',icon:'fa-earth-asia',host:'192.0.2.9:5432',db:'demo_spatial',schema:'gis',acct:'demo_reader_03',tables:92,health:'warn',en:'en',check:'1 分钟前'},
  {name:'耕地保护空间库',type:'PostGIS',icon:'fa-earth-asia',host:'192.0.2.10:5432',db:'demo_farmland',schema:'gis',acct:'demo_reader_04',tables:58,health:'err',en:'en',check:'5 分钟前'},
  {name:'执法监察库',type:'Oracle',icon:'fa-database',host:'192.0.2.7:1521',db:'demo_audit',schema:'ENFORCE',acct:'demo_reader_05',tables:134,health:'on',en:'en',check:'2 分钟前'},
  {name:'测绘成果库',type:'SQL Server',icon:'fa-database',host:'192.0.2.8:1433',db:'demo_survey',schema:'dbo',acct:'demo_reader_06',tables:77,health:'err',en:'stop',check:'15 分钟前'},
  {name:'新建审批中间库',type:'PostgreSQL',icon:'fa-database',host:'192.0.2.11:5432',db:'demo_staging',schema:'public',acct:'demo_reader_07',tables:0,health:'none',en:'unen',check:''},
];
let dsHealthFilter='';        // 数据源健康状态筛选：''=全部 / 'err'=连接失败 / 'warn'=延迟状态
function dsHealthPill(d){
  if(d.en!=='en') return '<span style="color:var(--text-3)">—</span>';
  if(d.health==='on') return '<span class="pill on"><i class="fa-solid fa-circle"></i>正常</span>';
  if(d.health==='warn') return '<span class="pill warn"><i class="fa-solid fa-circle"></i>延迟</span>';
  return '<span class="pill err"><i class="fa-solid fa-circle"></i>连接失败</span>';
}
function dsEnPill(d){
  if(d.en==='en') return '<span class="pill on">已启用</span>';
  if(d.en==='unen') return '<span class="pill off">未启用</span>';
  return '<span class="pill pend">已停用</span>';
}
function dsRow(d,i,n){           // i=原始索引(用于事件回调) / n=显示行号
  return `<tr>
    <td style="color:var(--text-3)">${n}</td>
    <td><b>${d.name}</b></td>
    <td><i class="fa-solid ${d.icon}" style="color:var(--accent);margin-right:6px"></i>${d.type}</td>
    <td class="mono">${d.host}</td>
    <td class="mono">${d.db}</td>
    <td class="mono">${d.acct}</td>
    <td><a class="ds-tbl-link" onclick="dsGotoMeta(${i})"><span class="ds-num">${d.tables}</span></a></td>
    <td id="dshc-${i}">${dsHealthPill(d)}</td>
    <td>${dsEnPill(d)}</td>
    <td style="color:var(--text-3)">${d.en==='en'?d.check:'—'}</td>
    <td><div class="act">
      <a title="检测" onclick="dsTest(${i})"><i class="fa-solid fa-plug"></i></a>
      <a title="编辑" onclick="dsEdit(${i})"><i class="fa-solid fa-pen"></i></a>
      <a title="接入数据表" onclick="dsAccess(${i})"><i class="fa-solid fa-table"></i></a>
      ${d.en==='en'
        ? '<a class="del" title="停用" onclick="dsToggleEn('+i+')"><i class="fa-solid fa-circle-stop"></i></a>'
        : '<a class="go" title="启用" onclick="dsToggleEn('+i+')"><i class="fa-solid fa-circle-play"></i></a>'}
      ${d.en==='unen'?'<a class="del" title="删除" onclick="dsDelete(${i})"><i class="fa-solid fa-trash"></i></a>':''}
    </div></td>
  </tr>`;
}
function dsFilteredRows(){
  return DS_LIST.map((d,i)=>({d,i})).filter(x=> !dsHealthFilter || (x.d.health===dsHealthFilter && x.d.en==='en'));
}
function dsSetHealthFilter(status,el){
  dsHealthFilter = (el && el.classList.contains('active')) ? '' : status;
  document.querySelectorAll('#dsTblBar .chip').forEach(c=>c.classList.remove('active'));
  if(dsHealthFilter===''){ const a=document.querySelector('#dsTblBar .chip-all'); if(a) a.classList.add('active'); }
  else if(el) el.classList.add('active');
  const rows=dsFilteredRows();
  const tb=document.getElementById('dsTbody'); if(tb) tb.innerHTML=rows.map((x,n)=>dsRow(x.d,x.i,n+1)).join('');
  const pager=document.getElementById('dsPager'); if(pager) pager.innerHTML='<span>共 '+rows.length+' 条</span><a class="on">1</a>';
}
VIEWS.datasource=()=>{
  const rows=dsFilteredRows();
  return `${ph('数据源管理','统一管理平台接入的数据库数据源，配置连接参数、监测健康状态 ')}
<div class="card">
  <div class="tbl-bar" id="dsTblBar">
    <span class="chip chip-all ${dsHealthFilter===''?'active':''}" onclick="dsSetHealthFilter('',this)">全部</span><span class="chip ${dsHealthFilter==='err'?'active':''}" onclick="dsSetHealthFilter('err',this)">连接失败</span><span class="chip ${dsHealthFilter==='warn'?'active':''}" onclick="dsSetHealthFilter('warn',this)">延迟状态</span>
    <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索数据源名称"></div>
    <div class="tbl-acts"><button class="btn"><i class="fa-solid fa-arrows-rotate"></i>批量检测</button><button class="btn primary" onclick="go('db_access')"><i class="fa-solid fa-plus"></i>注册数据源</button></div>
  </div>
  <div class="tbl-wrap"><table>
    <thead><tr><th style="width:46px">#</th><th>数据源名称</th><th>数据源类型</th><th>连接地址</th><th>数据库名</th><th>账号</th><th>接入数据表数</th><th>健康状态</th><th>启用状态</th><th>最近检测</th><th>操作</th></tr></thead>
    <tbody id="dsTbody">${rows.map((x,n)=>dsRow(x.d,x.i,n+1)).join('')}</tbody>
  </table></div>
  <div class="pager" id="dsPager"><span>共 ${rows.length} 条</span><a class="on">1</a></div>
</div>`;
};
function dsTest(i){
  const cell=document.getElementById('dshc-'+i);
  if(!cell) return;
  cell.innerHTML='<span class="pill pend"><i class="fa-solid fa-spinner fa-spin"></i>检测中</span>';
  setTimeout(()=>{ const c=document.getElementById('dshc-'+i); if(c) c.innerHTML=dsHealthPill(DS_LIST[i]); }, 1300);
}
let dsEditIdx=-1;
function dsEdit(i){
  const d=DS_LIST[i];
  dsEditIdx=i;
  const tmap={'PostgreSQL':'postgresql','MySQL':'mysql','PostGIS':'postgis','SQL Server':'sqlserver','Oracle':'oracle','人大金仓':'kingbase','达梦':'dm'};
  document.getElementById('dbSrcName').value=d.name;
  const t=document.getElementById('dbType'); t.value=tmap[d.type]||'postgresql'; t.disabled=true;
  const h=document.getElementById('dbHost'); h.value=d.host; h.disabled=true;
  const n=document.getElementById('dbName'); n.value=d.db; n.disabled=true;
  document.getElementById('dbUser').value=d.acct;
  document.getElementById('dbPwd').value='';
  document.getElementById('dbRemark').value='';
  openModal('dsModal');
}
/* 接入数据表：弹出选择表/视图窗口（内容与数据库接入步骤二一致） */
let dsAccSel=[], dsAccKw='', dsAccSchCollapsed={};
function dsAccess(i){
  dsAccSel=[]; dsAccKw=''; dsAccSchCollapsed={};
  document.getElementById('dsAccTitle').textContent='接入数据表 · '+DS_LIST[i].name;
  dsAccRender();
  openModal('dsAccessModal');
}
/* 从数据源管理跳转查看该数据源接入的元数据（按名称匹配元数据管理中的数据源） */
function dsGotoMeta(i){
  const d=DS_LIST[i]; if(!d) return;
  let idx=META_SRCS.findIndex(s=>s.name===d.name);
  if(idx<0){ // 元数据管理中尚无该数据源，按名称动态注册（空表，待扫描）
    META_SRCS.push({name:d.name, type:d.type, host:d.host, db:d.db, icon:d.icon, en:'on', tables:[]});
    idx=META_SRCS.length-1;
  }
  metaMode='tree';
  metaTreeSrc=idx; metaTreeTbl=0; metaTreeOpen=new Set([idx]); metaTreeSchCollapsed=new Set();
  metaSrc=idx; metaTbl=0; metaLevel=2; metaAiPending=false; metaAiBuf=[];
  go('metadata');
}
function dsAccAvail(){
  const kw=dsAccKw.trim().toLowerCase();
  return DB_OBJS.filter(o=>!dsAccSel.includes(o.n) && (!kw || o.n.toLowerCase().includes(kw) || o.d.toLowerCase().includes(kw)));
}
function dsAccRender(){
  const av=dsAccAvail();
  const sel=DB_OBJS.filter(o=>dsAccSel.includes(o.n));
  const row=(o,selMode)=>{
    const chk=selMode?'':`<input type="checkbox" ${dsAccSel.includes(o.n)?'checked':''} onclick="event.stopPropagation();dsAccToggle('${o.n}')" title="选择 / 取消选择 ${o.n}">`;
    const tail=selMode?'<a class="tf-rm" onclick="dsAccToggle(\'${o.n}\')" title="移除"><i class="fa-solid fa-xmark"></i></a>':'';
    return `<div class="obj-row ${selMode?'sel':''}" onclick="dsAccToggle('${o.n}')">${chk}<span class="oi"><i class="fa-solid ${o.t==='view'?'fa-table-columns':'fa-table'}"></i></span><span class="nm-wrap"><span class="ot">${o.n}</span><span class="cn">${o.d}</span><span class="sep">·</span><span class="ofc">${o.f} 字段</span><span class="sch-tag">${o.s}</span></span>${tail}</div>`;
  };
  const wrap=(inner)=>`<div class="tf-group">${inner}</div>`;
  const group=(list)=>{
    const tables=list.filter(o=>o.t!=='view'), views=list.filter(o=>o.t==='view');
    return wrap((tables.length?`<div class="tf-sec">表 · ${tables.length}</div>${tables.map(o=>row(o,false)).join('')}`:'')
              + (views.length?`<div class="tf-sec">视图 · ${views.length}</div>${views.map(o=>row(o,false)).join('')}`:''));
  };
  const selGroup=(list)=>{
    const tables=list.filter(o=>o.t!=='view'), views=list.filter(o=>o.t==='view');
    return wrap((tables.length?`<div class="tf-sec">表 · ${tables.length}</div>${tables.map(o=>row(o,true)).join('')}`:'')
              + (views.length?`<div class="tf-sec">视图 · ${views.length}</div>${views.map(o=>row(o,true)).join('')}`:''));
  };
  const schs=[...new Set(av.map(o=>o.s))];
  const tree=schs.map(s=>{
    const open=!dsAccSchCollapsed[s] || !!dsAccKw.trim();
    const schObjs=DB_OBJS.filter(o=>o.s===s);
    const allSel=schObjs.length>0 && schObjs.every(o=>dsAccSel.includes(o.n));
    return `<div class="tf-sch ${open?'is-open':'is-collapsed'}" onclick="dsAccToggleSch('${s}')">
      <i class="tf-caret fa-solid ${open?'fa-chevron-down':'fa-chevron-right'}"></i>
      <input type="checkbox" class="tf-sch-cb" ${allSel?'checked':''} onclick="event.stopPropagation();dsAccSchAll('${s}')" title="全选/取消全选该 schema">
      <i class="fa-solid fa-folder${open?'-open':''}"></i> schema: <b>${s}</b>
      <span class="sch-cnt">${av.filter(o=>o.s===s).length}</span>
    </div>${open?group(av.filter(o=>o.s===s)):''}`;
  }).join('');
  const selSchs=[...new Set(sel.map(o=>o.s))];
  const selTree=selSchs.map(s=>{
    const open=!dsAccSchCollapsed[s];
    const sItems=sel.filter(o=>o.s===s);
    return `<div class="tf-sch ${open?'is-open':'is-collapsed'}" onclick="dsAccToggleSch('${s}')">
      <i class="tf-caret fa-solid ${open?'fa-chevron-down':'fa-chevron-right'}"></i>
      <i class="fa-solid fa-folder${open?'-open':''}"></i> schema: <b>${s}</b>
      <span class="sch-cnt">${sItems.length}</span>
    </div>${open?selGroup(sItems):''}`;
  }).join('');
  document.getElementById('dsAccBody').innerHTML=`<div class="transfer">
    <div class="tf-pane">
      <div class="tf-bar">
        <label class="chk-all"><input type="checkbox" ${av.length&&av.every(o=>dsAccSel.includes(o.n))?'checked':''} onchange="dsAccAll(this)"> 全选</label>
        <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input id="dsAccSearch" placeholder="搜索表 / 视图" value="${dsAccKw}" oninput="dsAccKw=this.value;dsAccRender()"></div>
      </div>
      <div class="obj-list tf-avail">
        ${tree}
        ${!av.length?`<div class="tf-empty">无匹配对象</div>`:''}
      </div>
    </div>
    <div class="tf-pane">
      <div class="tf-bar">
        <span class="obj-count">已选 ${sel.length} 项</span>
        ${sel.length?`<a class="tf-clear" onclick="dsAccClear()"><i class="fa-solid fa-xmark"></i> 清空已选</a>`:''}
      </div>
      <div class="obj-list tf-seled">
        ${selTree}
        ${!sel.length?`<div class="tf-empty">尚未选择对象，请从左侧添加</div>`:''}
      </div>
    </div>
  </div>`;
  if(dsAccKw){ const s=document.getElementById('dsAccSearch'); if(s){ s.focus(); try{ s.setSelectionRange(s.value.length,s.value.length); }catch(e){} } }
}
function dsAccToggleSch(s){ dsAccSchCollapsed[s]=!dsAccSchCollapsed[s]; dsAccRender(); }
function dsAccSchAll(s){
  const schObjs=DB_OBJS.filter(o=>o.s===s);
  const allSel=schObjs.length>0 && schObjs.every(o=>dsAccSel.includes(o.n));
  if(allSel){ dsAccSel=dsAccSel.filter(x=>!schObjs.some(o=>o.n===x)); }
  else { schObjs.forEach(o=>{ if(!dsAccSel.includes(o.n)) dsAccSel.push(o.n); }); }
  dsAccRender();
}
function dsAccToggle(n){ if(dsAccSel.includes(n)) dsAccSel=dsAccSel.filter(x=>x!==n); else dsAccSel.push(n); dsAccRender(); }
function dsAccClear(){ dsAccSel=[]; dsAccRender(); }
function dsAccAll(box){ const av=dsAccAvail(); if(box.checked){ av.forEach(o=>{ if(!dsAccSel.includes(o.n)) dsAccSel.push(o.n); }); } else { av.forEach(o=>{ dsAccSel=dsAccSel.filter(x=>x!==o.n); }); } dsAccRender(); }
function dsAccConfirm(){ if(dsAccSel.length===0){ showToast('请至少选择一个表或视图'); return; } showToast('已提交接入任务（'+dsAccSel.length+' 个对象）'); closeModal('dsAccessModal'); }
/* 删除：弹出操作确认框 */
let _confirmCb=null;
function dsDelete(i){
  if(DS_LIST[i].en!=='unen'){ return; }
  showConfirm('确认删除数据源「'+DS_LIST[i].name+'」？删除后不可恢复。', ()=>{
    DS_LIST.splice(i,1);
    renderView('datasource');
  });
}
function dsToggleEn(i){
  const d=DS_LIST[i];
  if(d.en==='en'){
    showConfirm('确认停用数据源「'+d.name+'」？停用后将暂停该数据源的接入与查询服务。', ()=>{
      d.en='stop';
      renderView('datasource');
      showToast('已停用数据源「'+d.name+'」');
    });
  } else {
    d.en='en';
    if(!d.check) d.check='刚刚';
    renderView('datasource');
    showToast('已启用数据源「'+d.name+'」');
  }
}
/* opts: {title, okText, okClass, cancelText}，不传时保持「删除确认」默认形态 */
function showConfirm(msg, cb, opts){
  opts=opts||{};
  document.getElementById('confirmMsg').textContent=msg;
  const t=document.getElementById('confirmTitle'); if(t) t.textContent=opts.title||'删除数据确认';
  const ok=document.getElementById('confirmOk');
  if(ok){ ok.className='btn '+(opts.okClass||'danger'); ok.innerHTML=opts.okText||'确定'; }
  const cc=document.getElementById('confirmCancel'); if(cc) cc.textContent=opts.cancelText||'取消';
  _confirmCb=cb; openModal('confirmModal');
}
function closeConfirm(){ closeModal('confirmModal'); _confirmCb=null; }
function runConfirm(){ const cb=_confirmCb; closeConfirm(); if(cb) cb(); }

/* ---- 3. 数据库接入 ---- */
const DB_SRCS=[
  ['规划审批库','PostgreSQL','fa-elephant','192.0.2.5:5432','demo_approval','186','182','on'],
  ['不动产登记库','MySQL','fa-database','192.0.2.6:3306','demo_registry','245','245','on'],
  ['国土空间规划库','PostGIS','fa-earth-asia','192.0.2.9:5432','demo_spatial','92','88','on'],
  ['耕地保护空间库','PostGIS','fa-earth-asia','192.0.2.10:5432','demo_farmland','58','40','warn'],
  ['执法监察库','Oracle','fa-database','192.0.2.7:1521','demo_audit','134','130','on'],
  ['测绘成果库','SQL Server','fa-database','192.0.2.8:1433','demo_survey','77','0','err'],
];
let dbCurStep=1;
VIEWS.db_access=()=>{
  let initStep, initHTML;
  if(window._dbIngest){ initStep=3; initHTML=dbStep3HTML(); }
  else { initStep=1; initHTML=dbStep1HTML(); }
  dbCurStep=initStep;
  return `
${ph('数据库接入','支持主流结构化与空间数据库（达梦、人大金仓、MySQL、PostgreSQL、Oracle、PostGIS 等）的库表 / 视图元数据接入 ')}
<div class="pipe" id="dbSteps">
  <div class="step active" data-step="1" onclick="selectDbStep(1)"><div class="si"><i class="fa-solid fa-server"></i></div><div class="st-txt"><b>① 配置数据库数据源</b><small>注册并连接数据库</small></div><span class="st-tag">当前步骤</span></div>
  <div class="step" data-step="2" onclick="selectDbStep(2)"><div class="si"><i class="fa-solid fa-table-list"></i></div><div class="st-txt"><b>② 选择接入对象</b><small>勾选需接入的表与视图</small></div><span class="st-tag">当前步骤</span></div>
  <div class="step" data-step="3" onclick="selectDbStep(3)"><div class="si"><i class="fa-solid fa-wand-magic-sparkles"></i></div><div class="st-txt"><b>③ 自动接入元数据</b><small>采集字段与样本数据</small></div><span class="st-tag">当前步骤</span></div>
</div>
<div id="dbStepContent">${initHTML}</div>`;
};
function dbStep1HTML(){
  const typeOps=['PostgreSQL','MySQL','Oracle','SQL Server','PostGIS','达梦 DM','人大金仓 Kingbase']
    .map(t=>`<option>${t}</option>`).join('');
  return `<div class="card">
  <div class="card-h"><h3>配置数据库数据源 <span class="sub">注册一个数据库连接，支持智能识别连接串</span></h3></div>
  <div class="card-b">
    <div class="smart-parse">
      <div class="smart-wrap">
        <textarea id="dsSmart" class="smart-input" placeholder="可粘贴数据库连接串或键值对（host / port / db / user / pwd），点击「识别填充」自动录入表单" oninput="autoResize(this);dbSmartToggle()"></textarea>
        <div class="sp-clear" id="dsSmartClear" onclick="dbClearSmart()"><i class="fa-solid fa-eraser"></i></div>
      </div>
      <div class="smart-foot">
        <span class="smart-tip">支持 host= / port= / db= / user= / pwd= 键值对，或 JDBC / ODBC 连接串</span>
        <button class="btn" onclick="dbParseSmart()"><i class="fa-solid fa-wand-magic-sparkles"></i>识别填充</button>
      </div>
    </div>
    <form class="form-grid" onsubmit="return false">
      <div class="form-field"><label><span class="req">*</span>数据源名称</label><input id="dsName" placeholder="如：规划审批库"></div>
      <div class="form-field"><label><span class="req">*</span>数据库类型</label><select id="dsType">${typeOps}</select></div>
      <div class="form-field"><label><span class="req">*</span>连接地址</label><input id="dsHost" placeholder="host:port，如 192.0.2.5:5432"></div>
      <div class="form-field"><label><span class="req">*</span>数据库名</label><input id="dsDb" placeholder="如 demo_approval"></div>
      <div class="form-field"><label><span class="req">*</span>登录账号</label><input id="dsUser" placeholder="如 admin"></div>
      <div class="form-field"><label><span class="req">*</span>登录密码</label><input id="dsPwd" type="password" placeholder="请输入密码"></div>
      <div class="form-field full"><label>数据源描述<span class="opt">（选填）</span></label><textarea id="dsDesc" placeholder="补充说明该数据源用途、归属部门等信息（选填）"></textarea></div>
    </form>
    <div class="step2-foot">
      <button class="btn" onclick="dbResetForm()">重置</button>
      <button class="btn primary" id="dbSaveBtn" onclick="dbSaveSource()"><i class="fa-solid fa-floppy-disk"></i>保存&下一步</button>
    </div>
  </div>
</div>`;
}
function dbSmartToggle(){
  const el=document.getElementById('dsSmart'), btn=document.getElementById('dsSmartClear');
  if(el&&btn) btn.classList.toggle('show', el.value.trim().length>0);
}
function dbClearSmart(){
  const el=document.getElementById('dsSmart');
  if(el){ el.value=''; el.style.height='auto'; dbSmartToggle(); }
}
function dbParseSmart(){
  const txt=(document.getElementById('dsSmart').value||'').trim();
  if(!txt){ alert('请先粘贴数据库连接串或键值对描述'); return; }
  const jdbc=txt.match(/jdbc:(\w+):\/\/([^:/]+)(?::(\d+))?(?:\/(\S+))?/i);
  if(jdbc){ document.getElementById('dsHost').value=(jdbc[2]||'')+(jdbc[3]?':'+jdbc[3]:''); if(jdbc[4]) document.getElementById('dsDb').value=jdbc[4]; }
  const host=txt.match(/(?:数据库地址|地址|host|hostname)[:：]\s*(\S+)/i);
  const port=txt.match(/(?:端口|port)[:：]\s*(\d+)/i);
  const db=txt.match(/(?:数据库名|数据库|库名|database|db)[:：]\s*(\S+)/i);
  const user=txt.match(/(?:用户名|账号|账号名|user)[:：]\s*(\S+)/i);
  const pwd=txt.match(/(?:密码|passwd|password)[:：]\s*(\S+)/i);
  if(host){ document.getElementById('dsHost').value=(port?host[1]+':'+port[1]:host[1]); }
  if(db){ document.getElementById('dsDb').value=db[1]; }
  if(user){ document.getElementById('dsUser').value=user[1]; }
  if(pwd){ document.getElementById('dsPwd').value=pwd[1]; }
  alert('已尝试智能识别，请核对并补充信息。');
}
function dbResetForm(){
  ['dsName','dsHost','dsDb','dsUser','dsPwd','dsDesc'].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=''; });
  const t=document.getElementById('dsType'); if(t) t.selectedIndex=0;
  dbClearSmart();
}
function dbSaveSource(){
  const name=document.getElementById('dsName').value.trim();
  const host=document.getElementById('dsHost').value.trim();
  const db=document.getElementById('dsDb').value.trim();
  const user=document.getElementById('dsUser').value.trim();
  const pwd=document.getElementById('dsPwd').value.trim();
  if(!name||!host||!db||!user||!pwd){ alert('请填写所有必填项：数据源名称、连接地址、数据库名、登录账号、登录密码'); return; }
  const type=document.getElementById('dsType').value;
  const btn=document.getElementById('dbSaveBtn');
  if(btn){ btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> 连接测试中…'; }
  // 模拟连接测试
  setTimeout(()=>{
    const ok=dbTestConn(name,host,db,user,pwd);
    if(btn){ btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i>保存&下一步'; }
    if(!ok){ alert('数据库连接失败：无法连接到 '+host+'，请检查连接地址、账号或密码。'); return; }
    const icon=type.includes('PostGIS')?'fa-earth-asia':type.includes('MySQL')?'fa-database':'fa-elephant';
    DB_SRCS.push([name,type,icon,host,db||'—','0','0','on']);
    dbResetForm();
    showToast('数据源「'+name+'」保存成功');
    setTimeout(()=>selectDbStep(2,name),1000);
  }, 1100);
}
function dbTestConn(){ /* 演示：模拟连接测试，默认成功 */ return true; }
function showToast(msg){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.innerHTML='<i class="fa-solid fa-circle-check"></i> '+msg;
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>t.classList.remove('show'),1000);
}

/* 步骤 2：选择表与视图（左右双栏） */
let dbStep2Src=null, dbStep2Sel=[], dbStep2Kw='', dbStep2SchCollapsed={};
function dbAvail(){
  const kw=dbStep2Kw.toLowerCase();
  return DB_OBJS.filter(o=>!dbStep2Sel.includes(o.n) && (!kw || o.n.toLowerCase().includes(kw) || o.d.toLowerCase().includes(kw)));
}
function dbAvItem(o){
  const sel=dbStep2Sel.includes(o.n);
  return `<div class="obj-row" onclick="dbToggleSel('${o.n}')"><input type="checkbox" ${sel?'checked':''} onclick="event.stopPropagation();dbToggleSel('${o.n}')" title="选择 / 取消选择 ${o.n}"><span class="oi"><i class="fa-solid ${o.t==='view'?'fa-table-columns':'fa-table'}"></i></span><span class="nm-wrap"><span class="ot">${o.n}</span><span class="cn">${o.d}</span><span class="sep">·</span><span class="ofc">${o.f} 字段</span><span class="sch-tag">${o.s}</span></span></div>`;
}
function dbSelItem(o){
  return `<div class="obj-row sel"><span class="oi"><i class="fa-solid ${o.t==='view'?'fa-table-columns':'fa-table'}"></i></span><span class="nm-wrap"><span class="ot">${o.n}</span><span class="cn">${o.d}</span><span class="sep">·</span><span class="ofc">${o.f} 字段</span><span class="sch-tag">${o.s}</span></span><a class="tf-rm" onclick="dbToggleSel('${o.n}')" title="移除"><i class="fa-solid fa-xmark"></i></a></div>`;
}
function dbStep2HTML(){
  const src=dbStep2Src||DB_SRCS[0][0];
  const av=dbAvail();
  const selItems=DB_OBJS.filter(o=>dbStep2Sel.includes(o.n));
  const group=(list)=>{
    const tables=list.filter(o=>o.t!=='view'), views=list.filter(o=>o.t==='view');
    return `<div class="tf-group">${
         (tables.length?`<div class="tf-sec">表 · ${tables.length}</div>${tables.map(dbAvItem).join('')}`:'')
       + (views.length?`<div class="tf-sec">视图 · ${views.length}</div>${views.map(dbAvItem).join('')}`:'')
    }</div>`;
  };
  const selGroup=(list)=>{
    const tables=list.filter(o=>o.t!=='view'), views=list.filter(o=>o.t==='view');
    return `<div class="tf-group">${
         (tables.length?`<div class="tf-sec">表 · ${tables.length}</div>${tables.map(dbSelItem).join('')}`:'')
       + (views.length?`<div class="tf-sec">视图 · ${views.length}</div>${views.map(dbSelItem).join('')}`:'')
    }</div>`;
  };
  const selSchs=[...new Set(selItems.map(o=>o.s))];
  const selTree=selSchs.map(s=>{
    const open=!dbStep2SchCollapsed[s];
    const sItems=selItems.filter(o=>o.s===s);
    return `<div class="tf-sch ${open?'is-open':'is-collapsed'}" onclick="dbToggleSch('${s}')">
      <i class="tf-caret fa-solid ${open?'fa-chevron-down':'fa-chevron-right'}"></i>
      <i class="fa-solid fa-folder${open?'-open':''}"></i> schema: <b>${s}</b>
      <span class="sch-cnt">${sItems.length}</span>
    </div>${open?selGroup(sItems):''}`;
  }).join('');
  const schs=[...new Set(av.map(o=>o.s))];
  const tree=schs.map(s=>{
    const open=!dbStep2SchCollapsed[s] || !!dbStep2Kw.trim();
    const schObjs=DB_OBJS.filter(o=>o.s===s);
    const allSel=schObjs.length>0 && schObjs.every(o=>dbStep2Sel.includes(o.n));
    return `<div class="tf-sch ${open?'is-open':'is-collapsed'}" onclick="dbToggleSch('${s}')">
      <i class="tf-caret fa-solid ${open?'fa-chevron-down':'fa-chevron-right'}"></i>
      <input type="checkbox" class="tf-sch-cb" ${allSel?'checked':''} onclick="event.stopPropagation();dbSchAll('${s}')" title="全选/取消全选该 schema">
      <i class="fa-solid fa-folder${open?'-open':''}"></i> schema: <b>${s}</b>
      <span class="sch-cnt">${av.filter(o=>o.s===s).length}</span>
    </div>${open?group(av.filter(o=>o.s===s)):''}`;
  }).join('');
  return `<div class="card">
    <div class="card-h"><h3>选择接入对象 <span class="sub">勾选需接入的表与视图</span></h3></div>
    <div class="transfer">
      <div class="tf-pane">
        <div class="tf-bar">
          <label class="chk-all"><input type="checkbox" ${av.length&&av.every(o=>dbStep2Sel.includes(o.n))?'checked':''} onchange="dbAvAll(this)"> 全选</label>
          <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input id="dbObjSearch" placeholder="搜索表 / 视图" value="${dbStep2Kw}" oninput="dbStep2Kw=this.value;dbStep2Render(true)"></div>
        </div>
        <div class="obj-list tf-avail">
          ${tree}
          ${!av.length?`<div class="tf-empty">无匹配对象</div>`:''}
        </div>
      </div>
      <div class="tf-pane">
        <div class="tf-bar">
          <span class="obj-count">已选 ${selItems.length} 项</span>
          ${selItems.length?`<a class="tf-clear" onclick="dbClearSel()"><i class="fa-solid fa-xmark"></i> 清空已选</a>`:''}
        </div>
        <div class="obj-list tf-seled">
          ${selTree}
          ${!selItems.length?`<div class="tf-empty">尚未选择对象，请从左侧添加</div>`:''}
        </div>
      </div>
    </div>
    <div class="card-b" style="padding-top:0">
      <div class="step2-foot">
        <button class="btn" onclick="selectDbStep(1)"><i class="fa-solid fa-arrow-left"></i>上一步</button>
        <button class="btn primary" onclick="dbConfirm('${src}')"><i class="fa-solid fa-wand-magic-sparkles"></i>确认并同步元数据</button>
      </div>
    </div>
  </div>`;
}
function dbToggleSel(n){ if(dbStep2Sel.includes(n)) dbStep2Sel=dbStep2Sel.filter(x=>x!==n); else dbStep2Sel.push(n); dbStep2Render(); }
function dbToggleSch(s){ dbStep2SchCollapsed[s]=!dbStep2SchCollapsed[s]; dbStep2Render(); }
function dbSchAll(s){
  const schObjs=DB_OBJS.filter(o=>o.s===s);
  const allSel=schObjs.length>0 && schObjs.every(o=>dbStep2Sel.includes(o.n));
  if(allSel){ dbStep2Sel=dbStep2Sel.filter(x=>!schObjs.some(o=>o.n===x)); }
  else { schObjs.forEach(o=>{ if(!dbStep2Sel.includes(o.n)) dbStep2Sel.push(o.n); }); }
  dbStep2Render();
}
function dbClearSel(){ dbStep2Sel=[]; dbStep2Render(); }
function dbAvAll(box){
  const av=dbAvail();
  if(box.checked){ av.forEach(o=>{ if(!dbStep2Sel.includes(o.n)) dbStep2Sel.push(o.n); }); }
  else { av.forEach(o=>{ dbStep2Sel=dbStep2Sel.filter(x=>x!==o.n); }); }
  dbStep2Render();
}
function dbStep2Render(focus){
  const c=document.getElementById('dbStepContent'); if(!c) return;
  c.innerHTML=dbStep2HTML();
  if(focus){ const i=document.getElementById('dbObjSearch'); if(i){ i.focus(); try{ i.setSelectionRange(i.value.length,i.value.length); }catch(e){} } }
}
function dbStep2SrcRe(src){ dbStep2Src=src; dbStep2Sel=[]; dbStep2Kw=''; dbStep2SchCollapsed={}; dbStep2Render(); }
function dbConfirm(src){
  if(dbStep2Sel.length===0){ alert('请至少选择一个表或视图'); return; }
  const items=DB_OBJS.filter(o=>dbStep2Sel.includes(o.n)).map(o=>({n:o.n,t:o.t,f:o.f,status:'pending',sample:null}));
  window._dbIngest={src,items};
  selectDbStep(3);
}
function dbStep3HTML(){
  const d=window._dbIngest;
  if(!d){ return `<div class="card"><div class="empty-soon"><i class="fa-solid fa-arrow-up-right-dots"></i>尚未选择接入对象，请先在「选择表与视图」步骤勾选库表 / 视图</div></div>`; }
  const total=d.items.length;
  const done=d.items.filter(x=>x.status==='completed').length;
  const pct=total?Math.round(done/total*100):0;
  return `<div class="card">
    <div class="card-h"><h3>元数据接入 <span class="sub">采集字段与样本数据</span></h3></div>
    <div class="card-b">
      <div class="ing-head">
        <div><span class="ing-src">${d.src}</span> <span class="ing-total">· 待接入对象 ${total} 个</span></div>
        <div class="ing-prog"><div class="bar"><i style="width:${pct}%"></i></div><span class="pp">${done}/${total}（${pct}%）</span></div>
      </div>
      <div class="ing-list">
        ${d.items.map(o=>{
          const pill=o.status==='completed'?'<span class="pill on"><i class="fa-solid fa-circle-check"></i>已完成</span>'
            :o.status==='processing'?'<span class="pill info"><i class="fa-solid fa-spinner fa-spin"></i>处理中</span>'
            :'<span class="pill pend"><i class="fa-solid fa-circle"></i>待处理</span>';
          const samp=o.status==='completed'?`<span class="samp">采样 ${o.sample} 行</span>`
            :o.status==='processing'?'<span class="samp">采集中…</span>':'';
          return `<div class="ing-row ${o.status==='completed'?'done':''}">
            <span class="oi"><i class="fa-solid ${o.t==='view'?'fa-table-columns':'fa-table'}"></i></span>
            <span class="nm"><b>${o.n}</b><small>${o.d} · ${o.f} 字段</small></span>
            ${samp}${pill}
          </div>`;
        }).join('')}
      </div>
      <div class="ing-foot">
        <div class="ing-tip"><i class="fa-solid fa-circle-info"></i> 接入任务在后台持续执行，您可随时切换至其他页面进行其他操作，不影响元数据接入进度。</div>
        <div class="ing-foot-acts">
          ${d.items.some(x=>x.status!=='completed')?'<button class="btn danger" onclick="dbCancelIngest()"><i class="fa-solid fa-xmark"></i>取消接入</button>':''}
          <button class="btn primary" onclick="dbStartFresh()"><i class="fa-solid fa-plus"></i>接入其他数据库</button>
        </div>
      </div>
    </div>
  </div>`;
}
function dbStep3Render(){
  if(dbCurStep!==3) return;
  const c=document.getElementById('dbStepContent'); if(!c) return;
  c.innerHTML=dbStep3HTML();
}
let dbIngestTimer=null;
function dbRunIngest(){
  const d=window._dbIngest; if(!d) return;
  let i=0;
  if(dbIngestTimer) clearInterval(dbIngestTimer);
  dbIngestTimer=setInterval(()=>{
    if(!window._dbIngest){ clearInterval(dbIngestTimer); dbIngestTimer=null; return; }
    const items=window._dbIngest.items;
    if(i>=items.length){ clearInterval(dbIngestTimer); dbIngestTimer=null; return; }
    const it=items[i];
    if(it.status==='pending'){ it.status='processing'; dbStep3Render(); }
    else if(it.status==='processing'){ it.status='completed'; it.sample=Math.round(it.f*3.4); i++; dbStep3Render(); }
  }, 650);
}
function dbCancelIngest(){
  const src=window._dbIngest?window._dbIngest.src:'';
  if(dbIngestTimer){ clearInterval(dbIngestTimer); dbIngestTimer=null; }
  window._dbIngest=null;
  showToast('已取消接入任务');
  selectDbStep(2, src);
}
function dbStartFresh(){
  if(dbIngestTimer){ clearInterval(dbIngestTimer); dbIngestTimer=null; }
  window._dbIngest=null;
  dbStep2Src=null; dbStep2Sel=[]; dbStep2Kw='';
  dbCurStep=1;
  document.querySelectorAll('#dbSteps .step').forEach(s=>s.classList.toggle('active', +s.dataset.step===1));
  const c=document.getElementById('dbStepContent'); if(c) c.innerHTML=dbStep1HTML();
  window.scrollTo(0,0);
}
function selectDbStep(n, src){
  dbCurStep=n;
  document.querySelectorAll('#dbSteps .step').forEach(s=>s.classList.toggle('active', +s.dataset.step===n));
  const c=document.getElementById('dbStepContent');
  if(!c) return;
  if(n===1){ c.innerHTML=dbStep1HTML(); }
  else if(n===2){ if(src){ dbStep2Src=src; dbStep2Sel=[]; dbStep2Kw=''; } c.innerHTML=dbStep2HTML(); }
  else if(n===3){ c.innerHTML=dbStep3HTML(); dbRunIngest(); }
}

/* ---- 文件数据接入 ---- */
VIEWS.filedata=()=>`
${ph('文件数据接入','支持 Excel 表格与 SHP / GeoJSON 等空间数据文件的批量上传接入，上传后自动创建数据表并生成元数据 ')}
<div class="pipe">
  <div class="step"><div class="si"><i class="fa-solid fa-file-arrow-up"></i></div><b>① 添加文件数据源</b><small>批量上传文件</small></div>
  <div class="step"><div class="si"><i class="fa-solid fa-table"></i></div><b>② 自动建表</b><small>解析结构生成表</small></div>
  <div class="step"><div class="si"><i class="fa-solid fa-wand-magic-sparkles"></i></div><b>③ 生成元数据</b><small>采集字段与样本</small></div>
</div>
<div class="card" style="margin-bottom:20px"><div class="card-b" style="padding:34px">
  <div style="border:2px dashed var(--border);border-radius:14px;padding:44px;text-align:center;color:var(--text-3)">
    <i class="fa-solid fa-cloud-arrow-up" style="font-size:46px;color:var(--accent);margin-bottom:16px"></i>
    <div style="font-size:15px;color:var(--text);margin-bottom:6px">将文件拖拽到此处，或点击选择文件（可批量）</div>
    <div style="font-size:12.5px">支持 Excel(.xlsx/.xls)、CSV、Shapefile(.shp)、GeoJSON · 单文件≤200MB</div>
  </div>
</div></div>
<div class="card"><div class="card-h"><h3>已接入文件数据源</h3></div>
  <div class="tbl-bar">
    <div class="mini-search" style="margin-left:0"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索文件名"></div>
    <div class="tbl-acts" style="margin-left:auto"><button class="btn primary"><i class="fa-solid fa-cloud-arrow-up"></i>上传文件</button></div>
  </div>
  <div class="tbl-wrap"><table>
    <thead><tr><th>文件名</th><th>类型</th><th>解析表名</th><th>行数</th><th>有效期</th><th>状态</th><th>上传时间</th><th>操作</th></tr></thead>
    <tbody>
      ${[
        ['2026年临时用地统计.xlsx','fa-file-excel','#22c55e','tmp_land_2026','2,340','2026-12-31','on'],
        ['地质灾害隐患点.csv','fa-file-csv','#4f8cff','tmp_geo_hazard','856','2026-09-30','on'],
        ['规划分区边界.shp','fa-map','#a78bfa','tmp_plan_zone','128','长期','on'],
        ['耕地占补平衡.xlsx','fa-file-excel','#22c55e','tmp_farmland','1,105','2026-08-15','warn'],
      ].map(r=>`<tr><td><i class="fa-solid ${r[1]}" style="color:${r[2]};margin-right:8px"></i><b>${r[0]}</b></td>
      <td>${r[1].includes('excel')?'Excel':r[1].includes('csv')?'CSV':'Shapefile'}</td>
      <td class="mono">${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td>
      <td>${r[6]==='on'?'<span class="pill on">有效</span>':'<span class="pill warn">即将过期</span>'}</td>
      <td style="color:var(--text-3)">2026-07-2${Math.floor(Math.random()*4)}</td>
      <td><div class="act"><a title="预览"><i class="fa-solid fa-eye"></i></a><a title="替换"><i class="fa-solid fa-repeat"></i></a><a class="del"><i class="fa-solid fa-trash"></i></a></div></td></tr>`).join('')}
    </tbody>
  </table></div>
</div>`;

/* ---- 元数据管理 ---- */
/* ---- 元数据：样例数据源与表结构 ---- */
const META_SRCS=[
  { name:'规划审批库', icon:'fa-database', type:'PostgreSQL', host:'192.0.2.5:5432', db:'demo_approval', account:'demo_reader_08', en:'on',
    tables:[
      { n:'demo_t_approval_project', cn:'用地审批项目主表', t:'table', st:'ok', s:'public', rows:1286,
        desc:'记录用地审批项目的全生命周期核心信息，覆盖立项、申报、审查、批复等关键环节，是规划审批业务的主数据来源。',
        fields:[
          {n:'proj_id',cn:'项目编号',type:'varchar(32)',desc:'项目唯一标识，业务系统主键',enum:'—',mask:'—',method:'人工确认',fk:'0',uniq:'1',nullable:'0'},
          {n:'proj_name',cn:'项目名称',type:'varchar(128)',desc:'审批项目正式名称',enum:'—',mask:'—',method:'人工确认'},
          {n:'apply_unit',cn:'申报单位',type:'varchar(128)',desc:'提出用地申请的单位名称',enum:'—',mask:'—',method:'AI 补全'},
          {n:'land_area',cn:'用地面积(㎡)',type:'numeric(12,2)',desc:'申请用地的总面积（平方米）',enum:'—',mask:'—',method:'人工确认'},
          {n:'status',cn:'审批状态',type:'smallint',desc:'项目当前所处审批阶段',enum:'草稿/受理/审查/批复/归档',mask:'—',method:'AI 补全'},
          {n:'approval_date',cn:'批复日期',type:'date',desc:'主管部门批复文件签发日期',enum:'—',mask:'—',method:'人工确认'},
        ],
        sample:{ head:['proj_id','proj_name','apply_unit','land_area','status','approval_date'],
          rows:[
            ['P20240001','示例项目01','示例单位01','125.60','批复','2024-03-12'],
            ['P20240002','示例项目02','示例单位02','88.30','审查','2024-05-09'],
            ['P20240003','示例项目03','示例单位03','23.15','受理','—'],
          ]} },
      { n:'demo_t_approval_flow', cn:'审批流程记录表', t:'table', st:'ok', s:'public', rows:5120,
        desc:'记录每个审批项目在各流转节点的处理情况，用于追踪审批进度与经办责任。',
        fields:[
          {n:'flow_id',cn:'流程编号',type:'varchar(32)',desc:'审批流转节点唯一标识',enum:'—',mask:'—',method:'人工确认',fk:'0',uniq:'1',nullable:'0'},
          {n:'proj_id',cn:'项目编号',type:'varchar(32)',desc:'关联审批项目',enum:'—',mask:'—',method:'人工确认',fk:'1',uniq:'0',nullable:'0'},
          {n:'node_name',cn:'',desc:'',type:'varchar(64)',enum:'受理/处室审查/会签/批复',mask:'—',method:'待补全'},
          {n:'handler',cn:'',desc:'',type:'varchar(32)',enum:'—',mask:'—',method:'待补全'},
          {n:'handle_time',cn:'处理时间',type:'datetime',desc:'节点处理完成时间',enum:'—',mask:'—',method:'人工确认'},
        ],
        sample:{ head:['flow_id','proj_id','node_name','handler','handle_time'],
          rows:[
            ['F240001','P20240001','批复','演示审核01','2024-03-12 09:20'],
            ['F240002','P20240002','处室审查','演示经办02','2024-05-09 14:30'],
            ['F240003','P20240003','受理','演示经办01','2024-06-01 10:05'],
          ]} },
      { n:'demo_v_project_summary', cn:'项目汇总视图', t:'view', st:'ok', s:'report', rows:1286,
        desc:'基于审批项目主表与流程表聚合的轻量汇总视图，便于看板快速读取进度。',
        fields:[
          {n:'proj_id',cn:'项目编号',type:'varchar(32)',desc:'项目标识',enum:'—',mask:'—',method:'人工确认',fk:'1',uniq:'0',nullable:'0'},
          {n:'proj_name',cn:'项目名称',type:'varchar(128)',desc:'项目名称',enum:'—',mask:'—',method:'人工确认'},
          {n:'total_area',cn:'总用地面积',type:'numeric(14,2)',desc:'累计用地面积',enum:'—',mask:'—',method:'AI 补全'},
          {n:'progress',cn:'进度',type:'varchar(16)',desc:'项目整体进度',enum:'进行中/已完成',mask:'—',method:'AI 补全'},
        ],
        sample:{ head:['proj_id','proj_name','total_area','progress'],
          rows:[
            ['P20240001','示例项目01','125.60','已完成'],
            ['P20240002','示例项目02','88.30','进行中'],
            ['P20240003','示例项目03','23.15','进行中'],
          ]} },
    ]},
  { name:'不动产登记库', icon:'fa-database', type:'MySQL', host:'192.0.2.6:3306', db:'demo_registry', account:'demo_reader_09', en:'on',
    tables:[
      { n:'demo_t_owner_info', cn:'权利人信息表', t:'table', st:'ok', s:'core', rows:9843,
        desc:'存储不动产权利人基础信息，包含身份与联系方式，敏感字段已配置脱敏。',
        fields:[
          {n:'owner_id',cn:'权利人编号',type:'varchar(32)',desc:'权利人唯一标识',enum:'—',mask:'—',method:'人工确认',fk:'0',uniq:'1',nullable:'0'},
          {n:'owner_name',cn:'权利人姓名',type:'varchar(64)',desc:'不动产权利人姓名',enum:'—',mask:'—',method:'人工确认'},
          {n:'id_card',cn:'身份证号',type:'varchar(18)',desc:'权利人身份证号码',enum:'—',mask:'证件号脱敏',method:'人工确认'},
          {n:'owner_phone',cn:'联系电话',type:'varchar(20)',desc:'权利人联系电话',enum:'—',mask:'手机号脱敏',method:'人工确认'},
          {n:'parcel_id',cn:'关联地块',type:'varchar(32)',desc:'关联地块编号',enum:'—',mask:'—',method:'AI 补全'},
        ],
        sample:{ head:['owner_id','owner_name','id_card','owner_phone','parcel_id'],
          rows:[
            ['O0001','演示用户34','0000**********0000','000****0000','P20240001'],
            ['O0002','演示用户19','0000**********0000','000****0000','P20240002'],
            ['O0003','演示用户37','0000**********0000','000****0000','P20240003'],
          ]} },
      { n:'demo_t_land_parcel', cn:'地块信息表', t:'table', st:'missing', s:'parcel', rows:0,
        desc:'记录不动产单元对应的地块空间与规划属性，是登记发证的核心底表。',
        fields:[
          {n:'parcel_id',cn:'地块编号',type:'varchar(32)',desc:'地块唯一标识',enum:'—',mask:'—',method:'人工确认'},
          {n:'parcel_addr',cn:'坐落地址',type:'varchar(256)',desc:'地块地理位置',enum:'—',mask:'—',method:'AI 补全'},
          {n:'land_use',cn:'土地用途',type:'varchar(32)',desc:'地块规划用途',enum:'居住/商业/工业/公服',mask:'—',method:'AI 补全'},
          {n:'area',cn:'占地面积(㎡)',type:'numeric(12,2)',desc:'地块占地面积',enum:'—',mask:'—',method:'人工确认'},
          {n:'coord_x',cn:'经度',type:'numeric(10,6)',desc:'地块中心点经度',enum:'—',mask:'—',method:'人工确认'},
        ],
        sample:{ head:['parcel_id','parcel_addr','land_use','area','coord_x'],
          rows:[
            ['P20240001','示例01区示例路1号','居住','125.60','0.2112'],
            ['P20240002','示例02区示例路2号','工业','88.30','0.2555'],
            ['P20240003','示例03区示例路3号','商业','23.15','0.1333'],
          ]} },
    ]},
  { name:'国土空间规划库', icon:'fa-earth-asia', type:'PostGIS', host:'192.0.2.9:5432', db:'demo_spatial', account:'demo_reader_10', en:'stop',
    tables:[
      { n:'demo_t_land_use_plan', cn:'土地利用规划表', t:'table', st:'ok', s:'plan', rows:365,
        desc:'存储国土空间规划单元的用地类型、面积与编制年份，支撑规划指标核算。',
        fields:[
          {n:'plan_id',cn:'规划编号',type:'varchar(32)',desc:'规划单元唯一标识',enum:'—',mask:'—',method:'人工确认'},
          {n:'plan_name',cn:'规划名称',type:'varchar(128)',desc:'国土空间规划单元名称',enum:'—',mask:'—',method:'人工确认'},
          {n:'land_type',cn:'用地类型',type:'varchar(32)',desc:'主导用地类型',enum:'生态/农业/城镇',mask:'—',method:'AI 补全'},
          {n:'plan_area',cn:'规划面积(㎡)',type:'numeric(14,2)',desc:'规划单元总面积',enum:'—',mask:'—',method:'人工确认'},
          {n:'pub_year',cn:'编制年份',type:'smallint',desc:'规划编制年度',enum:'—',mask:'—',method:'人工确认'},
        ],
        sample:{ head:['plan_id','plan_name','land_type','plan_area','pub_year'],
          rows:[
            ['LUP01','中心城区单元','城镇','1560.00','2023'],
            ['LUP02','西部生态单元','生态','3200.00','2023'],
            ['LUP03','东部农业单元','农业','4100.00','2024'],
          ]} },
      { n:'demo_v_parcel_stats', cn:'地块统计视图', t:'view', st:'noperm', s:'plan', rows:0,
        desc:'按规划单元聚合地块数量与面积指标，供规划评估看板调用。',
        fields:[
          {n:'plan_id',cn:'规划编号',type:'varchar(32)',desc:'所属规划单元',enum:'—',mask:'—',method:'人工确认'},
          {n:'parcel_cnt',cn:'',desc:'',type:'integer',enum:'—',mask:'—',method:'待补全'},
          {n:'total_area',cn:'地块总面积',type:'numeric(14,2)',desc:'单元内地块面积合计',enum:'—',mask:'—',method:'AI 补全'},
          {n:'avg_area',cn:'',desc:'',type:'numeric(12,2)',enum:'—',mask:'—',method:'待补全'},
        ],
        sample:{ head:['plan_id','parcel_cnt','total_area','avg_area'],
          rows:[
            ['LUP01','128','1560.00','12.19'],
            ['LUP02','64','3200.00','50.00'],
            ['LUP03','90','4100.00','45.56'],
          ]} },
    ]},
];
/* 为每个数据表补充「最新元数据采集时间」（原型演示数据，按表序号确定性生成） */
(function(){
  const base=new Date(2026,7,14,9,12); // 2026-08-14 09:12
  const pad=n=>String(n).padStart(2,'0');
  META_SRCS.forEach((s,si)=>{
    if(!s.tables) return;
    s.tables.forEach((t,ti)=>{
      if(t.collectTime) return;
      const d=new Date(base.getTime()-(si*11+ti*5)*36e5);
      t.collectTime=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    });
  });
})();
let metaMode='tree';                       // 'card' | 'tree'
let metaSrc=-1, metaLevel=1, metaTbl=-1;   // 卡片层级视图导航状态
let metaCardKw='';                         // 数据源视图关键字搜索
let metaTblKw='';                          // 数据表视图（第二级）关键字搜索
let metaTreeSrc=0, metaTreeTbl=0, metaTreeOpen=new Set([0]), metaTreeKw='', metaTreeSchCollapsed=new Set();  // 目录树视图状态（schema 折叠用 Set 记录已折叠项）
let metaTab='fields';                       // 详情页 tab：'desc' | 'fields' | 'sample'
let metaAiPending=false, metaAiBuf=[];      // AI 补全：待确认建议缓冲
let metaEnumCtx=null, metaMaskCtx=null;     // 枚举 / 脱敏设置窗口上下文 {si,ti,fi}
let metaSnap=null;                          // 当前表「干净状态」快照（首次编辑前采集），用于脏检测与放弃还原
let metaDirty=false;                        // 当前表是否存在未保存修改
let _metaLeaveProceed=null;                 // 离开守卫：确认后继续执行的导航回调

function metaToggleHTML(){
  return `<div class="meta-toggle">
    <button class="seg ${metaMode==='card'?'on':''}" onclick="metaSetMode('card')"><i class="fa-solid fa-table-cells-large"></i> 卡片层级视图</button>
    <button class="seg ${metaMode==='tree'?'on':''}" onclick="metaSetMode('tree')"><i class="fa-solid fa-diagram-project"></i> 目录树视图</button>
  </div>`;
}

VIEWS.metadata=()=>`
${ph('元数据管理','统一元数据视图 · 按数据源浏览 · 字段枚举与脱敏配置 · 样本数据预览', metaToggleHTML())}
${metaMode==='card'?metaCardHTML():metaTreeHTML()}
`;
function metaDescTab(t){
  const total=t.fields.length;
  const comp=t.fields.filter(f=>f.desc && f.desc!=='—' && f.method!=='待补全').length;
  const samp=t.sample?t.sample.rows.length:0;
  const actual=(t.st && t.st!=='ok')?null:(t.rows||0);
  return `<div class="meta-edit">
      <div class="form-field full" style="margin-bottom:10px">
        <label>表中文名称 <span class="dirty-mark" id="metaCnMark" style="display:${metaDescDirty('cn')?'inline':'none'}">● 已修改</span></label>
        <input id="metaCnEdit" value="${escHtml(t.cn)}" placeholder="请输入表中文名称" oninput="metaDescInput()">
      </div>
      <div class="form-field full" style="margin-bottom:8px">
        <label>表描述 <span class="dirty-mark" id="metaDescMark" style="display:${metaDescDirty('desc')?'inline':'none'}">● 已修改</span></label>
        <textarea id="metaDescEdit" style="min-height:72px" placeholder="请输入表描述" oninput="metaDescInput()">${escHtml(t.desc)}</textarea>
      </div>
    </div>
  <div class="meta-stats" style="margin-top:16px">
    <div class="ms"><span class="ms-k">字段总数</span><span class="ms-v">${total}</span></div>
    <div class="ms"><span class="ms-k">信息完整字段</span><span class="ms-v">${comp}<span class="sm">/ ${total}</span></span></div>
    <div class="ms"><span class="ms-k">实际数据行数</span><span class="ms-v">${actual===null?'<span class="sm">无法实时统计</span>':actual.toLocaleString()}</span></div>
    <div class="ms"><span class="ms-k">采集样本行数</span><span class="ms-v">${samp}<span class="sm">条</span></span></div>
  </div>`;
}
function metaFieldsHTML(t){
  const pending = metaAiPending && metaAiBuf.length===t.fields.length;
  const bar = pending
    ? `<div class="ai-bar pending"><i class="fa-solid fa-wand-magic-sparkles"></i><span>AI 将仅补全缺失字段的中文名称与业务含义，已填写内容保持不变，请核对后保存确认</span><span class="ai-actions"><button class="edt-btn ok" onclick="metaAiConfirm()">保存确认</button><button class="edt-btn" onclick="metaAiCancel()">放弃修改</button></span></div>`
    : `<div class="ai-bar"><i class="fa-solid fa-wand-magic-sparkles"></i><span>可由 AI 根据字段名、字段类型以及采样数据自动补全字段缺失信息（仅限中文名称 / 业务含义）</span><span class="ai-actions"><button class="edt-btn ok" onclick="metaAiFill()">AI 补全</button></span></div>`;
  return `<div class="tbl-wrap">${bar}<table>
    <thead><tr><th>字段名</th><th>类型</th><th>中文名称 <span class="th-hint">移入行可编辑</span></th><th>业务含义 <span class="th-hint">移入行可编辑</span></th><th>是否唯一字段</th><th>是否外键字段</th><th>允许为空字段</th><th>是否枚举字段</th><th>是否脱敏字段</th></tr></thead>
    <tbody>${t.fields.map((f,fi)=>{
      const buf = pending?metaAiBuf[fi]:null;
      const enumOn = (buf&&buf.enum) || (f.enum!=='—');
      const maskOn = (buf&&buf.mask) || (f.mask!=='—');
      const fkOn   = (buf&&buf.fk)   || (f.fk==='1');
      const uniqOn = (buf&&buf.uniq) || (f.uniq==='1');
      const nullOn = (buf&&buf.nullable) || (f.nullable!=='0');
      const enumCur=f.enum!=='—', maskCur=f.mask!=='—', fkCur=f.fk==='1', uniqCur=f.uniq==='1', nullCur=f.nullable!=='0';
      const enumLink = (!pending && f.enum && f.enum!=='—' && f.enum!=='已配置')?`<button class="lnk-btn" onclick="metaToggleEnum(${fi},true)">枚举值</button>`:'';
      const maskLink = (!pending && f.mask && f.mask!=='—' && f.maskRule)?`<button class="lnk-btn" onclick="metaToggleMask(${fi},true)">脱敏规则</button>`:'';
      const sw = (on,onToggle)=> pending
        ? `<label class="sw"><input type="checkbox" ${on?'checked':''} disabled></label>`
        : `<label class="sw"><input type="checkbox" ${on?'checked':''} onchange="${onToggle}"></label>`;
      const enumNew = pending && enumOn && !enumCur, maskNew = pending && maskOn && !maskCur,
            fkNew = pending && fkOn && !fkCur, uniqNew = pending && uniqOn && !uniqCur, nullNew = pending && nullOn && !nullCur;
      return `<tr>
        <td class="mono"><b>${f.n}</b></td>
        <td class="mono" style="color:var(--accent-2)">${f.type}</td>
        ${metaFieldCell(fi,f,'cn','中文名称',buf,pending)}
        ${metaFieldCell(fi,f,'desc','业务含义',buf,pending)}
        <td class="ctr ${uniqNew?'ai-new':''}">${pending?'':(metaFldDirty(fi,'uniq')?'<span class="dirty-badge">已修改</span>':'')}${sw(uniqOn,`metaToggleUniq(${fi},this.checked)`)}</td>
        <td class="ctr ${fkNew?'ai-new':''}">${pending?'':(metaFldDirty(fi,'fk')?'<span class="dirty-badge">已修改</span>':'')}${sw(fkOn,`metaToggleFk(${fi},this.checked)`)}</td>
        <td class="ctr ${nullNew?'ai-new':''}">${pending?'':(metaFldDirty(fi,'nullable')?'<span class="dirty-badge">已修改</span>':'')}${sw(nullOn,`metaToggleNullable(${fi},this.checked)`)}</td>
        <td class="ctr ${enumNew?'ai-new':''}">${pending?'':(metaFldDirty(fi,'enum')?'<span class="dirty-badge">已修改</span>':'')}${sw(enumOn,`metaToggleEnum(${fi},this.checked)`)}${enumLink}</td>
        <td class="ctr ${maskNew?'ai-new':''}">${pending?'':(metaFldDirty(fi,'mask')?'<span class="dirty-badge">已修改</span>':'')}${sw(maskOn,`metaToggleMask(${fi},this.checked)`)}${maskLink}</td>
      </tr>`;}).join('')}</tbody></table></div>`;
}
/* 表字段：可编辑单元格（中文名称 / 业务含义）—— 移入行显示编辑图标，点击就地编辑 */
function metaFieldCell(fi,f,key,label,ovl,pending){
  if(pending){
    const cur=(f[key]||'').trim();
    const has=!!cur;
    const v=has?cur:((ovl&&ovl[key])||'');
    const isNew=!has && !!(ovl&&ovl[key]);
    return `<td class="edt-cell${isNew?' ai-new':''}"><span class="edt-txt">${v?escHtml(v):'<i class="edt-ph">未填写</i>'}</span></td>`;
  }
  const val=f[key]||'';
  const txt=val?escHtml(val):'<i class="edt-ph">未填写</i>';
  const badge=metaFldDirty(fi,key)?'<span class="dirty-badge">已修改</span>':'';
  return `<td class="edt-cell">${badge}<span class="edt-txt">${txt}</span><i class="fa-solid fa-pen edt-ic" title="编辑${label}" onclick="metaFieldEdit(${fi},'${key}',this)"></i></td>`;
}
function metaFieldEdit(fi,key,icEl){
  const c=metaCurTable(); if(!c.t) return;
  const td=icEl.closest('td'); if(!td) return;
  const cur=c.t.fields[fi][key]||'';
  const multiline=key==='desc';
  const ph=key==='desc'?'请输入业务含义':'请输入中文名称';
  const inp = multiline
    ? `<textarea class="edt-input" rows="2" placeholder="${ph}" onblur="metaFieldSave(${fi},'${key}',this)">${escHtml(cur)}</textarea>`
    : `<input class="edt-input" type="text" value="${escHtml(cur)}" placeholder="${ph}" onblur="metaFieldSave(${fi},'${key}',this)" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}">`;
  td.innerHTML=`<div class="edt-box">${inp}<div class="edt-hint">编辑后失焦自动保存</div></div>`;
  const el=td.querySelector('.edt-input'); if(el){ el.focus(); if(el.select) el.select(); }
}
function metaFieldSave(fi,key,inpEl){
  const c=metaCurTable(); if(!c.t) return;
  const td=inpEl.closest('td'); if(!td) return;
  const val=inpEl.value.trim();
  if(key==='cn' && !val){ showToast('中文名称不能为空'); return; }
  metaEnsureSnapshot();
  const f=c.t.fields[fi];
  f[key]=val;
  metaRefreshDirty();
  metaTabSwitch('fields');
}
/* 表字段：AI 补全（生成建议，需用户保存确认） */
function metaAiSuggest(f){
  const map={id:['编号','记录的唯一标识'],name:['名称','业务对象的名称'],unit:['单位','所属单位名称'],area:['面积','相关面积数值'],date:['日期','业务发生的日期'],status:['状态','当前业务状态'],time:['时间','业务发生时间'],type:['类型','业务分类'],code:['编码','标准编码值'],no:['编号','顺序编号'],addr:['地址','地理位置地址'],person:['人员','相关人员'],user:['用户','操作用户'],create:['创建','记录创建信息'],update:['更新','记录更新信息'],remark:['备注','补充说明'],desc:['描述','详细描述'],amount:['数量','数量或金额'],count:['数量','统计数量'],total:['总计','合计值'],phone:['电话','联系电话'],money:['金额','涉及金额'],price:['单价','单位价格'],title:['标题','标题文本'],content:['内容','主要内容'],level:['级别','等级划分'],sort:['排序','排序序号'],flag:['标志','状态标志'],is:['是否','布尔标识'],has:['是否','布尔标识'],org:['机构','相关机构'],dept:['部门','所属部门'],manager:['负责人','业务负责人'],region:['区域','所属区域'],batch:['批次','业务批次'],year:['年度','所属年度'],month:['月度','所属月份']};
  const parts=String(f.n).toLowerCase().split('_');
  let cn=[],ds=[];
  parts.forEach(p=>{ if(map[p]){ cn.push(map[p][0]); ds.push(map[p][1]); } });
  if(!cn.length){ cn=[f.n]; ds=['由 AI 根据字段名推断的业务含义，请核对。']; }
  /* AI 自动补全仅针对字段的中文名称与业务含义两个信息 */
  return { cn:cn.join(''), desc:`${ds.join('，')}` };
}
function metaAiFill(){
  const c=metaCurTable(); if(!c.t) return;
  metaAiBuf=c.t.fields.map(f=>metaAiSuggest(f));
  metaAiPending=true;
  metaTabSwitch('fields');
}
function metaAiConfirm(){
  const c=metaCurTable(); if(!c.t){ metaAiPending=false; metaAiBuf=[]; return; }
  if(metaAiBuf.length!==c.t.fields.length){ metaAiPending=false; metaAiBuf=[]; metaTabSwitch('fields'); return; }
  c.t.fields.forEach((f,i)=>{
    const s=metaAiBuf[i];
    if(!f.cn || !f.cn.trim()){ if(s.cn) f.cn=s.cn; }                       // 仅补全缺失的中文名称
    if(!f.desc || !f.desc.trim()){ if(s.desc) f.desc=s.desc; }            // 仅补全缺失的业务含义
  });
  metaAiPending=false; metaAiBuf=[];
  metaTabSwitch('fields');
  showToast('已保存 AI 补全结果');
}
function metaAiCancel(){
  metaAiPending=false; metaAiBuf=[];
  metaTabSwitch('fields');
  showToast('已放弃 AI 补全建议');
}
/* 重新采集元数据（顶部按钮，模拟采集中…） */
function metaReCollect(btnEl){
  if(btnEl){
    btnEl.disabled=true;
    const old=btnEl.innerHTML;
    btnEl.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> 采集中…';
    showToast('正在重新采集元数据…');
    setTimeout(()=>{ btnEl.disabled=false; btnEl.innerHTML=old; showToast('元数据已重新采集完成'); },1300);
  } else {
    showToast('正在重新采集元数据…');
    setTimeout(()=>showToast('元数据已重新采集完成'),1300);
  }
}
/* 样本数据：重新采集（模拟抽取样本） */
function metaReSample(btnEl){
  if(btnEl){
    btnEl.disabled=true;
    const old=btnEl.innerHTML;
    btnEl.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> 抽取中…';
    showToast('正在重新采集样本数据…');
    setTimeout(()=>{ btnEl.disabled=false; btnEl.innerHTML=old; showToast('样本数据已重新采集完成'); },1300);
  } else {
    showToast('正在重新采集样本数据…');
    setTimeout(()=>showToast('样本数据已重新采集完成'),1300);
  }
}
function metaSampleHTML(t){
  if(!t.sample) return '<div class="desc" style="color:var(--text-3)">暂无样本数据</div>';
  const bar=`<div class="ai-bar"><i class="fa-solid fa-database"></i><span>抽取表内真实样本数据，用于校验字段类型与业务含义</span><span class="ai-actions"><button class="edt-btn ok" onclick="metaReSample()"><i class="fa-solid fa-arrows-rotate" style="margin-right:4px"></i>重新采集</button></span></div>`;
  return `${bar}<div class="tbl-wrap"><table>
    <thead><tr>${t.sample.head.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${t.sample.rows.map(r=>`<tr>${r.map(c=>`<td class="mono">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div style="margin-top:10px;font-size:12.5px;color:var(--text-3)">共采集 ${t.sample.rows.length} 条样本数据</div>`;
}
function metaDetailHTML(t){
  const warn = t.st && t.st!=='ok'
    ? `<div class="meta-warn ${t.st==='missing'?'miss':'perm'}"><i class="fa-solid ${t.st==='missing'?'fa-triangle-exclamation':'fa-lock'}"></i>
        <span>${t.st==='missing'?'该表在数据源中不存在，下方为历史采集的元数据快照，暂不可实时查询':'当前账号无该表的查询权限，仅展示已采集元数据，样本数据可能非最新'}</span></div>`
    : '';
  const body = metaTab==='desc'?metaDescTab(t):metaTab==='fields'?metaFieldsHTML(t):metaSampleHTML(t);
  return `<div class="tbl-detail">
    ${warn}
    <div class="meta-coll-time"><i class="fa-regular fa-clock"></i> 最新元数据采集时间：<b>${t.collectTime||'—'}</b></div>
    <div class="meta-tabs">
      <button class="mtab ${metaTab==='desc'?'on':''}" onclick="metaTabSwitch('desc')">表描述</button>
      <button class="mtab ${metaTab==='fields'?'on':''}" onclick="metaTabSwitch('fields')">表字段</button>
      <button class="mtab ${metaTab==='sample'?'on':''}" onclick="metaTabSwitch('sample')">样本数据</button>
    </div>
    ${body}
  </div>`;
}
function metaSrcStats(s){
  let total=s.tables.length, done=0, valid=0;
  s.tables.forEach(t=>{
    if(t.st==='ok'||t.st==='noperm') done++;   // 元数据已采集（含仅有快照权限）
    if(t.st==='ok') valid++;                    // 可正常查询的有效接入对象
  });
  return {total, done, valid};
}
function metaSrcFiltered(kw){
  const k=(kw||'').trim().toLowerCase();
  return META_SRCS.filter(s=>!k || s.name.toLowerCase().includes(k) || s.type.toLowerCase().includes(k) || s.host.toLowerCase().includes(k) || (s.db||'').toLowerCase().includes(k) || (s.account||'').toLowerCase().includes(k));
}
function metaTblFiltered(s,kw){
  const k=(kw||'').trim().toLowerCase();
  return s.tables.map((t,ti)=>({t,ti})).filter(({t})=> !k || t.n.toLowerCase().includes(k) || t.cn.toLowerCase().includes(k));
}
function metaNum(n){ return (n||0).toLocaleString('en-US'); }
function metaTblCardsHTML(list){
  return list.map(({t,ti})=>{
    const doneFields=(t.fields||[]).filter(f=>(f.cn&&f.cn.trim())&&(f.desc&&f.desc.trim())).length;
    const sampleRows=(t.sample&&t.sample.rows)?t.sample.rows.length:0;
    return `<div class="tbl-card" onclick="metaOpenTbl(${ti})">
      <div class="tc-head">
        <div class="tc-ic"><i class="fa-solid ${t.t==='view'?'fa-table-columns':'fa-table'}"></i></div>
        <div class="tc-name-block">
          <div class="tc-n">${t.n}</div>
          <div class="tc-cn">${t.cn}</div>
        </div>
        <span class="type-badge ${t.t==='view'?'view':''}">${t.t==='view'?'视图':'表'}</span>
      </div>
      <div class="tc-meta">
        <div class="tc-desc">${t.desc||'—'}</div>
        <div class="tc-stats-bar">
          <div class="tc-stat"><b>${doneFields}</b><span>已补全</span></div>
          <div class="tc-stat"><b>${t.fields.length}</b><span>总字段</span></div>
          <div class="tc-stat"><b>${metaNum(t.rows)}</b><span>行数</span></div>
          <div class="tc-stat"><b>${sampleRows}</b><span>采样</span></div>
        </div>
      </div>
    </div>`;
  }).join('');
}
function metaCardBodyHTML(kw){
  const list=metaSrcFiltered(kw);
  if(!list.length) return `<div class="tree-empty"><i class="fa-solid fa-magnifying-glass fa-2x"></i><div>未找到匹配的数据源</div></div>`;
  return `<div class="src-card-grid">${list.map(s=>{ const i=META_SRCS.indexOf(s); const st=metaSrcStats(s); return `<div class="src-card" onclick="metaOpenSrc(${i})">
        <div class="sc-head">
          <div class="sc-ic"><i class="fa-solid ${s.icon}"></i></div>
          <div class="sc-name-block">
            <div class="sc-name">${s.name}</div>
          </div>
          <span class="type-badge">${s.type}</span>
        </div>
        <div class="sc-meta">
          <div class="sc-sub">${s.host} · ${s.db} · ${s.account||'—'}</div>
          <div class="sc-stats-bar">
            <div class="sc-stat"><b>${st.total}</b><span>接入对象总数</span></div>
            <div class="sc-stat"><b>${st.done}</b><span>元数据已补全</span></div>
            <div class="sc-stat"><b>${st.valid}</b><span>有效接入对象</span></div>
          </div>
        </div>
      </div>`;}).join('')}</div>`;
}
function metaCardFilter(v){ metaCardKw=v; const el=document.getElementById('metaCardWrap'); if(el) el.innerHTML=metaCardBodyHTML(v); const c=document.getElementById('metaSrcCount'); if(c) c.textContent='共 '+metaSrcFiltered(v).length+' 个数据源'; }
function metaTblFilter(v){ metaTblKw=v; const s=META_SRCS[metaSrc]; if(!s) return; const list=metaTblFiltered(s,metaTblKw); const wrap=document.getElementById('metaTblWrap'); if(wrap) wrap.innerHTML=metaTblCardsHTML(list); const c=document.getElementById('metaTblCount'); if(c) c.textContent='共 '+list.length+' 个数据表'; }
function metaCardHTML(){
  if(metaLevel===1){
    return `<div class="meta-breadcrumb" style="justify-content:space-between;flex-wrap:wrap">
      <span class="cur"><i class="fa-solid fa-house"></i> 数据源</span>
      <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索数据源名称 / 类型 / 地址 / 库名 / 账号" value="${metaCardKw}" oninput="metaCardFilter(this.value)"></div>
    </div>
    <div class="src-count" id="metaSrcCount" style="margin:0 0 14px">共 ${metaSrcFiltered(metaCardKw).length} 个数据源</div>
    <div id="metaCardWrap">${metaCardBodyHTML(metaCardKw)}</div>`;
  }
  if(metaLevel===2){
    const s=META_SRCS[metaSrc];
    const list=metaTblFiltered(s,metaTblKw);
    return `<div class="meta-breadcrumb" style="justify-content:space-between;flex-wrap:wrap">
      <span class="crumbs" style="display:inline-flex;align-items:center;gap:8px"><a onclick="metaBack(1)"><i class="fa-solid fa-house"></i> 数据源</a><span class="sep">/</span><span class="cur">${s.name}</span></span>
      <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索表名 / 表中文名" value="${metaTblKw}" oninput="metaTblFilter(this.value)"></div>
    </div>
    <div class="src-count" id="metaTblCount" style="margin:0 0 14px">共 ${list.length} 个数据表</div>
    <div id="metaTblWrap" class="tbl-card-grid">${metaTblCardsHTML(list)}</div>`;
  }
  const s=META_SRCS[metaSrc], t=s.tables[metaTbl];
  return `<div class="meta-breadcrumb">
      <a onclick="metaBack(1)"><i class="fa-solid fa-house"></i> 数据源</a><span class="sep">/</span>
      <a onclick="metaBack(2)">${s.name}</a><span class="sep">/</span>
      <span class="cur">${t.cn}</span></div>
    <div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>
        <h2 style="margin:0;font-size:19px;display:inline-block">${t.cn} <span class="mono" style="font-size:13px;color:var(--text-3);font-weight:400">${t.n}</span></h2>
        <span class="type-badge ${t.t==='view'?'view':''}" style="margin-left:8px">${t.t==='view'?'视图':'表'}</span>
      </div>
      <div class="head-btns">
        <button class="meta-rcol" onclick="metaReCollect(this)"><i class="fa-solid fa-arrows-rotate"></i> 重新采集元数据</button>
        <button class="meta-save-all" id="metaSaveAllBtn" style="display:${metaDirty?'inline-flex':'none'}" onclick="metaCommitEdits()"><i class="fa-solid fa-floppy-disk"></i> 保存修改</button>
      </div>
    </div>
    <div id="metaDetailBody">${metaDetailHTML(t)}</div>`;
}
function metaObjStatus(st){
  if(st==='ok') return '';   // 状态正常：鼠标移入也不显示「正常」文字
  const m={missing:['表不存在','miss'],noperm:['无查询权限','perm']};
  const x=m[st]||m.missing;
  return `<span class="tt-hint ${x[1]}">${x[0]}</span>`;
}
function metaTblComplete(t){
  if(!t.desc || !t.desc.trim()) return false;
  return (t.fields||[]).every(f => (f.cn&&f.cn.trim()) && (f.desc&&f.desc.trim()));
}
function metaTblDoneBadge(t){
  const ok=metaTblComplete(t);
  return ok
    ? `<span class="meta-done ok" title="元数据已补充完整"><i class="fa-solid fa-circle-check mk-ic "></i></span>`
    : `<span class="meta-done todo" title="元数据待补充完整（表中文名 / 字段业务说明缺失）"><i class="fa-solid fa-circle-exclamation  mk-ic"></i></span>`;
}
function metaTreeListHTML(){
  const kw=metaTreeKw.trim().toLowerCase();
  return META_SRCS.map((s,si)=>{
    const open = !!kw || metaTreeOpen.has(si);
    // 按 schema 分组（保留原始索引 ti 供 metaTreePick 使用）
    const order=[], bySch={};
    s.tables.forEach((t,ti)=>{
      if(kw && !(t.n.toLowerCase().includes(kw)||t.cn.toLowerCase().includes(kw))) return;
      if(!(t.s in bySch)){ bySch[t.s]=[]; order.push(t.s); }
      bySch[t.s].push({t,ti});
    });
    const schsHTML = order.map(sch=>{
      const key=si+'::'+sch;
      const schOpen = !!kw || !metaTreeSchCollapsed.has(key);
      const items = bySch[sch].map(({t,ti})=>`<div class="tree-tbl st-${t.st} ${si===metaTreeSrc&&ti===metaTreeTbl?'on':''}" onclick="metaTreePick(${si},${ti})">
        <i class="fa-solid ${t.t==='view'?'fa-table-columns':'fa-table'} tt-ic"></i><span class="mono tt-name">${t.n}</span>${metaTblDoneBadge(t)}${metaObjStatus(t.st)}</div>`).join('');
      return `<div class="tree-sch ${schOpen?'open':''}">
        <div class="sch-head" onclick="metaTreeSchToggle(${si},'${sch}')">
          <i class="fa-solid fa-caret-right sch-caret"></i>
          <i class="fa-solid fa-folder sch-ic"></i><span class="sch-name">${sch}</span>
          <span class="sch-count">${bySch[sch].length}</span>
        </div>
        <div class="tree-tbls">${items}</div>
      </div>`;
    }).join('');
    const list = `<div class="tree-schs">${order.length?schsHTML:`<div class="tree-tbl" style="color:var(--text-3);cursor:default"><span>无匹配表</span></div>`}</div>`;
    return `<div class="tree-src ${open?'open':''} ${s.en==='stop'?'stop':''}">
      <div class="ts-head" onclick="metaTreeToggle(${si})">
        <i class="fa-solid fa-caret-right ts-caret"></i>
        <i class="fa-solid ${s.icon} ts-ic"></i><span class="ts-name">${s.name}</span>
        <span class="ts-count">${s.tables.length}</span>
      </div>${list}</div>`;
  }).join('');
}
function metaTreeHeaderHTML(){
  const sel=META_SRCS[metaTreeSrc] && META_SRCS[metaTreeSrc].tables[metaTreeTbl];
  if(!sel) return '';
  return `<div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div><h2 style="margin:0;font-size:18px;display:inline-block">${sel.cn} <span class="mono" style="font-size:12px;color:var(--text-3);font-weight:400">${sel.n}</span></h2>
        <span class="type-badge ${sel.t==='view'?'view':''}" style="margin-left:8px">${sel.t==='view'?'视图':'表'}</span>
        <span class="sub" style="margin-left:10px">所属数据源：${META_SRCS[metaTreeSrc].name}</span></div>
        <div class="head-btns">
          <button class="meta-rcol" onclick="metaReCollect(this)"><i class="fa-solid fa-arrows-rotate"></i> 重新采集元数据</button>
          <button class="meta-save-all" id="metaSaveAllBtn" style="display:${metaDirty?'inline-flex':'none'}" onclick="metaCommitEdits()"><i class="fa-solid fa-floppy-disk"></i> 保存修改</button>
        </div>
      </div>`;
}
function metaTreeHTML(){
  const sel=META_SRCS[metaTreeSrc] && META_SRCS[metaTreeSrc].tables[metaTreeTbl];
  const header=metaTreeHeaderHTML();
  const body = sel
    ? metaDetailHTML(sel)
    : `<div class="tree-empty"><i class="fa-solid fa-database fa-2x"></i><div>请选择左侧数据表查看详情</div></div>`;
  return `<div class="meta-tree">
    <div class="tree-side">
      <div class="ts-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索表 / 视图" value="${metaTreeKw}" oninput="metaTreeFilter(this.value)"></div>
      <div id="metaTreeList">${metaTreeListHTML()}</div>
    </div>
    <div class="tree-main">${header}<div id="metaDetailBody">${body}</div></div>
  </div>`;
}
function metaTreeRenderList(){ const el=document.getElementById('metaTreeList'); if(el) el.innerHTML=metaTreeListHTML(); }
function metaTreeRenderDetail(){
  const main=document.querySelector('.meta-tree .tree-main'); if(!main) return;
  const sel=META_SRCS[metaTreeSrc] && META_SRCS[metaTreeSrc].tables[metaTreeTbl];
  const body = sel ? metaDetailHTML(sel) : `<div class="tree-empty"><i class="fa-solid fa-database fa-2x"></i><div>请选择左侧数据表查看详情</div></div>`;
  main.innerHTML = metaTreeHeaderHTML() + `<div id="metaDetailBody">${body}</div>`;
}
function metaSetMode(m){ metaGuardLeave(()=>{ metaMode=m; metaAiPending=false; metaAiBuf=[]; metaCardKw=''; metaTblKw=''; metaSnap=null; metaDirty=false; renderView('metadata'); }); }
function metaOpenSrc(i){ metaGuardLeave(()=>{ metaSrc=i; metaLevel=2; metaTblKw=''; metaAiPending=false; metaAiBuf=[]; metaSnap=null; metaDirty=false; renderView('metadata'); }); }
function metaOpenTbl(ti){ metaGuardLeave(()=>{ metaTbl=ti; metaLevel=3; metaAiPending=false; metaAiBuf=[]; metaSnap=null; metaDirty=false; renderView('metadata'); }); }
function metaBack(l){ metaGuardLeave(()=>{ metaLevel=l; if(l<=1){metaSrc=-1;metaTbl=-1;} if(l<=2) metaTbl=-1; metaAiPending=false; metaAiBuf=[]; metaSnap=null; metaDirty=false; renderView('metadata'); }); }
function metaTreeToggle(si){ if(metaTreeOpen.has(si)) metaTreeOpen.delete(si); else metaTreeOpen.add(si); metaTreeRenderList(); }
function metaTreeSchToggle(si,sch){ const key=si+'::'+sch; if(metaTreeSchCollapsed.has(key)) metaTreeSchCollapsed.delete(key); else metaTreeSchCollapsed.add(key); metaTreeRenderList(); }
function metaTreePick(si,ti){ metaGuardLeave(()=>{ metaTreeSrc=si; metaTreeTbl=ti; metaAiPending=false; metaAiBuf=[]; metaSnap=null; metaDirty=false; metaTreeRenderList(); metaTreeRenderDetail(); }); }
function metaTreeFilter(kw){ metaTreeKw=kw; const el=document.getElementById('metaTreeList'); if(el) el.innerHTML=metaTreeListHTML(); }
function metaTabSwitch(tab){
  metaTab=tab;
  let t=null;
  if(metaMode==='tree' && META_SRCS[metaTreeSrc]) t=META_SRCS[metaTreeSrc].tables[metaTreeTbl];
  else if(metaSrc>=0 && META_SRCS[metaSrc]) t=META_SRCS[metaSrc].tables[metaTbl];
  const el=document.getElementById('metaDetailBody');
  if(t && el) el.innerHTML=metaDetailHTML(t);
}
/* 定位当前选中的表对象与索引 */
function metaCurTable(){
  let si,ti;
  if(metaMode==='tree'){ si=metaTreeSrc; ti=metaTreeTbl; }
  else { si=metaSrc; ti=metaTbl; }
  const t = META_SRCS[si] && META_SRCS[si].tables[ti];
  return {si,ti,t};
}
/* ---------- 元数据：未保存修改跟踪 / 保存 / 放弃 / 离开守卫 ---------- */
function metaSnapshotTable(t){
  return { cn:t.cn, desc:t.desc,
    fields:t.fields.map(f=>({cn:f.cn, desc:f.desc, enum:f.enum, mask:f.mask, maskRule:f.maskRule, fk:f.fk, uniq:f.uniq, nullable:f.nullable})) };
}
/* 首次编辑前采集「干净快照」，用于脏检测与放弃还原（仅在尚未采集时执行） */
function metaEnsureSnapshot(){
  if(!metaSnap){ const c=metaCurTable(); if(c.t) metaSnap=metaSnapshotTable(c.t); }
}
function metaHasDirty(){
  if(!metaSnap) return false;
  const c=metaCurTable(); if(!c.t) return false;
  if(String(c.t.cn??'')!==String(metaSnap.cn??'')) return true;
  if(String(c.t.desc??'')!==String(metaSnap.desc??'')) return true;
  for(let i=0;i<c.t.fields.length;i++){
    const f=c.t.fields[i], s=metaSnap.fields[i]; if(!s) continue;
    if(String(f.cn??'')!==String(s.cn??'')) return true;
    if(String(f.desc??'')!==String(s.desc??'')) return true;
    if(String(f.enum??'')!==String(s.enum??'')) return true;
    if(String(f.mask??'')!==String(s.mask??'')) return true;
    if(String(f.maskRule??'')!==String(s.maskRule??'')) return true;
    if(String(f.fk??'')!==String(s.fk??'')) return true;
    if(String(f.uniq??'')!==String(s.uniq??'')) return true;
    if(String(f.nullable??'')!==String(s.nullable??'')) return true;
  }
  return false;
}
function metaRefreshDirty(){ metaDirty=metaHasDirty(); metaUpdateSaveBtn(); }
function metaUpdateSaveBtn(){ const b=document.getElementById('metaSaveAllBtn'); if(b) b.style.display=metaDirty?'inline-flex':'none'; }
/* 单元格级脏检测 */
function metaFldDirty(fi,key){ const c=metaCurTable(); if(!c.t||!metaSnap) return false; const f=c.t.fields[fi], s=metaSnap.fields[fi]; if(!f||!s) return false; return String(f[key]??'')!==String(s[key]??''); }
function metaDescDirty(key){ const c=metaCurTable(); if(!c.t||!metaSnap) return false; return String(c.t[key]??'')!==String(metaSnap[key]??''); }
/* 表描述输入：实时写入数据、刷新修改标识与顶部保存按钮（不重渲染，保留输入焦点） */
function metaDescInput(){
  metaEnsureSnapshot();
  const c=metaCurTable(); if(!c.t) return;
  c.t.cn=document.getElementById('metaCnEdit').value;
  c.t.desc=document.getElementById('metaDescEdit').value;
  const cm=document.getElementById('metaCnMark'), dm=document.getElementById('metaDescMark');
  if(cm) cm.style.display=metaDescDirty('cn')?'inline':'none';
  if(dm) dm.style.display=metaDescDirty('desc')?'inline':'none';
  metaRefreshDirty();
}
/* 保存修改：数据已实时变更，此处仅将快照基线更新为干净态并提示 */
function metaCommitEdits(){
  if(!metaDirty) return;
  const c=metaCurTable(); if(c.t) metaSnap=metaSnapshotTable(c.t);
  metaDirty=false; metaUpdateSaveBtn();
  metaTabSwitch(metaTab);
  showToast('已保存表信息修改');
}
/* 放弃修改：从快照还原数据 */
function metaDiscardEdits(){
  const c=metaCurTable();
  if(c.t && metaSnap){
    c.t.cn=metaSnap.cn; c.t.desc=metaSnap.desc;
    c.t.fields.forEach((f,i)=>{ const s=metaSnap.fields[i]; if(s){ f.cn=s.cn; f.desc=s.desc; f.enum=s.enum; f.mask=s.mask; f.maskRule=s.maskRule; f.fk=s.fk; f.uniq=s.uniq; f.nullable=s.nullable; } });
  }
  metaDirty=false; metaSnap=null; metaUpdateSaveBtn();
  metaTabSwitch(metaTab);
  showToast('已放弃未保存的修改');
}
/* 离开守卫：有未保存修改时弹出保存/放弃确认，否则直接执行导航回调 */
function metaGuardLeave(proceed){
  if(!metaDirty){ proceed(); return; }
  _metaLeaveProceed=proceed;
  openModal('metaLeaveModal');
}
function metaLeaveSave(){ closeModal('metaLeaveModal'); const c=metaCurTable(); if(c.t) metaSnap=metaSnapshotTable(c.t); metaDirty=false; const p=_metaLeaveProceed; _metaLeaveProceed=null; showToast('已保存表信息修改'); if(p) p(); }
function metaLeaveDiscard(){ closeModal('metaLeaveModal'); metaDiscardEdits(); const p=_metaLeaveProceed; _metaLeaveProceed=null; if(p) p(); }
function metaLeaveCancel(){ closeModal('metaLeaveModal'); _metaLeaveProceed=null; }
/* 表字段：枚举字段开关 */
function metaToggleEnum(fi, checked){
  const c=metaCurTable(); if(!c.t) return;
  const f=c.t.fields[fi];
  if(checked){
    if(!f.enum || f.enum==='—') f.enum='已配置';   // 选中即生效，跳过补充也不影响勾选
    metaEnumCtx={si:c.si,ti:c.ti,fi};
    const ef=document.getElementById('metaEnumField'); if(ef) ef.value=f.n;
    const ev=document.getElementById('metaEnumVal'); if(ev) ev.value=(f.enum&&f.enum!=='—'&&f.enum!=='已配置')?f.enum:'';
    openModal('metaEnumModal');
  } else {
    metaEnsureSnapshot(); f.enum='—'; metaTabSwitch('fields'); metaRefreshDirty();
  }
}
function metaEnumSave(){
  if(!metaEnumCtx) return;
  const {si,ti,fi}=metaEnumCtx;
  const f=META_SRCS[si].tables[ti].fields[fi];
  metaEnsureSnapshot();
  const v=document.getElementById('metaEnumVal').value.trim();
  f.enum=v?v:'已配置';
  closeModal('metaEnumModal');
  metaTabSwitch('fields'); metaRefreshDirty();
  showToast('已保存枚举字段设置');
}
function metaEnumCancel(){ closeModal('metaEnumModal'); metaTabSwitch('fields'); }  // 不改数据，保留选中态
/* 表字段：脱敏字段开关 */
function metaToggleMask(fi, checked){
  const c=metaCurTable(); if(!c.t) return;
  const f=c.t.fields[fi];
  if(checked){
    if(!f.mask || f.mask==='—') f.mask='手机号脱敏';  // 选中即生效，跳过补充也不影响勾选
    metaMaskCtx={si:c.si,ti:c.ti,fi};
    const mf=document.getElementById('metaMaskField'); if(mf) mf.value=f.n;
    const cur=(f.mask&&f.mask!=='—')?f.mask:'';
    const mt=document.getElementById('metaMaskType'); if(mt) mt.value=cur||'手机号脱敏';
    const mr=document.getElementById('metaMaskRule'); if(mr) mr.value=f.maskRule||(cur?`对「${f.n}」字段按「${cur}」规则进行脱敏处理`:'');
    openModal('metaMaskModal');
  } else {
    metaEnsureSnapshot(); f.mask='—'; f.maskRule=''; metaTabSwitch('fields'); metaRefreshDirty();
  }
}
function metaMaskSave(){
  if(!metaMaskCtx) return;
  const {si,ti,fi}=metaMaskCtx;
  const f=META_SRCS[si].tables[ti].fields[fi];
  metaEnsureSnapshot();
  f.mask=document.getElementById('metaMaskType').value;
  f.maskRule=document.getElementById('metaMaskRule').value.trim();
  closeModal('metaMaskModal');
  metaTabSwitch('fields'); metaRefreshDirty();
  showToast('已保存脱敏规则设置');
}
function metaMaskCancel(){ closeModal('metaMaskModal'); metaTabSwitch('fields'); }  // 不改数据，保留选中态
/* 表字段：外键 / 唯一 / 允许为空 开关（简单布尔切换） */
function metaToggleFk(fi,checked){ const c=metaCurTable(); if(!c.t) return; metaEnsureSnapshot(); c.t.fields[fi].fk=checked?'1':'0'; metaTabSwitch('fields'); metaRefreshDirty(); }
function metaToggleUniq(fi,checked){ const c=metaCurTable(); if(!c.t) return; metaEnsureSnapshot(); c.t.fields[fi].uniq=checked?'1':'0'; metaTabSwitch('fields'); metaRefreshDirty(); }
function metaToggleNullable(fi,checked){ const c=metaCurTable(); if(!c.t) return; metaEnsureSnapshot(); c.t.fields[fi].nullable=checked?'1':'0'; metaTabSwitch('fields'); metaRefreshDirty(); }

/* ---- 业务术语管理 ---- */
let GLOSSARY=[
  {id:1,term:'建设用地',cat:'国土空间规划',def:'城乡建设用地总量口径',syn:'建地、建设地块',user:'演示用户13',time:'2026-07-28 14:20',enabled:true},
  {id:2,term:'容积率',cat:'国土空间规划',def:'总建筑面积 ÷ 用地面积',syn:'FAR、建筑容积',user:'演示用户17',time:'2026-07-27 09:35',enabled:true},
  {id:3,term:'永久基本农田',cat:'耕地保护',def:'划定保护区范围内的耕地',syn:'基本农田、口粮田',user:'演示用户21',time:'2026-07-26 16:10',enabled:true},
  {id:4,term:'净用地面积',cat:'国土空间规划',def:'扣除代征地后的用地面积',syn:'净地面积、可建面积',user:'演示用户13',time:'2026-07-25 11:02',enabled:true},
  {id:5,term:'建设工程规划许可',cat:'用地审批',def:'取得规划许可证的建设项目',syn:'规划许可、工程规划证',user:'演示用户25',time:'2026-07-28 10:40',enabled:true},
  {id:6,term:'不动产登记',cat:'不动产登记',def:'不动产物权记载与公示',syn:'房产登记、产权登记',user:'演示用户32',time:'2026-07-24 15:18',enabled:true},
  {id:7,term:'宗地',cat:'不动产登记',def:'土地权属界线封闭的地块',syn:'地块、地宗',user:'演示用户32',time:'2026-07-23 13:55',enabled:false},
  {id:8,term:'界址点',cat:'测绘地理信息',def:'确定宗地权属界线的拐点',syn:'界点、拐点',user:'演示用户10',time:'2026-07-22 09:30',enabled:true},
  {id:9,term:'坐标参考系',cat:'测绘地理信息',def:'空间位置度量的基准框架',syn:'CRS、空间基准',user:'演示用户10',time:'2026-07-21 17:45',enabled:true},
  {id:10,term:'耕地占补平衡',cat:'耕地保护',def:'占用耕地须补充同等数量质量耕地',syn:'占补平衡',user:'演示用户21',time:'2026-07-20 14:12',enabled:true},
  {id:11,term:'用地预审',cat:'用地审批',def:'建设项目用地前置审查',syn:'预审、用地前审',user:'演示用户25',time:'2026-07-19 10:05',enabled:true},
  {id:12,term:'控制性详细规划',cat:'国土空间规划',def:'地块用途与开发强度控制',syn:'控规、详规',user:'演示用户13',time:'2026-07-18 16:40',enabled:true},
  {id:13,term:'地籍调查',cat:'不动产登记',def:'查清土地权属与界址的测量',syn:'地籍测绘',user:'演示用户32',time:'2026-07-17 11:25',enabled:true},
  {id:14,term:'地形图',cat:'测绘地理信息',def:'表达地物地貌的平面图纸',syn:'地表图、平面图',user:'演示用户10',time:'2026-07-16 09:50',enabled:true},
];
/* 术语 <—> 表字段 映射关系：key = 术语 id，value = [{src, table, field, fieldCn}] */
let GL_MAPS={
  1:[{src:'国土空间规划库',table:'demo_t_land_use_plan',field:'land_type',fieldCn:'用地类型'}],
  2:[{src:'规划审批库',table:'demo_t_approval_project',field:'land_area',fieldCn:'用地面积(㎡)'}],
  6:[{src:'不动产登记库',table:'demo_t_owner_info',field:'owner_name',fieldCn:'权利人姓名'},{src:'不动产登记库',table:'demo_t_land_parcel',field:'parcel_id',fieldCn:'地块编号'}],
  11:[{src:'规划审批库',table:'demo_t_approval_project',field:'proj_name',fieldCn:'项目名称'}],
};
/* 术语映射字段之间的计算关系：key = 术语 id，value = 计算口径表达式（引用已映射字段名） */
let GL_EXPR={ 6:"owner_name || '·' || parcel_id" };
/* 术语按业务域分类口径管理：cat 字段对应业务域业务子域名称 */
function glLeafDomains(){ return BD_LIST.filter(d=>bdIsLeaf(d)); }
function glCat2DomainId(cat){
  const m={'国土空间规划':'D-01','不动产登记':'D-02','用地审批':'D-03','耕地保护':'D-04','测绘地理':'D-05','测绘地理信息':'D-05'};
  return Object.prototype.hasOwnProperty.call(m,cat)?m[cat]:null;
}
function glDescendantLeafIds(id){ const set=new Set(); (function walk(nid){ bdChildrenOf(nid).forEach(ch=>{ if(bdIsLeaf(ch)) set.add(ch.id); else walk(ch.id); }); })(id); return set; }
function glCountForDomain(id){
  if(id==='__all__') return GLOSSARY.length;
  if(id==='__other__') return GLOSSARY.filter(g=>glCat2DomainId(g.cat)===null).length;
  const leaves=glDescendantLeafIds(id);
  return GLOSSARY.filter(g=>{ const did=glCat2DomainId(g.cat); return did!==null&&leaves.has(did); }).length;
}
function glMatchesDomain(g){
  if(glDomainSel==='__all__') return true;
  const did=glCat2DomainId(g.cat);
  if(glDomainSel==='__other__') return did===null;
  const leaves=glDescendantLeafIds(glDomainSel);
  return did!==null && leaves.has(did);
}
function glScopeLabel(){
  if(glDomainSel==='__all__') return '全部术语（按业务域分类）';
  if(glDomainSel==='__other__') return '其他 / 未分类';
  const d=bdById(glDomainSel); return d?bdPathName(d.id):'全部术语';
}
function glSelectDomain(id){ glDomainSel=id; glPage=1; renderView('glossary'); }
function glTreeToggle(id){ if(glTreeCollapsed.has(id)) glTreeCollapsed.delete(id); else glTreeCollapsed.add(id); renderView('glossary'); }
function glDomainTreeNodeHTML(d, depth){
  const kids=bdChildrenOf(d.id);
  const hasKids=kids.length>0;
  const expanded = !glTreeCollapsed.has(d.id);
  const indent=16*depth;
  const caret = hasKids ? `<span class="gl-caret ${expanded?'open':''}" onclick="event.stopPropagation();glTreeToggle('${d.id}')"><i class="fa-solid fa-chevron-right"></i></span>` : `<span class="gl-caret empty"></span>`;
  const ic = hasKids ? `<i class="fa-solid fa-folder"></i>` : `<i class="fa-solid fa-tag"></i>`;
  const on = glDomainSel===d.id ? 'on':'';
  const cnt = glCountForDomain(d.id);
  const row=`<div class="gl-node-row ${on}" style="padding-left:${indent+8}px" onclick="glSelectDomain('${d.id}')">
    ${caret}<span class="gl-ic">${ic}</span><span class="gl-name">${d.name}</span><span class="gl-count">${cnt}</span>
  </div>`;
  let sub='';
  if(hasKids && expanded){ sub=kids.map(ch=>glDomainTreeNodeHTML(ch, depth+1)).join(''); }
  return `<div class="gl-node">${row}${sub}</div>`;
}
function glDomainTreeHTML(){
  const top=`<div class="gl-node-row ${glDomainSel==='__all__'?'on':''}" onclick="glSelectDomain('__all__')">
    <span class="gl-caret empty"></span><span class="gl-ic"><i class="fa-solid fa-layer-group"></i></span><span class="gl-name">全部术语</span><span class="gl-count">${GLOSSARY.length}</span></div>`;
  const other=`<div class="gl-node-row ${glDomainSel==='__other__'?'on':''}" onclick="glSelectDomain('__other__')" style="padding-left:24px">
    <span class="gl-caret empty"></span><span class="gl-ic"><i class="fa-solid fa-ellipsis"></i></span><span class="gl-name">其他 / 未分类</span><span class="gl-count">${glCountForDomain('__other__')}</span></div>`;
  const tree=BD_LIST.filter(d=>d.parentId===null).map(d=>glDomainTreeNodeHTML(d,0)).join('');
  return top+tree+other;
}
let glDomainSel='__all__', glKw='', glEditId=null, glNextId=100, glPage=1, glPageSize=8;
const glTreeCollapsed=new Set();

function glNow(){ const d=new Date(); const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function glRefresh(){ const w=document.getElementById('glTableWrap'); if(w) w.innerHTML=glTableHTML(); const p=document.getElementById('glPager'); if(p) p.innerHTML=glPagerHTML(); }
function glSetKw(v){ glKw=v; glPage=1; glRefresh(); }
function glFiltered(){
  const kw=glKw.trim().toLowerCase();
  return GLOSSARY.filter(g=> glMatchesDomain(g) && (!kw || (g.term+' '+(g.cat||'')+' '+(g.def||'')+' '+(g.syn||'')).toLowerCase().includes(kw)));
}
function glTableHTML(){
  const all=glFiltered();
  const total=all.length;
  const pages=Math.max(1, Math.ceil(total/glPageSize));
  if(glPage>pages) glPage=pages; if(glPage<1) glPage=1;
  const start=(glPage-1)*glPageSize;
  const list=all.slice(start, start+glPageSize);
  return `<div class="tbl-wrap"><table>
    <thead><tr><th style="width:46px">序号</th><th>所属类别</th><th>标准术语</th><th>解释 / 定义</th><th>口语化表达 / 同义词</th><th>启用状态</th><th>是否映射</th><th>最近更新时间</th><th style="width:172px">操作</th></tr></thead>
    <tbody>
      ${list.map((g,i)=>{ const maps=GL_MAPS[g.id]||[]; const mappedN=maps.length; return `<tr>
        <td class="muted">${start+i+1}</td>
        <td><span class="pill info">${g.cat}</span></td>
        <td><b>${g.term}</b></td>
        <td style="color:var(--text-2)">${g.def}</td>
        <td>${g.syn?g.syn.split(/[、,，]/).map(x=>`<span class="pill" style="margin:0 4px 4px 0">${x}</span>`).join(''):'<span class="muted">—</span>'}</td>
        <td>${g.enabled!==false?'<span class="pill on">启用</span>':'<span class="pill off">停用</span>'}</td>
        <td>${mappedN?`<span class="pill on">已映射 ${mappedN}</span>`:'<span class="muted">未映射</span>'}</td>
        <td class="muted">${g.time}</td>
        <td><div class="act">
          <a class="go" title="字段映射" onclick="glOpenMap(${g.id})"><i class="fa-solid fa-link"></i></a>
          <a class="${g.enabled!==false?'warn':'ok'}" title="${g.enabled!==false?'禁用':'启用'}" onclick="glToggleEnabled(${g.id})"><i class="fa-solid ${g.enabled!==false?'fa-ban':'fa-circle-check'}"></i></a>
          <a title="编辑" onclick="glEdit(${g.id})"><i class="fa-solid fa-pen"></i></a>
          <a class="del" title="删除" onclick="glDelete(${g.id})"><i class="fa-solid fa-trash"></i></a>
        </div></td>
      </tr>`; }).join('')}
      ${!list.length?'<tr><td colspan="9" class="muted" style="text-align:center;padding:32px">暂无匹配的术语数据</td></tr>':''}
    </tbody></table></div>`;
}
function glPagerHTML(){
  const total=glFiltered().length;
  const pages=Math.max(1, Math.ceil(total/glPageSize));
  if(glPage>pages) glPage=pages; if(glPage<1) glPage=1;
  const cur=glPage;
  let nums=[];
  if(pages<=7){ for(let i=1;i<=pages;i++) nums.push(i); }
  else{
    nums.push(1);
    if(cur>3) nums.push('…');
    const s=Math.max(2,cur-1), e=Math.min(pages-1,cur+1);
    for(let i=s;i<=e;i++) nums.push(i);
    if(cur<pages-2) nums.push('…');
    nums.push(pages);
  }
  const btns=nums.map(n=> n==='…'
    ? '<a class="dots">…</a>'
    : `<a class="${n===cur?'on':''}" onclick="glGoPage(${n})">${n}</a>`).join('');
  return `<div class="pager">
    <span>共 ${total} 条</span>
    <a class="${cur<=1?'disabled':''}" ${cur>1?'onclick="glGoPage('+(cur-1)+')"':''}>‹</a>
    ${btns}
    <a class="${cur>=pages?'disabled':''}" ${cur<pages?'onclick="glGoPage('+(cur+1)+')"':''}>›</a>
  </div>`;
}
function glGoPage(p){ const total=glFiltered().length; const pages=Math.max(1, Math.ceil(total/glPageSize)); glPage=Math.min(pages, Math.max(1, p|0)); glRefresh(); }
VIEWS.glossary=()=>`
${ph('业务术语管理','行业业务术语、指标口径统一维护 · 按业务域分类管理 · 口语化术语映射 · 批量导入导出 ')}
<div class="gl-layout">
  <div class="gl-side">
    <div class="gl-side-h"><span>业务域目录</span><span class="gl-side-sub">${GLOSSARY.length} 条术语</span></div>
    <div class="gl-tree" id="glTree">${glDomainTreeHTML()}</div>
  </div>
  <div class="gl-main">
    <div class="tbl-bar">
      <div class="gl-scope">当前分类：<b>${glScopeLabel()}</b></div>
      <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input id="glKw" placeholder="搜索术语 / 解释 / 同义词" value="${glKw}" oninput="glSetKw(this.value)"></div>
      <div class="tbl-acts">
        <button class="btn" onclick="glImport()"><i class="fa-solid fa-file-import"></i>批量导入</button>
        <button class="btn" onclick="glExport()"><i class="fa-solid fa-file-export"></i>导出</button>
        <button class="btn primary" onclick="glAdd()"><i class="fa-solid fa-plus"></i>新增术语</button>
      </div>
    </div>
    <div id="glTableWrap">${glTableHTML()}</div>
    <div id="glPager">${glPagerHTML()}</div>
  </div>
</div>`;

/* 新增 / 编辑术语 */
/* 所属类别：联想下拉控件，数据源 = 业务域目录（BD_LIST） */
function glCatSuggest(){
  const inp=document.getElementById('glCat'); if(!inp) return;
  const kw=inp.value.trim().toLowerCase();
  const list=document.getElementById('glCatList'); if(!list) return;
  let items=BD_LIST.map(d=>({name:d.name, path:bdPathName(d.id)}));
  if(kw) items=items.filter(x=>x.name.toLowerCase().includes(kw)||x.path.toLowerCase().includes(kw));
  items=items.slice(0,20);
  const rows=items.map(x=>`<div class="combo-item" onmousedown="glCatPick('${x.name.replace(/'/g,"\\'")}');event.preventDefault()"><span class="ci-name">${x.name}</span><span class="ci-path">${x.path}</span></div>`).join('');
  list.innerHTML=rows+`<div class="combo-item ci-other" onmousedown="glCatPick('其他');event.preventDefault()"><span class="ci-name">其他</span><span class="ci-path">未归类术语</span></div>`;
  list.style.display='block';
}
function glCatPick(name){ const inp=document.getElementById('glCat'); if(inp) inp.value=name; glCatClose(); }
function glCatClose(){ const list=document.getElementById('glCatList'); if(list) list.style.display='none'; }
function glAdd(){ glEditId=null; document.getElementById('glModalTitle').textContent='新增术语';
  document.getElementById('glTerm').value='';
  const sel=document.getElementById('glCat'); sel.value='';
  document.getElementById('glDef').value=''; document.getElementById('glSyn').value='';
  openModal('glossaryModal'); }
function glEdit(id){ const g=GLOSSARY.find(x=>x.id===id); if(!g) return; glEditId=id;
  document.getElementById('glModalTitle').textContent='编辑术语';
  document.getElementById('glTerm').value=g.term;
  const sel=document.getElementById('glCat'); sel.value=g.cat;
  document.getElementById('glDef').value=g.def; document.getElementById('glSyn').value=g.syn;
  openModal('glossaryModal'); }
function glSave(){
  const term=document.getElementById('glTerm').value.trim();
  const cat=document.getElementById('glCat').value;
  const def=document.getElementById('glDef').value.trim();
  const syn=document.getElementById('glSyn').value.trim();
  if(!term){ showToast('请填写标准术语'); return; }
  if(glEditId==null && !def){ showToast('请填写解释 / 定义'); return; }
  if(glEditId!=null){ const g=GLOSSARY.find(x=>x.id===glEditId); if(g){ g.term=term; g.cat=cat; g.def=def; g.syn=syn; g.user='当前用户'; g.time=glNow(); } }
  else { GLOSSARY.push({id:glNextId++,term,cat,def,syn,user:'当前用户',time:glNow()}); }
  closeModal('glossaryModal'); glRefresh();
  showToast(glEditId!=null?'已更新术语':'已新增术语'); glEditId=null;
}
function glDelete(id){ const g=GLOSSARY.find(x=>x.id===id); if(!g) return;
  showConfirm('确认删除术语「'+g.term+'」？删除后不可恢复。', ()=>{ GLOSSARY=GLOSSARY.filter(x=>x.id!==id); glRefresh(); showToast('已删除术语'); }); }

/* 启用 / 停用 */
function glToggleEnabled(id){ const g=GLOSSARY.find(x=>x.id===id); if(!g) return; g.enabled=!(g.enabled!==false); glRefresh(); showToast(g.enabled!==false?('已启用术语「'+g.term+'」'):('已停用术语「'+g.term+'」')); }
/* 已映射字段数量 */
function glMappedN(id){ return (GL_MAPS[id]||[]).length; }

/* 术语字段映射 */
let glMapTermId=null, glMapBuf=[], glMapCandList=[], glMapFieldCache=null;
function glOpenMap(id){
  const g=GLOSSARY.find(x=>x.id===id); if(!g) return;
  glMapTermId=id;
  document.getElementById('glMapTerm').textContent=g.term;
  glMapBuf=(GL_MAPS[id]||[]).map(m=>({...m}));
  const ta=document.getElementById('glMapExpr'); if(ta) ta.value=GL_EXPR[id]||'';
  const kw=document.getElementById('glMapKw'); if(kw) kw.value='';
  glMapSearch(''); glMapRenderList(); glMapRenderChips();
  openModal('glMapModal');
}
function glMapAllFields(){
  if(glMapFieldCache) return glMapFieldCache;
  const out=[];
  META_SRCS.forEach(s=> (s.tables||[]).forEach(t=> (t.fields||[]).forEach(f=>{
    out.push({src:s.name, table:t.n, tableCn:t.cn||t.n, field:f.n, fieldCn:(f.cn)||f.n});
  })));
  glMapFieldCache=out; return out;
}
function glMapInBuf(r){ return glMapBuf.some(m=>m.src===r.src&&m.table===r.table&&m.field===r.field); }
function glMapSearch(kw){
  kw=(kw||'').trim().toLowerCase();
  const all=glMapAllFields();
  const list=!kw?all:all.filter(r=>(r.src+' '+r.table+' '+r.tableCn+' '+r.field+' '+r.fieldCn).toLowerCase().includes(kw));
  glMapCandList=list;
  const box=document.getElementById('glMapCand'); if(!box) return;
  if(!list.length){ box.innerHTML='<div class="gl-map-empty">未找到匹配的字段</div>'; return; }
  box.innerHTML=list.slice(0,200).map((r,i)=>{ const added=glMapInBuf(r);
    return `<div class="gl-map-cand-row ${added?'added':''}" ${added?'':`onclick="glMapAdd(${i})"`}>
      <span class="gl-c-src">${r.src}</span>
      <span class="gl-c-tbl">${r.tableCn}<em>${r.table}</em></span>
      <span class="gl-c-fld">${r.fieldCn}<em>${r.field}</em></span>
      <span class="gl-c-act">${added?'<i class="fa-solid fa-check"></i> 已添加':'<i class="fa-solid fa-plus"></i> 添加映射'}</span>
    </div>`; }).join('');
}
function glMapAdd(i){
  const r=glMapCandList[i]; if(!r) return;
  if(glMapInBuf(r)){ showToast('该字段已映射，不可重复添加'); return; }
  glMapBuf.push({...r});
  glMapSearch(document.getElementById('glMapKw').value);
  glMapRenderList(); glMapRenderChips();
  showToast('已添加映射');
}
function glMapRemoveAt(i){ glMapBuf.splice(i,1); glMapRenderList(); glMapRenderChips(); glMapSearch(document.getElementById('glMapKw').value); }
function glMapRenderList(){
  const box=document.getElementById('glMapList'); if(!box) return;
  const cnt=document.getElementById('glMapCnt'); if(cnt) cnt.textContent=glMapBuf.length;
  if(!glMapBuf.length){ box.innerHTML='<div class="gl-map-empty">尚未配置字段映射</div>'; return; }
  box.innerHTML=glMapBuf.map((m,i)=>`<div class="gl-map-item">
    <span class="gl-map-ic"><i class="fa-solid fa-database"></i></span>
    <span class="gl-map-path"><b>${m.src}</b> · ${m.table}<span class="gl-map-field">.${m.field}</span>${m.fieldCn&&m.fieldCn!==m.field?'（'+m.fieldCn+'）':''}</span>
    <a class="gl-map-rm" onclick="glMapRemoveAt(${i})" title="移除"><i class="fa-solid fa-xmark"></i></a>
  </div>`).join('');
}
function glMapRenderChips(){
  const exprBox=document.getElementById('glMapExprBox');
  const hint=document.getElementById('glMapExprHint');
  const ta=document.getElementById('glMapExpr');
  const box=document.getElementById('glMapExprChips'); if(!box) return;
  const multi=glMapBuf.length>=2;
  if(exprBox) exprBox.style.display = multi ? '' : 'none';
  if(hint) hint.textContent='';
  if(!multi){ if(ta) ta.value=''; box.innerHTML=''; return; }
  box.innerHTML=glMapBuf.map((m,i)=>`<span class="gl-map-chip" onclick="glMapInsertField(${i})" title="点击插入字段引用">${m.field}<em>${m.fieldCn||''}</em></span>`).join('');
}
function glMapInsertField(i){
  const m=glMapBuf[i]; if(!m) return;
  const ta=document.getElementById('glMapExpr'); if(!ta) return;
  const ref=m.field; const s=ta.selectionStart, e=ta.selectionEnd;
  ta.value=ta.value.slice(0,s)+ref+ta.value.slice(e);
  ta.focus(); ta.selectionStart=ta.selectionEnd=s+ref.length;
}
function glMapSave(){
  GL_MAPS[glMapTermId]=glMapBuf.map(m=>({...m}));
  const ta=document.getElementById('glMapExpr');
  const expr=(ta?ta.value:'').trim();
  if(expr) GL_EXPR[glMapTermId]=expr; else delete GL_EXPR[glMapTermId];
  closeModal('glMapModal'); glRefresh();
  showToast(glMapBuf.length?('已保存 '+glMapBuf.length+' 条字段映射'+(expr?' 及计算关系':'')):'已清空字段映射');
}

/* 批量导入 / 导出 */
function glExport(){
  if(!GLOSSARY.length){ showToast('暂无术语可导出'); return; }
  const head='序号,标准术语,所属类别,解释/定义,口语化表达/同义词,最近更新用户,最近更新时间\n';
  const body=GLOSSARY.map((g,i)=>[i+1,g.term,g.cat,g.def,g.syn,g.user,g.time].map(glCsvCell).join(',')).join('\n');
  glDownload('行业术语库.csv', head+body);
  showToast('已导出 '+GLOSSARY.length+' 条术语');
}
function glCsvCell(v){ const s=String(v==null?'':v); return '"'+s.replace(/"/g,'""')+'"'; }
function glParseCSV(text){
  const rows=[]; let row=[],cur='',inq=false;
  for(let i=0;i<text.length;i++){ const ch=text[i];
    if(inq){ if(ch==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else inq=false; } else cur+=ch; }
    else { if(ch==='"') inq=true; else if(ch===','){ row.push(cur);cur=''; } else if(ch==='\n'){ row.push(cur);rows.push(row);row=[];cur=''; } else if(ch!=='\r') cur+=ch; }
  }
  if(cur!==''||row.length){ row.push(cur); rows.push(row); }
  return rows;
}
function glImport(){ document.getElementById('glImportText').value=''; openModal('glImportModal'); }
function glImportFile(input){ const f=input.files&&input.files[0]; if(!f) return;
  const rd=new FileReader(); rd.onload=()=>{ const ta=document.getElementById('glImportText'); if(ta) ta.value=rd.result; showToast('已读取文件，可点击导入'); }; rd.readAsText(f,'utf-8'); }
function glDoImport(){
  const raw=document.getElementById('glImportText').value.trim();
  if(!raw){ showToast('请粘贴内容或选择文件'); return; }
  let items=[];
  try{
    if(/^\s*[[{]/.test(raw)){ const arr=JSON.parse(raw);
      items=arr.filter(o=>o&&typeof o==='object').map(o=>({term:o.term||o['标准术语']||'',cat:o.cat||o['所属类别']||'其他',def:o.def||o['解释/定义']||'',syn:o.syn||o['口语化表达/同义词']||o['口语化表达']||''}));
    } else { const rows=glParseCSV(raw); let s=0; if(rows[0]&&/标准术语|term/i.test(rows[0][0]||'')) s=1;
      for(let i=s;i<rows.length;i++){ const r=rows[i]; if(!r||!r[0]) continue; items.push({term:r[0],cat:r[1]||'其他',def:r[2]||'',syn:r[3]||''}); } }
  }catch(e){ showToast('解析失败：'+e.message); return; }
  items=items.filter(x=>x.term);
  if(!items.length){ showToast('未解析到有效术语'); return; }
  const now=glNow(); items.forEach(x=>GLOSSARY.push({id:glNextId++,term:x.term,cat:x.cat,def:x.def,syn:x.syn,user:'批量导入',time:now}));
  closeModal('glImportModal'); glRefresh(); showToast('成功导入 '+items.length+' 条术语');
}
function glTpl(){ glDownload('术语导入模板.csv','标准术语,所属类别,解释/定义,口语化表达/同义词\n建设用地,国土空间规划,城乡建设用地总量口径,建地、建设地块\n'); }
function glDownload(name,content){ const blob=new Blob([content],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},100); }


/* ---- SQL 样例管理 ---- */
const SQL_SAMPLES=[
  {id:1,desc:'查询2026年各区已审批用地面积',sql:'SELECT district, SUM(area) FROM demo_t_approval_project GROUP BY district',type:'总量统计',status:'on',hits:1024,domains:['用地审批','空间规划'],tables:['demo_t_approval_project']},
  {id:2,desc:'统计不动产登记办件量按月分布',sql:"SELECT DATE_TRUNC('month',reg_date), COUNT(*) FROM demo_t_owner_info GROUP BY 1",type:'分类统计',status:'on',hits:856,domains:['不动产登记'],tables:['demo_t_owner_info']},
  {id:3,desc:'查找基本农田范围内的建设项目',sql:'SELECT p.* FROM demo_t_approval_project p JOIN demo_t_land_use_plan l ON p.plan_id=l.plan_id WHERE l.land_type=\'农业\'',type:'多表查询',status:'on',hits:432,domains:['用地审批','耕地保护'],tables:['demo_t_approval_project','demo_t_land_use_plan']},
  {id:4,desc:'近三年耕地占补平衡情况',sql:'SELECT year, occupy, supplement FROM demo_t_land_use_plan WHERE pub_year>=2023',type:'分类统计',status:'warn',hits:321,domains:['耕地保护','用地审批'],tables:['demo_t_land_use_plan']},
  {id:5,desc:'查询权利人联系电话与证件',sql:'SELECT owner_name, id_card, owner_phone FROM demo_t_owner_info',type:'单表查询',status:'on',hits:788,domains:['不动产登记'],tables:['demo_t_owner_info']},
  {id:6,desc:'统计各地块占地面积汇总',sql:'SELECT parcel_id, SUM(area) AS total FROM demo_t_land_parcel GROUP BY parcel_id',type:'总量统计',status:'on',hits:564,domains:['测绘地理','空间规划'],tables:['demo_t_land_parcel']},
  {id:7,desc:'审批流程各节点平均耗时',sql:'SELECT node_name, AVG(EXTRACT(EPOCH FROM handle_time)) FROM demo_t_approval_flow GROUP BY node_name',type:'分类统计',status:'on',hits:298,domains:['用地审批'],tables:['demo_t_approval_flow']},
  {id:8,desc:'项目批复面积排名',sql:'SELECT proj_name, land_area FROM demo_t_approval_project ORDER BY land_area DESC',type:'单表查询',status:'off',hits:147,domains:['用地审批','空间规划'],tables:['demo_t_approval_project']},
  {id:9,desc:'地块规划用途分布',sql:'SELECT land_use, COUNT(*) FROM demo_t_land_parcel GROUP BY land_use',type:'分类统计',status:'on',hits:673,domains:['测绘地理','空间规划'],tables:['demo_t_land_parcel']},
  {id:10,desc:'权利人与地块联合查询',sql:'SELECT o.owner_name, p.parcel_addr FROM demo_t_owner_info o JOIN demo_t_land_parcel p ON o.parcel_id=p.parcel_id',type:'多表查询',status:'on',hits:389,domains:['不动产登记','测绘地理'],tables:['demo_t_owner_info','demo_t_land_parcel']},
  {id:11,desc:'项目汇总视图查询',sql:'SELECT * FROM demo_v_project_summary',type:'单表查询',status:'on',hits:512,domains:['用地审批','空间规划','不动产登记'],tables:['demo_v_project_summary']},
  {id:12,desc:'规划单元地块统计',sql:'SELECT plan_id, parcel_cnt, total_area FROM demo_v_parcel_stats',type:'单表查询',status:'warn',hits:234,domains:['空间规划','测绘地理'],tables:['demo_v_parcel_stats']},
];
let sqlSelTbl='', sqlSelSrc=-1, sqlSelSch='', sqlKw='', sqlType='全部', sqlDomain='全部', sqlPage=1, sqlPageSize=8, sqlTreeKw='', sqlSrcOpen=new Set([0]), sqlSchCollapsed=new Set(), sqlEditId=null, sqlNextId=13, sqlParamNames=[], sqlParamsMeta={}, sqlSaving=false;
/* 左侧数据源目录：完全照搬元数据管理页的目录树结构（按 schema 分组 + 表状态提示 + schema 折叠） */
function sqlTreeHTML(){
  const kw=sqlTreeKw.trim().toLowerCase();
  return META_SRCS.map((s,si)=>{
    const open = !!kw || sqlSrcOpen.has(si);
    const order=[], bySch={};
    s.tables.forEach((t,ti)=>{
      if(kw && !(t.n.toLowerCase().includes(kw)||t.cn.toLowerCase().includes(kw))) return;
      if(!(t.s in bySch)){ bySch[t.s]=[]; order.push(t.s); }
      bySch[t.s].push({t,ti});
    });
    const schsHTML = order.map(sch=>{
      const key=si+'::'+sch;
      const schOpen = !!kw || !sqlSchCollapsed.has(key);
      const items = bySch[sch].map(({t,ti})=>`<div class="tree-tbl st-${t.st} ${sqlSelTbl===t.n?'on':''}" onclick="sqlPickTbl('${t.n}')">
        <i class="fa-solid ${t.t==='view'?'fa-table-columns':'fa-table'} tt-ic"></i><span class="mono tt-name">${t.n}</span>${metaObjStatus(t.st)}</div>`).join('');
      return `<div class="tree-sch ${schOpen?'open':''}">
        <div class="sch-head ${sqlSelSch===key?'sel':''}" onclick="sqlSchPick(${si},'${sch}')">
          <i class="fa-solid fa-caret-right sch-caret" onclick="event.stopPropagation();sqlSchToggle(${si},'${sch}')"></i>
          <i class="fa-solid fa-folder sch-ic"></i><span class="sch-name">${sch}</span>
          <span class="sch-count">${bySch[sch].length}</span>
        </div>
        <div class="tree-tbls">${items}</div>
      </div>`;
    }).join('');
    const list = `<div class="tree-schs">${order.length?schsHTML:`<div class="tree-tbl" style="color:var(--text-3);cursor:default"><span>无匹配表</span></div>`}</div>`;
    return `<div class="tree-src ${open?'open':''} ${s.en==='stop'?'stop':''}">
      <div class="ts-head ${sqlSelSrc===si?'sel':''}" onclick="sqlSrcPick(${si})">
        <i class="fa-solid fa-caret-right ts-caret" onclick="event.stopPropagation();sqlSrcToggle(${si})"></i>
        <i class="fa-solid ${s.icon} ts-ic"></i><span class="ts-name">${s.name}</span>
        <span class="ts-count">${s.tables.length}</span>
      </div>${list}</div>`;
  }).join('');
}
function sqlSrcTables(i){ const s=META_SRCS[i]; return new Set((s?s.tables:[]).map(t=>t.n)); }
function sqlSchTables(key){ const p=key.split('::'); const s=META_SRCS[+p[0]]; return new Set((s?s.tables:[]).filter(t=>t.s===p[1]).map(t=>t.n)); }
function sqlRenderAll(){ const t=document.getElementById('sqlTreeWrap'); if(t) t.innerHTML=sqlTreeHTML(); sqlRefresh(); }
function sqlSrcPick(i){ if(sqlSelSrc===i){ sqlSelSrc=-1; sqlSelSch=''; sqlSelTbl=''; } else { sqlSelSrc=i; sqlSelSch=''; sqlSelTbl=''; } sqlPage=1; sqlRenderAll(); }
function sqlSchPick(si,sch){ const key=si+'::'+sch; if(sqlSelSch===key){ sqlSelSrc=-1; sqlSelSch=''; sqlSelTbl=''; } else { sqlSelSrc=-1; sqlSelSch=key; sqlSelTbl=''; } sqlPage=1; sqlRenderAll(); }
function sqlClearSrc(){ sqlSelSrc=-1; sqlPage=1; sqlRenderAll(); }
function sqlClearSch(){ sqlSelSch=''; sqlPage=1; sqlRenderAll(); }
function sqlClearTbl(){ sqlSelTbl=''; sqlPage=1; sqlRenderAll(); }
function sqlSrcToggle(i){ if(sqlSrcOpen.has(i)) sqlSrcOpen.delete(i); else sqlSrcOpen.add(i); const el=document.getElementById('sqlTreeWrap'); if(el) el.innerHTML=sqlTreeHTML(); }
function sqlSchToggle(si,sch){ const key=si+'::'+sch; if(sqlSchCollapsed.has(key)) sqlSchCollapsed.delete(key); else sqlSchCollapsed.add(key); const el=document.getElementById('sqlTreeWrap'); if(el) el.innerHTML=sqlTreeHTML(); }
function sqlTreeFilter(v){ sqlTreeKw=v; const el=document.getElementById('sqlTreeWrap'); if(el) el.innerHTML=sqlTreeHTML(); }
function sqlPickTbl(n){ if(sqlSelTbl===n){ sqlSelSrc=-1; sqlSelSch=''; sqlSelTbl=''; } else { sqlSelSrc=-1; sqlSelSch=''; sqlSelTbl=n; } sqlPage=1; sqlRenderAll(); }
function sqlFiltered(){
  const kw=sqlKw.trim().toLowerCase();
  const srcSet = sqlSelSrc>=0 ? sqlSrcTables(sqlSelSrc) : null;
  const schSet = sqlSelSch ? sqlSchTables(sqlSelSch) : null;
  return SQL_SAMPLES.filter(s=>{
    const tbls=s.tables||[];
    if(sqlSelTbl && !tbls.includes(sqlSelTbl)) return false;
    if(srcSet && !tbls.some(t=>srcSet.has(t))) return false;
    if(schSet && !tbls.some(t=>schSet.has(t))) return false;
    if(sqlType!=='全部' && s.type!==sqlType) return false;
    if(sqlDomain!=='全部' && !(s.domains||[]).includes(sqlDomain)) return false;
    if(kw && !(s.desc+' '+s.sql+' '+tbls.join(' ')+' '+(s.domains||[]).join(' ')).toLowerCase().includes(kw)) return false;
    return true;
  });
}
function sqlTypePill(t){ return t?`<span class="pill">${t}</span>`:'<span class="muted">—</span>'; }
function sqlStPill(s){ return s==='on'?'<span class="pill on">已启用</span>': s==='warn'?'<span class="pill warn">未启用</span>': s==='off'?'<span class="pill off">已停用</span>':'<span class="muted">—</span>'; }
function sqlTableHTML(){
  const all=sqlFiltered();
  const total=all.length, pages=Math.max(1,Math.ceil(total/sqlPageSize));
  if(sqlPage>pages) sqlPage=pages; if(sqlPage<1) sqlPage=1;
  const start=(sqlPage-1)*sqlPageSize, list=all.slice(start,start+sqlPageSize);
  return `<div class="tbl-wrap"><table>
    <thead><tr><th style="width:46px">序号</th><th>描述</th><th>类型</th><th>涉及数据表</th><th>使用业务域</th><th style="width:96px">SQL 命中数</th><th>状态</th><th style="width:90px">操作</th></tr></thead>
    <tbody>
      ${list.map((s,i)=>`<tr>
        <td class="muted">${start+i+1}</td>
        <td><b>${s.desc}</b></td>
        <td>${sqlTypePill(s.type)}</td>
        <td>${(s.tables||[]).map(t=>`<span class="pill" style="margin:0 4px 4px 0;font-size:11px">${t}</span>`).join('')||'<span class="muted">—</span>'}</td>
        <td>${(s.domains||[]).map(d=>`<span class="pill info" style="margin:0 4px 4px 0;font-size:11px">${d}</span>`).join('')||'<span class="muted">—</span>'}</td>
        <td><b style="color:var(--accent-2)">${s.hits.toLocaleString()}</b></td>
        <td>${sqlStPill(s.status)}</td>
        <td><div class="act"><a title="查看" onclick="sqlView(${s.id})"><i class="fa-solid fa-eye"></i></a><a title="编辑" onclick="sqlEdit(${s.id})"><i class="fa-solid fa-pen"></i></a><a class="del" title="删除" onclick="sqlDel(${s.id})"><i class="fa-solid fa-trash"></i></a></div></td>
      </tr>`).join('')}
      ${!list.length?'<tr><td colspan="8" class="muted" style="text-align:center;padding:32px">暂无匹配的 SQL 样例</td></tr>':''}
    </tbody></table></div>`;
}
function sqlPagerHTML(){
  const total=sqlFiltered().length, pages=Math.max(1,Math.ceil(total/sqlPageSize));
  if(sqlPage>pages) sqlPage=pages; if(sqlPage<1) sqlPage=1;
  const cur=sqlPage; let nums=[];
  if(pages<=7){ for(let i=1;i<=pages;i++) nums.push(i); }
  else{ nums.push(1); if(cur>3) nums.push('…'); const s=Math.max(2,cur-1),e=Math.min(pages-1,cur+1); for(let i=s;i<=e;i++) nums.push(i); if(cur<pages-2) nums.push('…'); nums.push(pages); }
  const btns=nums.map(n=> n==='…'?'<a class="dots">…</a>':`<a class="${n===cur?'on':''}" onclick="sqlGoPage(${n})">${n}</a>`).join('');
  return `<div class="pager"><span>共 ${total} 条</span>
    <a class="${cur<=1?'disabled':''}" ${cur>1?'onclick="sqlGoPage('+(cur-1)+')"':''}>‹</a>
    ${btns}
    <a class="${cur>=pages?'disabled':''}" ${cur<pages?'onclick="sqlGoPage('+(cur+1)+')"':''}>›</a></div>`;
}
function sqlGoPage(p){ const total=sqlFiltered().length, pages=Math.max(1,Math.ceil(total/sqlPageSize)); sqlPage=Math.min(pages,Math.max(1,p|0)); sqlRefresh(); }
function sqlSetKw(v){ sqlKw=v; sqlPage=1; sqlRefresh(); }
function sqlSetType(v){ sqlType=v; sqlPage=1; sqlRefresh(); }
function sqlSetDomain(v){ sqlDomain=v; sqlPage=1; sqlRefresh(); }
function sqlDetectParams(sql){
  const re=/\{\{\s*([\w一-龥]+)\s*\}\}/g; const set=[]; let m;
  while((m=re.exec(sql||''))){ if(!set.includes(m[1])) set.push(m[1]); }
  return set;
}
function sqlBeautify(sql){
  if(!sql) return '';
  let s=sql.replace(/\s+/g,' ').trim();
  const KW=/\b(select|from|where|group by|order by|having|limit|left join|right join|inner join|full join|join|on|and|or|union all|union)\b/gi;
  s=s.replace(KW, m=>m.toUpperCase());
  s=s.replace(/\s+(from|where|group by|order by|having|limit|left join|right join|inner join|full join|join|union all|union)\b/gi,'\n$1');
  s=s.replace(/\s+(and|or)\b/gi,'\n  $1');
  s=s.replace(/\s*;\s*$/,'');
  return s.trim();
}
function sqlBeautifyNow(){
  const el=document.getElementById('sqlText'); if(!el) return;
  el.value=sqlBeautify(el.value);
  sqlSyncParams();
}
function sqlToggleMax(){
  const ov=document.getElementById('sqlSmpModal'); if(!ov) return;
  const on=ov.classList.toggle('max');
  const btn=document.getElementById('sqlMaxBtn');
  if(btn) btn.innerHTML = on?'<i class="fa-solid fa-compress"></i>还原':'<i class="fa-solid fa-expand"></i>最大化';
}
function sqlValidate(sql){
  if(!sql||!sql.trim()) return {ok:false,msg:'SQL 内容为空'};
  const s=sql.trim();
  if(!/^select\b/i.test(s)) return {ok:false,msg:'样例 SQL 需以 SELECT 开头（当前仅支持查询类样例）'};
  if(!/\bfrom\b/i.test(s)) return {ok:false,msg:'缺少 FROM 子句'};
  let bal=0; for(const c of s){ if(c==='(')bal++; else if(c===')')bal--; if(bal<0) return {ok:false,msg:'括号不匹配：右括号多于左括号'}; }
  if(bal!==0) return {ok:false,msg:'括号不匹配：左右括号数量不一致'};
  const open=(s.match(/\{\{/g)||[]).length, close=(s.match(/\}\}/g)||[]).length;
  if(open!==close) return {ok:false,msg:'动态参数 {{ }} 未成对闭合'};
  if(/\b(DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER|CREATE|EXEC|EXECUTE|MERGE)\b/i.test(s)) return {ok:false,msg:'检测到非查询类危险关键字，样例 SQL 仅允许 SELECT'};
  return {ok:true,msg:'校验通过'};
}
function sqlSyncParams(){
  const g=id=>document.getElementById(id);
  const txt=g('sqlText').value||'';
  // 先回写当前已填的元数据，避免重渲染时丢失
  sqlParamNames.forEach((n,i)=>{ if(sqlParamsMeta[n]){ sqlParamsMeta[n].desc=g('pDesc'+i).value; sqlParamsMeta[n].type=g('pType'+i).value; sqlParamsMeta[n].def=g('pDef'+i).value; } });
  const names=sqlDetectParams(txt);
  const next={}; names.forEach(n=>{ next[n]=sqlParamsMeta[n]||{desc:'',type:'字符串',def:''}; });
  sqlParamsMeta=next; sqlParamNames=names;
  const box=g('sqlParamsBox'); if(box) box.innerHTML=sqlParamsHTML(names);
}
function sqlParamsHTML(names){
  if(!names.length) return '<div class="param-empty">未检测到动态参数。在 SQL 中使用 <code>{{参数名}}</code>（如 <code>{{统计年份}}</code>）即可自动识别并配置。</div>';
  const types=['字符串','数值','日期','布尔','枚举'];
  return '<div class="param-list"><div class="param-head">检测到 '+names.length+' 个动态参数，请完善配置：</div>'+
    names.map((n,i)=>`<div class="param-row">
      <div class="form-field"><label>参数名称</label><input class="ro" value="{{${n}}}" readonly></div>
      <div class="form-field"><label>描述</label><input id="pDesc${i}" value="${sqlParamsMeta[n].desc.replace(/"/g,'&quot;')}" placeholder="参数说明"></div>
      <div class="form-field"><label>数据类型</label><select id="pType${i}">${types.map(t=>`<option ${sqlParamsMeta[n].type===t?'selected':''}>${t}</option>`).join('')}</select></div>
      <div class="form-field"><label>默认值</label><input id="pDef${i}" value="${sqlParamsMeta[n].def.replace(/"/g,'&quot;')}" placeholder="可选"></div>
    </div>`).join('')+'</div>';
}
function sqlResetForm(){
  const g=id=>document.getElementById(id);
  g('sqlDesc').value=''; g('sqlText').value='';
  sqlParamNames=[]; sqlParamsMeta={};
  const box=g('sqlParamsBox'); if(box) box.innerHTML=sqlParamsHTML([]);
  const st=g('sqlSaveStatus'); if(st){ st.className='sql-save-st'; st.textContent=''; }
  const btn=g('sqlSaveBtn'); if(btn){ btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i>保存'; }
  const ov=document.getElementById('sqlSmpModal'); if(ov) ov.classList.remove('max');
  const mb=g('sqlMaxBtn'); if(mb) mb.innerHTML='<i class="fa-solid fa-expand"></i>最大化';
}
function sqlAdd(){ sqlEditId=null; const t=document.getElementById('sqlModalTitle'); if(t) t.textContent='新增样例'; sqlResetForm(); openModal('sqlSmpModal'); }
function sqlEdit(id){
  const s=SQL_SAMPLES.find(x=>x.id===id); if(!s) return; sqlEditId=id;
  const g=id=>document.getElementById(id);
  g('sqlModalTitle').textContent='编辑样例';
  g('sqlDesc').value=s.desc||''; g('sqlText').value=s.sql||'';
  sqlParamNames=[]; sqlParamsMeta={};
  if(s.params&&s.params.length){ s.params.forEach(p=>{ sqlParamsMeta[p.name]={desc:p.desc||'',type:p.type||'字符串',def:p.def||''}; }); sqlParamNames=s.params.map(p=>p.name); }
  const box=g('sqlParamsBox'); if(box) box.innerHTML=sqlParamsHTML(sqlParamNames);
  openModal('sqlSmpModal');
}
function sqlView(id){
  const s=SQL_SAMPLES.find(x=>x.id===id); if(!s) return;
  const g=id=>document.getElementById(id);
  const body=g('sqlViewBody');
  if(body){
    const dl=[['类型', sqlTypePill(s.type)],['状态', sqlStPill(s.status)],['SQL 命中数', '<b style="color:var(--accent-2)">'+(s.hits||0).toLocaleString()+'</b>']];
    body.innerHTML = `
      <div class="sv-desc"><b>${escHtml(s.desc)}</b></div>
      <div class="sv-meta">
        ${dl.map(([k,v])=>`<div class="sv-meta-item"><span class="sv-k">${k}</span>${v}</div>`).join('')}
        <div class="sv-meta-item"><span class="sv-k">使用业务域</span>${(s.domains||[]).map(d=>`<span class="pill info" style="margin:0 4px 4px 0;font-size:11px">${d}</span>`).join('')||'<span class="muted">—</span>'}</div>
        <div class="sv-meta-item"><span class="sv-k">涉及数据表</span>${(s.tables||[]).map(t=>`<span class="pill" style="margin:0 4px 4px 0;font-size:11px">${t}</span>`).join('')||'<span class="muted">—</span>'}</div>
      </div>
      ${ (s.params&&s.params.length)?`<div class="sv-params"><div class="sv-k">动态参数</div>${s.params.map(p=>`<div class="sv-param">${escHtml(p.name)} · ${p.type||'—'}${p.def?' · 默认 '+escHtml(p.def):''}</div>`).join('')}</div>`:''}
      <div class="sv-sql-h"><span class="sv-k">SQL 配置</span></div>
      <pre class="sql-view">${escHtml(sqlBeautify(s.sql||''))}</pre>`;
  }
  openModal('sqlViewModal');
}
function sqlSave(){
  if(sqlSaving) return;
  const g=id=>document.getElementById(id);
  const desc=g('sqlDesc').value.trim();
  const sql=g('sqlText').value.trim();
  if(!desc){ alert('请填写样例描述'); return; }
  if(!sql){ alert('请填写 SQL 配置'); return; }
  // 进入校验执行态（模拟后台执行 SQL 校验）
  sqlSaving=true;
  const btn=document.getElementById('sqlSaveBtn');
  const st=document.getElementById('sqlSaveStatus');
  if(btn){ btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> 校验执行中…'; }
  if(st){ st.className='sql-save-st'; st.textContent='正在校验执行 SQL…'; }
  setTimeout(()=>{
    const v=sqlValidate(sql);
    if(!v.ok){
      if(st){ st.className='sql-save-st err'; st.textContent='✗ 校验未通过：'+v.msg; }
      if(btn){ btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i>保存'; }
      sqlSaving=false;
      return;
    }
    // 校验通过 → 落库保存
    const names=sqlDetectParams(sql);
    const params=names.map((n,i)=>({name:n,desc:(g('pDesc'+i).value||'').trim(),type:(g('pType'+i).value),def:(g('pDef'+i).value||'').trim()}));
    if(sqlEditId!=null){
      const s=SQL_SAMPLES.find(x=>x.id===sqlEditId);
      if(s){ s.desc=desc; s.sql=sql; s.params=params; }
      alert('样例已更新（演示）');
    } else {
      SQL_SAMPLES.unshift({id:sqlNextId++,desc,sql,params,hits:0});
      sqlType='全部'; sqlDomain='全部'; sqlKw=''; sqlSelTbl=''; sqlSelSrc=-1; sqlSelSch=''; sqlPage=1;
      alert('样例已新增（演示）');
    }
    if(st){ st.className='sql-save-st ok'; st.textContent='✓ 校验通过，已保存'; }
    closeModal('sqlSmpModal'); renderView('sqlsample');
    sqlSaving=false; if(btn){ btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i>保存'; }
  }, 650);
}
function sqlDel(id){
  const s=SQL_SAMPLES.find(x=>x.id===id); if(!s) return;
  showConfirm('确定删除 SQL 样例「'+s.desc+'」？删除后不可恢复。', ()=>{
    const i=SQL_SAMPLES.findIndex(x=>x.id===id); if(i>=0) SQL_SAMPLES.splice(i,1);
    sqlRefresh();
  });
}
function sqlRefresh(){ const w=document.getElementById('sqlListWrap'); if(w) w.innerHTML=sqlTableHTML(); const p=document.getElementById('sqlPager'); if(p) p.innerHTML=sqlPagerHTML(); }
/* 自动生成样例：基于「已梳理完成」的元数据（表中文名 + 字段业务含义齐全）批量生成 SQL 样例 */
function sqlCompleteTables(){
  const out=[];
  META_SRCS.forEach(s=>{
    (s.tables||[]).forEach(t=>{
      if(!t.cn || !t.cn.trim()) return;                                   // 表中文名未梳理
      const flds=(t.fields||[]).filter(f=>f.cn&&f.cn.trim()&&f.desc&&f.desc.trim());
      if(flds.length<1) return;                                           // 无可用字段
      out.push({s,t,flds});
    });
  });
  return out;
}
function sqlDomOf(s){
  const name=s.name||'';
  const map=[['用地','用地审批'],['审批','用地审批'],['不动产','不动产登记'],['登记','不动产登记'],['测绘','测绘地理'],['空间','空间规划'],['规划','空间规划'],['耕地','耕地保护']];
  for(const [k,v] of map) if(name.includes(k)) return [v];
  return [name];
}
function sqlAutoGen(btn){
  const complete=sqlCompleteTables();
  if(!complete.length){ showToast('暂无已梳理完成的元数据，无法自动生成样例'); return; }
  if(btn){ btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>生成中…'; }
  // 模拟后台基于元数据生成样例的过程
  setTimeout(()=>{
    const gen=[];
    complete.forEach(({s,t,flds})=>{
      const tn=t.n, dom=sqlDomOf(s);
      const pick=flds.slice(0,3).map(f=>f.n);                              // 取前 3 个已梳理字段
      gen.push({ id:sqlNextId++, desc:`查询「${t.cn}」的${pick.length}项基础信息`, sql:`SELECT ${pick.join(', ')} FROM ${tn} LIMIT 100`, type:'单表查询', status:'on', hits:0, domains:dom, tables:[tn] });
      gen.push({ id:sqlNextId++, desc:`统计「${t.cn}」记录总数`, sql:`SELECT COUNT(*) AS total FROM ${tn}`, type:'总量统计', status:'on', hits:0, domains:dom, tables:[tn] });
      const dim=flds.find(f=>f.enum && f.enum!=='—');                     // 存在枚举/分类字段则补充分类统计
      if(dim) gen.push({ id:sqlNextId++, desc:`按「${dim.cn}」统计「${t.cn}」数量分布`, sql:`SELECT ${dim.n}, COUNT(*) AS cnt FROM ${tn} GROUP BY ${dim.n}`, type:'分类统计', status:'on', hits:0, domains:dom, tables:[tn] });
    });
    let added=0;
    gen.forEach(g=>{ if(!SQL_SAMPLES.some(x=>x.sql===g.sql)){ SQL_SAMPLES.unshift(g); added++; } });  // 去重后落库
    sqlType='全部'; sqlDomain='全部'; sqlKw=''; sqlSelTbl=''; sqlSelSrc=-1; sqlSelSch=''; sqlPage=1;
    renderView('sqlsample');
    showToast(`已基于 ${complete.length} 张已梳理完成的表，自动生成 ${added} 条 SQL 样例`);
  }, 650);
}
VIEWS.sqlsample=()=>`
${ph('SQL 样例管理','SQL 样例库的新增、编辑、分类、标签管理 · 批量导入导出 ', `<button class="btn primary" id="sqlAutoGenBtn" onclick="sqlAutoGen(this)"><i class="fa-solid fa-wand-magic-sparkles"></i>自动生成样例</button>`)}
<div class="meta-tree">
  <div class="tree-side">
    <div class="ts-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索数据源 / 表" value="${sqlTreeKw}" oninput="sqlTreeFilter(this.value)"></div>
    <div id="sqlTreeWrap">${sqlTreeHTML()}</div>
  </div>
  <div class="tree-main">
    <div class="tbl-bar">
      <div class="sm-filters">
        ${sqlSelSrc>=0?`<span class="pill info" style="cursor:pointer" onclick="sqlClearSrc()" title="点击清除筛选">数据源：${META_SRCS[sqlSelSrc].name} <i class="fa-solid fa-xmark" style="margin-left:5px"></i></span>`:''}
        ${sqlSelSch?`<span class="pill info" style="cursor:pointer" onclick="sqlClearSch()" title="点击清除筛选">schema：${sqlSelSch.split('::')[1]} <i class="fa-solid fa-xmark" style="margin-left:5px"></i></span>`:''}
        ${sqlSelTbl?`<span class="pill info" style="cursor:pointer" onclick="sqlClearTbl()" title="点击清除筛选">涉及数据表：${sqlSelTbl} <i class="fa-solid fa-xmark" style="margin-left:5px"></i></span>`:''}
        <select class="gl-sel" onchange="sqlSetType(this.value)">
          <option value="全部"${sqlType==='全部'?' selected':''}>全部类型</option>
          <option value="单表查询"${sqlType==='单表查询'?' selected':''}>单表查询</option>
          <option value="多表查询"${sqlType==='多表查询'?' selected':''}>多表查询</option>
          <option value="总量统计"${sqlType==='总量统计'?' selected':''}>总量统计</option>
          <option value="分类统计"${sqlType==='分类统计'?' selected':''}>分类统计</option>
        </select>
        <select class="gl-sel" onchange="sqlSetDomain(this.value)">
          <option value="全部"${sqlDomain==='全部'?' selected':''}>全部业务域</option>
          ${[...new Set(SQL_SAMPLES.flatMap(s=>s.domains||[]))].map(d=>`<option value="${d}"${sqlDomain===d?' selected':''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索描述 / 业务域 / 涉及数据表" value="${sqlKw}" oninput="sqlSetKw(this.value)"></div>
      <div class="tbl-acts"><button class="btn"><i class="fa-solid fa-file-import"></i>批量导入</button><button class="btn primary" onclick="sqlAdd()"><i class="fa-solid fa-plus"></i>新增样例</button></div>
    </div>
    <div id="sqlListWrap">${sqlTableHTML()}</div>
    <div id="sqlPager">${sqlPagerHTML()}</div>
  </div>
</div>`;

/* ---- SQL 纠偏反馈 ---- */
const CR_LIST=[
  {id:'FB-260724-001',q:'去年商业用地成交总额是多少',rew:'2025 年度商业用地成交总金额（按成交价汇总）',src:'国土空间规划库',sqlType:'召回样例',fbType:'点踩',reason:'口径错误',user:'演示用户13',time:'2026-07-24 09:12',status:'待处理',handleMethod:'—',handleTime:'—',handler:'—',
    proc:[
      ['用户反馈','用户演示用户13于 2026-07-24 09:12 提交点踩反馈，原问题「去年商业用地成交总额是多少」','演示用户13'],
      ['自动归因','系统识别口径错误：原始生成按「出让面积」汇总，应为「成交金额」','SQL 纠偏引擎'],
      ['专家复核','领域专家确认口径，标注正确聚合字段为 demo_t_land_deal.deal_amount','数据治理组'],
      ['样例沉淀','修正后 SQL 已沉淀至 SQL 样例库（召回样例）','样例管理'],
    ]},
  {id:'FB-260724-002',q:'各街道人口密度排名',rew:'各街道常住人口 ÷ 街道面积，密度降序排列',src:'人口统计库',sqlType:'模型生成',fbType:'点踩',reason:'字段映射错误',user:'演示用户17',time:'2026-07-24 08:40',status:'待处理',handleMethod:'—',handleTime:'—',handler:'—',
    proc:[
      ['用户反馈','用户演示用户17于 2026-07-24 08:40 提交点踩反馈','演示用户17'],
      ['自动归因','系统识别字段映射错误：人口表与街道边界表关联键不一致','SQL 纠偏引擎'],
      ['专家复核','待数据治理组确认街道编码映射关系','—'],
    ]},
  {id:'FB-260724-003',q:'最近的地质灾害点距离',rew:'调用 ST_Distance 计算与最近灾害点的距离',src:'测绘成果库',sqlType:'模型生成',fbType:'点踩',reason:'空间函数缺失',user:'演示用户21',time:'2026-07-23 16:22',status:'已处理',handleMethod:'补充/优化样例',handleTime:'2026-07-23 17:10',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户21于 2026-07-23 16:22 提交点踩反馈','演示用户21'],
      ['自动归因','系统识别空间函数缺失：原生成未调用 ST_Distance','SQL 纠偏引擎'],
      ['专家复核','专家补充空间函数用法，已生成修正 SQL','测绘治理组'],
      ['验证中','修正 SQL 正在执行验证，预计 30 分钟内完成','SQL 纠偏引擎'],
    ]},
  {id:'FB-260724-004',q:'耕地面积同比变化',rew:'（当年耕地 − 上年耕地）÷ 上年耕地',src:'不动产登记库',sqlType:'召回样例',fbType:'点踩',reason:'聚合逻辑修正',user:'演示用户25',time:'2026-07-23 14:05',status:'已处理',handleMethod:'补充/优化元数据',handleTime:'2026-07-23 15:30',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户25于 2026-07-23 14:05 提交点踩反馈','演示用户25'],
      ['自动归因','系统识别聚合逻辑修正：同比计算口径偏差','SQL 纠偏引擎'],
      ['专家复核','专家确认同比口径，修正聚合逻辑','数据治理组'],
      ['样例沉淀','修正后 SQL 已沉淀至 SQL 样例库（召回样例）','样例管理'],
      ['已处理','反馈处理完成并归档','系统'],
    ]},
  {id:'FB-260724-005',q:'工业用地出让均价',rew:'工业用地出让总价 ÷ 出让宗数',src:'国土空间规划库',sqlType:'模型生成',fbType:'点赞',reason:'—',user:'演示用户30',time:'2026-07-23 11:30',status:'已处理',handleMethod:'补充/优化样例',handleTime:'2026-07-23 12:00',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户30于 2026-07-23 11:30 提交点赞反馈，结果符合预期','演示用户30'],
      ['自动记录','系统记录该生成结果为正向样本','SQL 纠偏引擎'],
      ['已处理','正向反馈归档，无需修正','系统'],
    ]},
  {id:'FB-260724-006',q:'统计各产业园区的入驻企业数量与产值',rew:['园区 A 入驻企业数 + 合计产值（demo_t_park_enterprise 聚合）','园区 B 跨区域产值对比（跨库 JOIN）'],src:'国土空间规划库',sqlType:'模型生成',fbType:'点赞',reason:'—',user:'演示用户08',time:'2026-07-23 10:15',status:'已处理',handleMethod:'补充/优化样例',handleTime:'2026-07-23 11:20',handler:'业务人员',
    sqls:[
      'SELECT park_name, COUNT(enterprise_id) AS ent_cnt, SUM(output_value) AS total_output\nFROM demo_t_park_enterprise\nGROUP BY park_name',
      'SELECT a.park_name, b.output_value\nFROM demo_t_park_enterprise a\nJOIN demo_t_park_output b ON a.park_id = b.park_id'
    ],
    proc:[
      ['用户反馈','用户演示用户08于 2026-07-23 10:15 提交点赞反馈：同一问题被拆解为两个 SQL 查询','演示用户08'],
      ['智能拆解','系统将「入驻企业数量与产值」拆解为（1）单园区聚合（2）跨园区对比两条 SQL','SQL 纠偏引擎'],
      ['自动记录','两条 SQL 均命中正向样本，标记为可直接沉淀','SQL 纠偏引擎'],
      ['已处理','两条 SQL 已自动转为 SQL 样例，无需人工复核','系统'],
    ]},
  {id:'FB-260724-007',q:'各产业用地结构占比',rew:'按用地类型聚合面积，计算各类型占比',src:'国土空间规划库',sqlType:'模型生成',fbType:'点赞',reason:'',user:'演示用户07',time:'2026-07-22 15:40',status:'已处理',handleMethod:'补充/优化样例',handleTime:'2026-07-22 16:20',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户07于 2026-07-22 15:40 提交点赞反馈，结果符合预期','演示用户07'],
      ['自动记录','系统记录该生成结果为正向样本','SQL 纠偏引擎'],
      ['已处理','正向反馈归档，无需修正','系统'],
    ]},
  {id:'FB-260724-008',q:'今年第一季度住宅用地供应面积',rew:'按季度=2026Q1、用地类型=住宅 汇总供应面积',src:'国土空间规划库',sqlType:'模型生成',fbType:'点踩',reason:'口径错误',user:'演示用户33',time:'2026-07-24 07:55',status:'待处理',handleMethod:'—',handleTime:'—',handler:'—',
    proc:[
      ['用户反馈','用户演示用户33于 2026-07-24 07:55 提交点踩反馈，原问题「今年第一季度住宅用地供应面积」','演示用户33'],
      ['自动归因','系统识别口径错误：原生成按「成交面积」统计，应为「供应面积」','SQL 纠偏引擎'],
    ]},
  {id:'FB-260724-009',q:'各开发区工业总产值排名',rew:'按开发区聚合工业总产值，降序排列',src:'产业经济库',sqlType:'模型生成',fbType:'点踩',reason:'字段映射错误',user:'演示用户04',time:'2026-07-24 07:20',status:'待处理',handleMethod:'—',handleTime:'—',handler:'—',
    proc:[
      ['用户反馈','用户演示用户04于 2026-07-24 07:20 提交点踩反馈，原问题「各开发区工业总产值排名」','演示用户04'],
      ['自动归因','系统识别字段映射错误：产值字段取自 demo_t_eco_output，原生成误用 demo_t_industry_stat','SQL 纠偏引擎'],
    ]},
  {id:'FB-260724-010',q:'近三年建设用地审批通过率',rew:'按年度统计审批通过数 ÷ 受理数',src:'规划审批库',sqlType:'召回样例',fbType:'点踩',reason:'聚合逻辑修正',user:'演示用户28',time:'2026-07-23 18:30',status:'已转发',handleMethod:'—',handleTime:'—',handler:'系统运营人员',
    proc:[
      ['用户反馈','用户演示用户28于 2026-07-23 18:30 提交点踩反馈，原问题「近三年建设用地审批通过率」','演示用户28'],
      ['自动归因','系统识别聚合逻辑修正：原生成未按年度分组计算通过率','SQL 纠偏引擎'],
      ['专家复核','专家确认通过率口径：通过数 ÷ 受理数，已生成修正 SQL 待验证','数据治理组'],
      ['验证中','修正 SQL 正在执行验证','SQL 纠偏引擎'],
      ['转发平台','业务负责人已将本反馈转发至系统运营人员处理','业务负责人'],
    ]},
  {id:'FB-260724-011',q:'基本农田保护面积较去年变化',rew:'本年基本农田面积 − 上年基本农田面积',src:'耕地保护库',sqlType:'模型生成',fbType:'点踩',reason:'维度缺失',user:'演示用户03',time:'2026-07-23 13:10',status:'已处理',handleMethod:'补充/优化元数据',handleTime:'2026-07-23 14:40',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户03于 2026-07-23 13:10 提交点踩反馈，原问题「基本农田保护面积较去年变化」','演示用户03'],
      ['自动归因','系统识别维度缺失：原生成未区分水田与旱地地类','SQL 纠偏引擎'],
      ['专家复核','专家补充耕地地类维度，修正聚合逻辑','耕地治理组'],
      ['样例沉淀','修正后 SQL 已沉淀至 SQL 样例库','样例管理'],
      ['已处理','反馈处理完成并归档','系统'],
    ]},
  {id:'FB-260724-012',q:'全市公园绿地服务半径覆盖率',rew:'500 米服务半径覆盖小区数 ÷ 总小区数',src:'国土空间规划库',sqlType:'模型生成',fbType:'点赞',reason:'—',user:'演示用户24',time:'2026-07-23 09:50',status:'已处理',handleMethod:'补充/优化样例',handleTime:'2026-07-23 10:20',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户24于 2026-07-23 09:50 提交点赞反馈，结果符合预期','演示用户24'],
      ['自动记录','系统记录该生成结果为正向样本','SQL 纠偏引擎'],
      ['已处理','正向反馈归档，无需修正','系统'],
    ]},
  {id:'FB-260724-013',q:'跨区县人口净流入情况',rew:'各区县迁入人口 − 迁出人口',src:'人口统计库',sqlType:'模型生成',fbType:'点踩',reason:'关联键错误',user:'演示用户36',time:'2026-07-22 20:15',status:'已处理',handleMethod:'补充/优化元数据',handleTime:'2026-07-22 21:30',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户36于 2026-07-22 20:15 提交点踩反馈，原问题「跨区县人口净流入情况」','演示用户36'],
      ['自动归因','系统识别关联键错误：人口表与区划表关联键应为 region_code','SQL 纠偏引擎'],
      ['专家复核','专家确认关联键，修正 JOIN 条件','数据治理组'],
      ['样例沉淀','修正后 SQL 已沉淀至 SQL 样例库','样例管理'],
      ['已处理','反馈处理完成并归档','系统'],
    ]},
  {id:'FB-260724-014',q:'各河流断面水质达标率',rew:'达标断面数 ÷ 监测断面总数',src:'生态环境库',sqlType:'模型生成',fbType:'点赞',reason:'—',user:'演示用户20',time:'2026-07-22 17:40',status:'已处理',handleMethod:'补充/优化样例',handleTime:'2026-07-22 18:05',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户20于 2026-07-22 17:40 提交点赞反馈，结果符合预期','演示用户20'],
      ['自动记录','系统记录该生成结果为正向样本','SQL 纠偏引擎'],
      ['已处理','正向反馈归档，无需修正','系统'],
    ]},
  {id:'FB-260724-015',q:'批而未供土地面积清单',rew:'筛选供应状态=已批未供 的土地面积',src:'国土空间规划库',sqlType:'召回样例',fbType:'点踩',reason:'条件缺失',user:'演示用户18',time:'2026-07-22 14:25',status:'已处理',handleMethod:'补充/优化元数据',handleTime:'2026-07-22 16:00',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户18于 2026-07-22 14:25 提交点踩反馈，原问题「批而未供土地面积清单」','演示用户18'],
      ['自动归因','系统识别条件缺失：原生成未过滤「已批未供」状态','SQL 纠偏引擎'],
      ['专家复核','专家补充供应状态过滤条件','土地利用组'],
      ['样例沉淀','修正后 SQL 已沉淀至 SQL 样例库','样例管理'],
      ['已处理','反馈处理完成并归档','系统'],
    ]},
  {id:'FB-260724-016',q:'查询全市耕地保有量',rew:'按年度汇总耕地保有量',src:'耕地保护库',sqlType:'模型生成',fbType:'点踩',reason:'指标口径存疑',user:'演示用户03',time:'2026-07-21 11:05',status:'已忽略',handleMethod:'—',handleTime:'2026-07-21 15:20',handler:'业务人员',
    proc:[
      ['用户反馈','用户演示用户03于 2026-07-21 11:05 提交点踩反馈，原问题「查询全市耕地保有量」','演示用户03'],
      ['自动归因','系统识别指标口径存疑：耕地保有量与耕地保护面积口径易混淆','SQL 纠偏引擎'],
      ['忽略反馈','业务人员复核后判定为重复口径咨询，属无效反馈，已忽略','业务人员'],
    ]},
];
/* 答句结果数据（供「查看答句结果」弹窗渲染，按反馈编号映射） */
const CR_ANSWER={
  'FB-260724-001':{answer:{title:'智能问数分析',subtitle:'2025 年度 · 商业用地成交统计',unit:'万元',
      kpis:[{label:'成交总额',value:'38,650'},{label:'成交宗数',value:'142'},{label:'平均单价',value:'272.2'}],
      summary:'2025 年度全市商业用地成交总额 3.87 亿元，共成交 142 宗，平均单价 272.2 万元/宗。同比去年增长 8.5%，其中中心城区占比达 62%。'}},
  'FB-260724-002':{answer:{title:'智能问数分析',subtitle:'各街道人口密度排名 TOP5',unit:'人/km²',
      kpis:[{label:'最高密度',value:'18,420'},{label:'平均密度',value:'6,380'},{label:'最低密度',value:'2,150'}],
      summary:'全区 18 个街道中，老城区街道人口密度普遍较高，新开发区街道密度较低。排名前三的街道分别为城关街道、中心街道、东门街道，均超过 15,000 人/km²。'}},
  'FB-260724-003':{answer:{title:'智能问数分析',subtitle:'最近地质灾害点空间距离分析',unit:'km',
      kpis:[{label:'最近距离',value:'2.34'},{label:'次近距离',value:'4.67'},{label:'平均距离',value:'8.92'}],
      summary:'经空间计算，目标区域周边共有 3 处已记录地质灾害点。最近一处位于东南方向 2.34 km，属滑坡隐患点，风险等级中等。建议加强监测预警。'}},
  'FB-260724-004':{answer:{title:'智能问数分析',subtitle:'耕地面积同比变化趋势',unit:'公顷',
      kpis:[{label:'本年耕地',value:'45,280'},{label:'上年耕地',value:'46,120'},{label:'同比变化',value:'-1.82%'}],
      summary:'本年度耕地总面积 45,280 公顷，较上年减少 840 公顷，同比下降 1.82%。主要减少来自建设占用转出 520 公顷和生态退耕转出 320 公顷。'}},
  'FB-260724-005':{answer:{title:'智能问数分析',subtitle:'工业用地出让均价统计',unit:'万元/亩',
      kpis:[{label:'出让均价',value:'186.5'},{label:'出让总价',value:'52,340'},{label:'出让宗数',value:'281'}],
      summary:'本期工业用地出让均价 186.5 万元/亩，共出让 281 宗，总成交额 5.23 亿元。均价环比上期上涨 3.2%，主要受高新区优质地块集中入市拉动。'}},
  'FB-260724-006':{answer:{title:'智能问数分析',subtitle:'各产业园区入驻企业与产值统计',unit:'家 / 亿元',
      kpis:[{label:'入驻企业总数',value:'1,856'},{label:'总产值',value:'426.8'},{label:'园区数量',value:'12'}],
      summary:'全区 12 个产业园区共入驻企业 1,856 家，总产值 426.8 亿元。其中高新科技园入驻 486 家、产值 128.5 亿元居首；智能制造园入驻 392 家、产值 96.3 亿元次之。'}},
  'FB-260724-007':{answer:{title:'智能问数分析',subtitle:'各产业用地结构占比',unit:'%',
      kpis:[{label:'工矿仓储',value:'34.2'},{label:'商服',value:'21.6'},{label:'住宅',value:'38.5'}],
      summary:'全区产业用地中住宅用地占比 38.5% 居首，工矿仓储用地 34.2% 次之，商服用地 21.6% 最少，另有少量公共管理与公共服务用地。整体结构趋于合理，商服地块集中度较高。'}},
  'FB-260724-008':{answer:{title:'智能问数分析',subtitle:'2026 Q1 · 住宅用地供应统计',unit:'公顷',
      kpis:[{label:'供应面积',value:'1,286'},{label:'供应宗数',value:'96'},{label:'同比变化',value:'+12.4%'}],
      summary:'2026 年第一季度全市住宅用地供应面积 1,286 公顷，共供应 96 宗，同比增长 12.4%。其中中心城区供应 540 公顷，占比 42%。'}},
  'FB-260724-009':{answer:{title:'智能问数分析',subtitle:'各开发区工业总产值 TOP5',unit:'亿元',
      kpis:[{label:'最高产值',value:'386.5'},{label:'平均产值',value:'142.8'},{label:'开发区数',value:'9'}],
      summary:'全市 9 个开发区中，高新开发区工业总产值 386.5 亿元居首，先进制造开发区 312.4 亿元次之，整体产值呈集聚态势。'}},
  'FB-260724-010':{answer:{title:'智能问数分析',subtitle:'2023–2025 建设用地审批通过率',unit:'%',
      kpis:[{label:'本年通过率',value:'86.2'},{label:'上年通过率',value:'83.5'},{label:'受理总数',value:'1,240'}],
      summary:'近三年建设用地审批通过率稳步提升，2025 年通过率 86.2%，较上年提升 2.7 个百分点，审批质效持续优化。'}},
  'FB-260724-011':{answer:{title:'智能问数分析',subtitle:'基本农田保护面积同比变化',unit:'公顷',
      kpis:[{label:'本年保护',value:'38,420'},{label:'上年保护',value:'37,980'},{label:'同比变化',value:'+1.16%'}],
      summary:'本年度基本农田保护面积 38,420 公顷，较上年增加 440 公顷，同比增长 1.16%，保护红线保持稳定。'}},
  'FB-260724-012':{answer:{title:'智能问数分析',subtitle:'公园绿地服务半径覆盖率',unit:'%',
      kpis:[{label:'覆盖率',value:'92.6'},{label:'达标小区',value:'1,580'},{label:'缺口区域',value:'12'}],
      summary:'全市公园绿地 500 米服务半径覆盖率达 92.6%，覆盖 1,580 个居住小区，尚有 12 个老旧片区存在覆盖缺口。'}},
  'FB-260724-013':{answer:{title:'智能问数分析',subtitle:'各区县人口净流入 TOP5',unit:'万人',
      kpis:[{label:'最高净流入',value:'18.6'},{label:'平均净流入',value:'4.2'},{label:'净流入区县',value:'7'}],
      summary:'全市 7 个区县呈现人口净流入，中心城区与高新片区净流入最高，达 18.6 万人，人口集聚效应明显。'}},
  'FB-260724-014':{answer:{title:'智能问数分析',subtitle:'主要河流断面水质达标率',unit:'%',
      kpis:[{label:'达标率',value:'94.3'},{label:'监测断面',value:'86'},{label:'劣V类',value:'2'}],
      summary:'全市 86 个河流监测断面中，水质达标率 94.3%，仅 2 个断面仍为劣 V 类，较去年减少 3 个，水环境质量改善。'}},
  'FB-260724-015':{answer:{title:'智能问数分析',subtitle:'批而未供土地面积统计',unit:'公顷',
      kpis:[{label:'未供面积',value:'3,420'},{label:'涉及批次',value:'128'},{label:'处置率',value:'61.5%'}],
      summary:'全市批而未供土地面积 3,420 公顷，涉及 128 个批次，已处置 61.5%，剩余未供土地主要集中在产业园区周边。'}},
};
let crStatus='待处理', crKw='', crSel=new Set();
function crRewText(r){ return Array.isArray(r.rew)? r.rew.join(' '):r.rew; }
function crMethodPill(h){
  if(h==='—') return '<span class="muted">—</span>';
  if(h==='补充/优化元数据') return '<span class="pill meta">补充/优化元数据</span>';
  if(h==='补充/优化样例') return '<span class="pill on">补充/优化样例</span>';
  if(h==='补充术语解释') return '<span class="pill term">补充术语解释</span>';
  if(h==='清洗/更新数据') return '<span class="pill warn">清洗/更新数据</span>';
  if(h==='其他') return '<span class="pill off">其他</span>';
  return `<span class="pill">${h}</span>`;
}
function crFiltered(){
  const kw=crKw.trim().toLowerCase();
  return CR_LIST.filter(r=>
    (crStatus==='全部'||r.status===crStatus) &&
    (!kw || (r.q.toLowerCase().includes(kw)||crRewText(r).toLowerCase().includes(kw)||r.user.toLowerCase().includes(kw)||r.src.toLowerCase().includes(kw)))
  );
}
function crTableHTML(){
  const rows=crFiltered();
  return `<div class="tbl-wrap"><table>
    <thead><tr>
      <th style="width:38px"><input type="checkbox" ${rows.length&&rows.every(r=>crSel.has(r.id))?'checked':''} onclick="crToggleAll(this)"></th>
      <th style="width:46px">序号</th>
      <th>用户原始问题</th>
      <th>所属数据源</th>
      <th>点踩原因</th>
      <th>反馈用户</th>
      <th>反馈时间</th>
      <th>处理方式</th>
      <th>处理时间</th>
      <th>处理人</th>
      <th>状态</th>
      <th style="width:172px">操作</th>
    </tr></thead>
    <tbody>
      ${rows.map((r,i)=>`<tr>
        <td><input type="checkbox" ${crSel.has(r.id)?'checked':''} onclick="crToggle('${r.id}',this)"></td>
        <td class="muted">${i+1}</td>
        <td><b>${r.q}</b></td>
        <td>${r.src}</td>
        <td>${r.fbType==='点赞'?'<span class="muted">—</span>':`<span class="pill warn">${r.reason}</span>`}</td>
        <td>${r.user}</td>
        <td style="color:var(--text-3)">${r.time}</td>
        <td>${crMethodPill(r.handleMethod)}</td>
        <td style="color:var(--text-3)">${r.handleTime}</td>
        <td>${r.handler==='—'?'<span class="muted">—</span>':`<b>${r.handler}</b>`}</td>
        <td>${r.status==='待处理'?'<span class="pill err">待处理</span>':r.status==='已处理'?'<span class="pill on">已处理</span>':r.status==='已忽略'?'<span class="pill off">已忽略</span>':'<span class="pill info">已转发</span>'}</td>
        <td><div class="act">
          <a title="查看答句结果" onclick="crViewAnswer('${r.id}')"><i class="fa-solid fa-message"></i></a>
          ${r.status==='待处理'
            ?`<a title="处理" onclick="crOpenHandle('${r.id}')"><i class="fas fa-wrench"></i></a><a title="忽略（忽略无效反馈）" onclick="crIgnore('${r.id}')"><i class="fa-solid fa-eye-slash"></i></a><a title="转平台处理（转发系统运营人员）" onclick="crForward('${r.id}')"><i class="fa-solid fa-paper-plane"></i></a>`
            :''}
        </div></td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}
/* 同步状态筛选 chip 的选中（active）高亮 */
function syncStatusChips(status){
  document.querySelectorAll('#content .tbl-bar .chip[data-status]').forEach(c=>c.classList.toggle('active', c.dataset.status===status));
}
function crSetStatus(s){ crStatus=s; crRefresh(); syncStatusChips(s); }
function crSetKw(v){ crKw=v; crRefresh(); }
function crToggle(id,el){ if(el.checked) crSel.add(id); else crSel.delete(id); crUpdateBatchBtns(); }
function crToggleAll(el){ const rows=crFiltered(); if(el.checked) rows.forEach(r=>crSel.add(r.id)); else crSel.clear(); crRefresh(); }
function crUpdateBatchBtns(){
  /* 未勾选时批量操作视为作用于全部「待处理」记录，按钮始终可用 */
  ['crBatchHandleBtn','crBatchIgnoreBtn','crBatchForwardBtn'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.disabled=false;
  });
}
function crRefresh(){ const w=document.getElementById('crListWrap'); if(w) w.innerHTML=crTableHTML(); crUpdateBatchBtns(); }
function crViewProc(id){
  const r=CR_LIST.find(x=>x.id===id); if(!r) return;
  const body=document.getElementById('crProcBody');
  body.innerHTML=`<div class="proc-head">反馈编号 <b>${r.id}</b> · 原问题「${r.q}」</div>
    <ol class="timeline">
      ${r.proc.map((p,idx)=>`<li class="${idx===r.proc.length-1?'last':''}"><div class="tl-dot"></div><div class="tl-body"><div class="tl-t">${p[0]}</div><div class="tl-d">${p[1]}</div><div class="tl-who">处理人：${p[2]}</div></div></li>`).join('')}
    </ol>`;
  openModal('crProcModal');
}
function crViewAnswer(id){
  const r=CR_LIST.find(x=>x.id===id); if(!r) return;
  const ans=CR_ANSWER[id]; if(!ans){ showToast('暂无答句结果'); return; }
  const a=ans.answer;
  const statusText = r.status==='已处理'?'已完成':r.status==='已转发'?'已转发':r.status==='已忽略'?'已忽略':'待处理';
  const statusCls = r.status==='已处理'?'on':r.status==='已转发'?'info':r.status==='已忽略'?'off':'warn';
  const body=document.getElementById('crAnswerBody');
  let procHTML='';
  if(r.proc && r.proc.length){
    procHTML=`<div class="ans-proc-body">
      <ol class="timeline">
        ${r.proc.map((p,idx)=>`<li class="${idx===r.proc.length-1?'last':''}"><div class="tl-dot"></div><div class="tl-body"><div class="tl-t">${p[0]}</div><div class="tl-d">${p[1]}</div><div class="tl-who">处理人：${p[2]}</div></div></li>`).join('')}
      </ol>
    </div>`;
  }
  body.innerHTML=`<div class="answer-card">
    <div class="ans-hd">
      <span><i class="fa-solid fa-wand-magic-sparkles"></i> ${a.title}</span>
      ${r.proc && r.proc.length ? `<span class="ans-proc-btn" onclick="this.closest('.answer-card').classList.toggle('proc-open')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.closest('.answer-card').classList.toggle('proc-open')}"><i class="fa-solid fa-chevron-down"></i> 查看处理过程</span>` : `<span class="ans-status ${statusCls}"><i class="fa-solid fa-circle-check"></i> ${statusText}</span>`}
    </div>
    <div class="ans-sub">${a.subtitle}<span class="ans-unit">单位：${a.unit}</span></div>
    <div class="ans-kpis">
      ${a.kpis.map(k=>`<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-val">${k.value}</div><div class="kpi-u">${a.unit}</div></div>`).join('')}
    </div>
    <div class="ans-summary">${a.summary}</div>
    <div class="ans-actions">
      ${r.fbType==='点踩'
        ? `<div class="ans-reason"><div class="ans-reason-h"><i class="fa-solid fa-circle-exclamation"></i> 点踩原因</div><div class="ans-reason-t">${r.reason}</div></div>`
        : `<div class="ans-reason ans-reason-empty"><div class="ans-reason-h">点踩原因</div><div class="ans-reason-t">该反馈为「点赞」类型，无点踩原因</div></div>`}
    </div>
    ${procHTML}
  </div>`;
  openModal('crAnswerModal');
}
function crOneSample(id){ crSel=new Set([id]); crBatchSample(); }
function crConvert(id){
  const r=CR_LIST.find(x=>x.id===id); if(!r) return;
  if(r.fbType==='点赞') crAutoSample(id);
  else { crSel=new Set([id]); crBatchSample(); }
}
function crAutoSample(id){
  const r=CR_LIST.find(x=>x.id===id); if(!r) return;
  const qs=Array.isArray(r.rew)?r.rew:[r.rew];
  const sqls=Array.isArray(r.sqls)?r.sqls:[];
  let n=0;
  qs.forEach((q,i)=>{
    SQL_SAMPLES.unshift({id:sqlNextId++,desc:q,sql:sqls[i]||'-- 待补充 SQL 文本',type:'单表查询',status:'on',hits:0,domains:[r.src],tables:[]});
    n++;
  });
  showToast('已自动转为 '+n+' 条 SQL 样例（演示）');
}
function crBatchSample(){
  const ids=[...crSel];
  if(!ids.length){ showToast('请先勾选需要转样例的反馈'); return; }
  showConfirm('确定将选中的 '+ids.length+' 条反馈转为 SQL 样例？', ()=>{
    crSel.clear(); crRefresh(); showToast('已转样例（演示）');
  });
}
/* 处理方式选项（与「处理方式」列一致） */
const CR_METHODS=['补充/优化元数据','补充/优化样例','补充术语解释','清洗/更新数据','其他'];
function crNow(){ const d=new Date(),p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
let _crMode='single', _crId=null, _crBatchIds=[];
/* 处理（业务人员处理）：弹窗选择处理方式 */
function crOpenHandle(id){ _crMode='single'; _crId=id; document.getElementById('crHandleMethod').value='补充/优化元数据'; document.getElementById('crHandleNote').value=''; openModal('crHandleModal'); }
/* 批量目标：未勾选时作用于全部「待处理」记录 */
function crPendingTargetIds(){ return crSel.size? [...crSel] : CR_LIST.filter(r=>r.status==='待处理').map(r=>r.id); }
function crOpenBatchHandle(){
  const ids=crPendingTargetIds();
  if(!ids.length){ showToast('当前没有待处理的反馈'); return; }
  _crMode='batch'; _crBatchIds=ids;
  document.getElementById('crHandleMethod').value='补充/优化元数据'; document.getElementById('crHandleNote').value='';
  openModal('crHandleModal');
}
function crBatchHandle(){
  const ids=crPendingTargetIds();
  if(!ids.length){ showToast('当前没有待处理的反馈'); return; }
  if(crSel.size){ crOpenBatchHandle(); return; }
  showConfirm('未勾选任何记录，将对全部 '+ids.length+' 条「待处理」反馈执行处理，是否继续？', ()=>crOpenBatchHandle());
}
function crDoHandle(){
  const m=document.getElementById('crHandleMethod').value;
  const note=document.getElementById('crHandleNote').value.trim();
  const ids=_crMode==='batch'?_crBatchIds:[_crId];
  const t=crNow();
  ids.forEach(id=>{ const r=CR_LIST.find(x=>x.id===id); if(!r) return; r.status='已处理'; r.handleMethod=m; r.handleTime=t; r.handler='业务人员'; r.proc.push(['业务处理','业务人员完成处理，处理方式：'+m+(note?('；说明：'+note):''),'业务人员']); });
  closeModal('crHandleModal'); crSel.clear(); _crBatchIds=[]; crRefresh(); showToast('已处理 '+ids.length+' 条反馈');
}
/* 忽略（忽略无效反馈） */
function crIgnore(id){
  const r=CR_LIST.find(x=>x.id===id); if(!r) return;
  showConfirm('确认忽略该反馈（判定为无效反馈）？', ()=>{
    r.status='已忽略'; r.handleMethod='—'; r.handleTime=crNow(); r.handler='业务人员';
    r.proc.push(['忽略反馈','业务人员判定为无效反馈，已忽略','业务人员']);
    crRefresh(); showToast('已忽略该反馈');
  });
}
function crBatchIgnore(){
  const ids=crPendingTargetIds();
  if(!ids.length){ showToast('当前没有待处理的反馈'); return; }
  const n=ids.length, scope=crSel.size?('选中的 '+n+' 条'):('全部 '+n+' 条「待处理」');
  showConfirm('确认忽略'+scope+'反馈（判定为无效反馈）？', ()=>{
    const t=crNow();
    ids.forEach(id=>{ const r=CR_LIST.find(x=>x.id===id); if(!r) return; r.status='已忽略'; r.handleMethod='—'; r.handleTime=t; r.handler='业务人员'; r.proc.push(['忽略反馈','业务人员判定为无效反馈，已忽略','业务人员']); });
    crSel.clear(); _crBatchIds=[]; crRefresh(); showToast('已忽略 '+n+' 条反馈');
  });
}
/* 转平台处理（业务负责人转发给系统运营人员处理） */
function crForward(id){
  const r=CR_LIST.find(x=>x.id===id); if(!r) return;
  showConfirm('确认将该反馈转发至系统运营人员处理？', ()=>{
    r.status='已转发'; r.handleMethod='—'; r.handleTime=crNow(); r.handler='系统运营人员';
    r.proc.push(['转发平台','业务负责人已转发至系统运营人员处理','业务负责人']);
    crRefresh(); showToast('已转发至系统运营人员');
  });
}
function crBatchForward(){
  const ids=crPendingTargetIds();
  if(!ids.length){ showToast('当前没有待处理的反馈'); return; }
  const n=ids.length, scope=crSel.size?('选中的 '+n+' 条'):('全部 '+n+' 条「待处理」');
  showConfirm('确认将'+scope+'反馈转发至系统运营人员处理？', ()=>{
    const t=crNow();
    ids.forEach(id=>{ const r=CR_LIST.find(x=>x.id===id); if(!r) return; r.status='已转发'; r.handleMethod='—'; r.handleTime=t; r.handler='系统运营人员'; r.proc.push(['转发平台','业务负责人已转发至系统运营人员处理','业务负责人']); });
    crSel.clear(); _crBatchIds=[]; crRefresh(); showToast('已转发 '+n+' 条反馈');
  });
}
/* crBatchHandle 已上移并重用 crPendingTargetIds（见上方） */
VIEWS.correct=()=>`
${ph('SQL 纠偏反馈管理','归集用户对 SQL 生成结果的纠错与优化反馈 · 详情查看 · 处理方式 · 闭环处理 ')}
<div class="card">
  <div class="tbl-bar">
    <span class="chip ${crStatus==='待处理'?'active':''}" data-status="待处理" onclick="crSetStatus('待处理')">待处理</span>
    <span class="chip ${crStatus==='已处理'?'active':''}" data-status="已处理" onclick="crSetStatus('已处理')">已处理</span>
    <span class="chip ${crStatus==='已忽略'?'active':''}" data-status="已忽略" onclick="crSetStatus('已忽略')">已忽略</span>
    <span class="chip ${crStatus==='已转发'?'active':''}" data-status="已转发" onclick="crSetStatus('已转发')">已转发</span>
    <span class="chip ${crStatus==='全部'?'active':''}" data-status="全部" onclick="crSetStatus('全部')">全部</span>
    <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索原始问题 / 数据源 / 用户" value="${crKw}" oninput="crSetKw(this.value)"></div>
    <div class="tbl-acts">
      <button class="btn" id="crBatchForwardBtn" onclick="crBatchForward()" disabled><i class="fa-solid fa-paper-plane"></i>批量转平台处理</button>
      <button class="btn" id="crBatchIgnoreBtn" onclick="crBatchIgnore()" disabled><i class="fa-solid fa-eye-slash"></i>批量忽略</button>
      <button class="btn" id="crBatchHandleBtn" onclick="crBatchHandle()" disabled><i class="fa-solid fa-user-check"></i>批量处理</button>
    </div></div>
  <div id="crListWrap">${crTableHTML()}</div>
</div>`;

/* ---- SQL 执行异常 · 列表 + 交互 ---- */
const EX_LIST=[
  {id:'EX-260724-021',q:'查一下高新区本月新出让的工业用地',rew:'按区域=高新区、月份=2026-07 筛选工业用地出让记录',src:'国土空间规划库',sqlSrc:'模型生成',cost:'—',user:'演示用户13',time:'2026-07-24 10:02',status:'未解决',type:'连接失败',sql:"SELECT * FROM demo_t_land_deal WHERE district='高新区' AND deal_month='2026-07'",rawError:'java.sql.SQLException: Communications link failure\nThe last packet sent successfully to the server was 0 milliseconds ago. The driver has not received any packets from the server.\nCaused by: com.mysql.cj.exceptions.CJCommunicationsException: Communications link failure\n\tat com.mysql.cj.jdbc.ConnectionImpl.createNewIO(ConnectionImpl.java:819)\n\tat com.mysql.cj.jdbc.ConnectionImpl.<init>(ConnectionImpl.java:449)'},
  {id:'EX-260724-020',q:'导出不动产登记办件明细',rew:'按登记日期导出办件明细',src:'不动产登记库',sqlSrc:'样例召回',cost:'—',user:'系统',time:'2026-07-24 09:58',status:'已解决',type:'语法错误',sql:"SELECT reg_id, owner FROM demo_t_estate_reg LIMIT 100;",rawError:'org.postgresql.util.PSQLException: ERROR: syntax error at or near "FROM"\n  Position: 42\n  Statement: SELECT reg_id, owner FROM demo_t_estate_reg LIMIT 100;\n  Hint: Check the SELECT list and the FROM clause.'},
  {id:'EX-260724-017',q:'汇总各项目批复面积',rew:'按项目聚合批复面积',src:'规划审批库',sqlSrc:'模型生成',cost:'—',user:'演示用户17',time:'2026-07-24 09:31',status:'未解决',type:'权限不足',sql:"SELECT * FROM demo_v_project_summary WHERE total_area > 100;",rawError:'org.postgresql.util.PSQLException: ERROR: permission denied for view "demo_v_project_summary"\n  Detail: User "li_guotu" does not have SELECT privilege on "demo_v_project_summary".\n  Hint: Ask the database administrator to GRANT SELECT on the view.'},
  {id:'EX-260724-018',q:'去年的建设用地审批面积排名',rew:'按审批面积降序排名',src:'国土空间规划库',sqlSrc:'模型生成',cost:'30.2s',user:'演示用户13',time:'2026-07-24 09:45',status:'未解决',type:'执行超时',sql:"SELECT proj_id, proj_name, land_area\nFROM demo_t_approval_project\nWHERE status = '批复'\nORDER BY approval_date DESC;",rawError:'java.sql.SQLTimeoutException: Statement cancelled due to timeout or client request.\nQuery timeout: 30 seconds exceeded.\nElapsed: 30.2s  Rows scanned: 12,480,000  Table: demo_t_approval_project\n  Hint: Add a covering index on (status, approval_date) or narrow the WHERE clause.'},
  {id:'EX-260724-011',q:'计算各地块几何面积',rew:'调用 ST_Area 计算地块几何面积',src:'测绘成果库',sqlSrc:'样例召回',cost:'28.7s',user:'演示用户21',time:'2026-07-24 08:12',status:'已关闭',type:'执行超时',sql:"SELECT ST_Area(geom) FROM demo_t_survey_parcel;",rawError:'java.sql.SQLTimeoutException: Statement cancelled due to timeout or client request.\nQuery timeout exceeded while executing ST_Area(geom) over 4,210,000 geometries.\nElapsed: 28.7s  Rows scanned: 4,210,000  Table: demo_t_survey_parcel'},
  {id:'EX-260724-022',q:'查规划指标表里的容积率',rew:'查询规划指标视图 demo_v_plan_index',src:'空间规划库',sqlSrc:'样例召回',cost:'—',user:'演示用户25',time:'2026-07-24 10:18',status:'未解决',type:'对象不存在',sql:"SELECT plot_ratio FROM demo_v_plan_index WHERE plan_id='P-2026-018';",rawError:'org.postgresql.util.PSQLException: ERROR: relation "demo_v_plan_index" does not exist\n  LINE 1: SELECT plot_ratio FROM demo_v_plan_index WHERE plan_id=\'P-2026-018\';\n                             ^\n  Hint: No such relation. Did you mean a relation in a different schema?'},
];
let exStatus='未解决', exKw='', exSel=new Set(), exPage=1, exPageSize=5;
function exFiltered(){
  const kw=exKw.trim().toLowerCase();
  return EX_LIST.filter(r=>
    (exStatus==='全部' || r.status===exStatus) &&
    (!kw || (r.q.toLowerCase().includes(kw) || (r.rew&&r.rew.toLowerCase().includes(kw)) || r.src.toLowerCase().includes(kw)))
  );
}
function exPageRows(){
  const all=exFiltered();
  const pages=Math.max(1, Math.ceil(all.length/exPageSize));
  if(exPage>pages) exPage=pages; if(exPage<1) exPage=1;
  const start=(exPage-1)*exPageSize;
  return all.slice(start, start+exPageSize);
}
function exPagerHTML(){
  const all=exFiltered();
  const total=all.length;
  const pages=Math.max(1, Math.ceil(total/exPageSize));
  if(exPage>pages) exPage=pages; if(exPage<1) exPage=1;
  const cur=exPage;
  let nums=[];
  if(pages<=7){ for(let i=1;i<=pages;i++) nums.push(i); }
  else{
    nums.push(1);
    if(cur>3) nums.push('…');
    const s=Math.max(2,cur-1), e=Math.min(pages-1,cur+1);
    for(let i=s;i<=e;i++) nums.push(i);
    if(cur<pages-2) nums.push('…');
    nums.push(pages);
  }
  const btns=nums.map(n=> n==='…'
    ? '<a class="dots">…</a>'
    : `<a class="${n===cur?'on':''}" onclick="exGoPage(${n})">${n}</a>`).join('');
  return `<div class="pager">
    <span>共 ${total} 条</span>
    <a class="${cur<=1?'disabled':''}" ${cur>1?'onclick="exGoPage('+(cur-1)+')"':''}>‹</a>
    ${btns}
    <a class="${cur>=pages?'disabled':''}" ${cur<pages?'onclick="exGoPage('+(cur+1)+')"':''}>›</a>
  </div>`;
}
function exGoPage(p){ const total=exFiltered().length; const pages=Math.max(1, Math.ceil(total/exPageSize)); exPage=Math.min(pages, Math.max(1, p|0)); exRefresh(); }
function exStPill(s){
  return s==='已解决'?'<span class="pill on">已解决</span>'
       : s==='已关闭'?'<span class="pill off">已关闭</span>'
       : '<span class="pill err">未解决</span>';
}
function exTypePill(t){
  const map={'连接失败':'err','语法错误':'warn','权限不足':'info','执行超时':'err','对象不存在':'warn'};
  return `<span class="pill ${map[t]||'err'}">${t}</span>`;
}
function exSrcPill(t){
  if(!t) return `<span class="muted">—</span>`;
  return `<span class="cr-src-plain">${t}</span>`;
}
function exTableHTML(){
  const rows=exPageRows();
  const start=(exPage-1)*exPageSize;
  const allChecked = rows.length>0 && rows.every(r=>exSel.has(r.id));
  return `<div class="tbl-wrap"><table>
    <thead><tr><th style="width:40px"><input type="checkbox" ${allChecked?'checked':''} onchange="exToggleAll(this.checked)"></th><th style="width:48px">序号</th><th>用户原始问题</th><th>改写问题</th><th>异常类型</th><th>数据源</th><th>SQL来源</th><th>触发用户</th><th>发生时间</th><th>状态</th><th style="width:120px">操作</th></tr></thead>
    <tbody>
      ${rows.map((r,i)=>`<tr>
        <td><input type="checkbox" ${exSel.has(r.id)?'checked':''} onchange="exToggle('${r.id}',this.checked)"></td>
        <td class="muted">${start+i+1}</td>
        <td>${r.q}</td>
        <td>${r.rew}</td>
        <td>${exTypePill(r.type)}</td>
        <td>${r.src}</td>
        <td>${exSrcPill(r.sqlSrc)}</td>
        <td>${r.user}</td>
        <td style="color:var(--text-3)">${r.time}</td>
        <td>${exStPill(r.status)}</td>
        <td><div class="act">
          <a title="查看 SQL" onclick="exViewSql('${r.id}')"><i class="fa-solid fa-code"></i></a>
          ${r.status==='未解决'?`<a title="重试" onclick="exRetry('${r.id}')"><i class="fa-solid fa-rotate-right"></i></a><a class="del" title="关闭" onclick="exClose('${r.id}')"><i class="fa-solid fa-xmark"></i></a>`:''}
        </div></td>
      </tr>`).join('')}
      ${!rows.length?'<tr><td colspan="11" class="muted" style="text-align:center;padding:32px">暂无匹配的异常记录</td></tr>':''}
    </tbody>
  </table></div>`;
}
function exToggle(id,on){ if(on) exSel.add(id); else exSel.delete(id); }
function exToggleAll(on){ exPageRows().forEach(r=>{ if(on) exSel.add(r.id); else exSel.delete(r.id); }); exRefresh(); }
function exSetStatus(s){ exStatus=s; exPage=1; exRefresh(); syncStatusChips(s); }
function exSetKw(v){ exKw=v; exPage=1; exRefresh(); }
function exRefresh(){ const el=document.getElementById('exListWrap'); if(el) el.innerHTML=exTableHTML(); const p=document.getElementById('exPager'); if(p) p.innerHTML=exPagerHTML(); }
function exViewSql(id){
  const r=EX_LIST.find(x=>x.id===id); if(!r) return;
  const body=document.getElementById('exSqlBody');
  if(body) body.innerHTML=`<div class="sv-desc"><b>${r.q} · ${r.type}</b></div>
    <div class="sv-meta"><div class="sv-meta-item"><span class="sv-k">数据源</span>${r.src}</div><div class="sv-meta-item"><span class="sv-k">状态</span>${r.status}</div><div class="sv-meta-item"><span class="sv-k">发生时间</span>${r.time}</div></div>
    <div class="sv-sql-h"><span class="sv-k">异常 SQL</span></div>
    <pre class="sql-view">${escHtml(sqlBeautify(r.sql||''))}</pre>
    <div class="sv-sql-h" style="margin-top:18px"><span class="sv-k">原始异常信息</span></div>
    <pre class="sv-err-box">${escHtml(r.rawError||'（暂无原始异常信息）')}</pre>`;
  openModal('exSqlModal');
}
function exRetry(id){
  showConfirm('确认对异常「'+id+'」重新执行？执行成功后状态将更新为「已解决」。', ()=>{
    const r=EX_LIST.find(x=>x.id===id); if(r){ r.status='已解决'; exSel.delete(id); } exRefresh(); showToast('已重新执行：'+id);
  });
}
function exClose(id){
  showConfirm('确认关闭异常「'+id+'」？关闭后将移至「已关闭」。', ()=>{
    const r=EX_LIST.find(x=>x.id===id); if(r){ r.status='已关闭'; exSel.delete(id); } exRefresh(); showToast('已关闭异常：'+id);
  });
}
function exBatchRetry(){
  const selUnresolved=[...exSel].filter(id=>{ const r=EX_LIST.find(x=>x.id===id); return r && r.status==='未解决'; });
  if(selUnresolved.length){
    showConfirm('确认批量重新执行选中的 '+selUnresolved.length+' 条「未解决」异常？', ()=>{
      selUnresolved.forEach(id=>{ const r=EX_LIST.find(x=>x.id===id); if(r) r.status='已解决'; });
      exSel.clear(); exRefresh(); showToast('已批量重新执行 '+selUnresolved.length+' 条异常');
    });
    return;
  }
  const allUnresolved=EX_LIST.filter(r=>r.status==='未解决');
  if(!allUnresolved.length){ showToast('当前没有未解决的异常'); return; }
  showConfirm('当前未勾选「未解决」记录，是否重试全部 '+allUnresolved.length+' 条未解决的异常？', ()=>{
    allUnresolved.forEach(r=>{ r.status='已解决'; });
    exSel.clear(); exRefresh(); showToast('已批量重新执行 '+allUnresolved.length+' 条异常');
  });
}
function exBatchClose(){
  const selUnresolved=[...exSel].filter(id=>{ const r=EX_LIST.find(x=>x.id===id); return r && r.status==='未解决'; });
  if(selUnresolved.length){
    showConfirm('确认批量关闭选中的 '+selUnresolved.length+' 条「未解决」异常？关闭后将移至「已关闭」。', ()=>{
      selUnresolved.forEach(id=>{ const r=EX_LIST.find(x=>x.id===id); if(r) r.status='已关闭'; });
      exSel.clear(); exRefresh(); showToast('已批量关闭 '+selUnresolved.length+' 条异常');
    });
    return;
  }
  const allUnresolved=EX_LIST.filter(r=>r.status==='未解决');
  if(!allUnresolved.length){ showToast('当前没有未解决的异常'); return; }
  showConfirm('当前未勾选「未解决」记录，是否关闭全部 '+allUnresolved.length+' 条未解决的异常？', ()=>{
    allUnresolved.forEach(r=>{ r.status='已关闭'; });
    exSel.clear(); exRefresh(); showToast('已批量关闭 '+allUnresolved.length+' 条异常');
  });
}
function exNotify(){ openModal('exNotifyModal'); }
function exNotifySave(){ closeModal('exNotifyModal'); showToast('通知配置已保存'); }

/* ---- SQL 执行异常 ---- */
VIEWS.exception=()=>`
${ph('SQL 执行异常管理','自动归集执行异常记录 · 轨迹查看 · 修复重试 · 实时通知 ')}
<div class="card">
  <div class="tbl-bar"><span class="chip ${exStatus==='未解决'?'active':''}" data-status="未解决" onclick="exSetStatus('未解决')">未解决</span><span class="chip ${exStatus==='已解决'?'active':''}" data-status="已解决" onclick="exSetStatus('已解决')">已解决</span><span class="chip ${exStatus==='已关闭'?'active':''}" data-status="已关闭" onclick="exSetStatus('已关闭')">已关闭</span><span class="chip ${exStatus==='全部'?'active':''}" data-status="全部" onclick="exSetStatus('全部')">全部</span>
    <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索原始问题 / 改写问题 / 数据源" value="${exKw}" oninput="exSetKw(this.value)"></div>
    <div class="tbl-acts"><button class="btn" onclick="exBatchClose()"><i class="fa-solid fa-xmark"></i>批量关闭</button><button class="btn primary" onclick="exBatchRetry()"><i class="fa-solid fa-rotate-right"></i>批量重试</button></div></div>
  <div id="exListWrap">${exTableHTML()}</div>
  <div id="exPager">${exPagerHTML()}</div>
</div>`;

/* ---- 业务域管理 ---- */
/* 数据源目录：每个数据源下预置可绑定的数据表与视图 */
const DS_CATALOG={
  '国土空间规划库':{tables:['demo_t_plan_land_use','demo_t_land_deal','demo_t_park_enterprise','demo_t_park_output'],views:['demo_v_plan_one_map','demo_v_land_use_stats']},
  '不动产登记库':{tables:['demo_t_estate_reg','demo_t_estate_mortgage','demo_t_estate_seize'],views:['demo_v_estate_summary']},
  '用地审批库':{tables:['demo_t_approval_apply','demo_t_approval_accept','demo_t_approval_complete'],views:['demo_v_approval_flow']},
  '耕地保护库':{tables:['demo_t_farmland_basic','demo_t_farmland_balance'],views:['demo_v_farmland_stats']},
  '测绘成果库':{tables:['demo_t_geo_parcel','demo_t_geo_entity'],views:['demo_v_parcel_geo']},
  '执法监察库':{tables:['demo_t_case_illegal','demo_t_case_mng'],views:['demo_v_case_stats']},
};
/* 业务域：支持父子层级（最多三级）。仅业务子域绑定数据表，非业务子域作为业务分类。
   parentId 为 null 表示顶级；type: 'leaf' 业务子域（绑定数据）/ 'category' 业务分类（仅归类） */
const BD_LIST=[
  {id:'D-C1',name:'自然资源',icon:'fa-folder',color:'#4f8cff',desc:'自然资源综合业务归类',parentId:null,type:'category',status:'on',authorized:true},
    {id:'D-C2',name:'空间规划',icon:'fa-folder',color:'#22c55e',desc:'国土空间与测绘归类',parentId:'D-C1',type:'category',status:'on',authorized:false},
      {id:'D-01',name:'国土空间规划',icon:'fa-map',color:'#4f8cff',desc:'规划编制、用途管制、一张图',parentId:'D-C2',type:'leaf',
       sources:[{src:'国土空间规划库',tables:['demo_t_plan_land_use','demo_t_land_deal'],views:['demo_v_plan_one_map']},{src:'测绘成果库',tables:['demo_t_geo_parcel'],views:[]}],roles:12,status:'on',authorized:true,authScopes:['D::演示部门03','D::演示部门09']},
      {id:'D-05',name:'测绘地理信息',icon:'fa-compass-drafting',color:'#22d3ee',desc:'测绘成果、地理实体、地名地址',parentId:'D-C2',type:'leaf',
       sources:[{src:'测绘成果库',tables:['demo_t_geo_parcel','demo_t_geo_entity'],views:['demo_v_parcel_geo']}],roles:7,status:'on',authorized:true,authScopes:['D::演示部门05','D::演示部门04']},
    {id:'D-C3',name:'权属登记',icon:'fa-folder',color:'#a78bfa',desc:'不动产登记与抵押归类',parentId:'D-C1',type:'category',status:'on',authorized:true,authScopes:['D::演示部门01']},
      {id:'D-02',name:'不动产登记',icon:'fa-house',color:'#22c55e',desc:'登记、抵押、查封、变更',parentId:'D-C3',type:'leaf',
       sources:[{src:'不动产登记库',tables:['demo_t_estate_reg','demo_t_estate_mortgage','demo_t_estate_seize'],views:['demo_v_estate_summary']}],roles:18,status:'on',authorized:true,authScopes:['D::演示部门18','D::演示部门11','D::演示部门12']},
  {id:'D-C4',name:'政务审批监管',icon:'fa-folder',color:'#f59e0b',desc:'审批与耕地保护归类',parentId:null,type:'category',status:'on',authorized:true},
    {id:'D-C5',name:'用地与耕地',icon:'fa-folder',color:'#ef4444',desc:'用地审批与耕地保护归类',parentId:'D-C4',type:'category',status:'on',authorized:false},
      {id:'D-03',name:'用地审批',icon:'fa-stamp',color:'#f59e0b',desc:'项目选址、用地预审、批后监管',parentId:'D-C5',type:'leaf',
       sources:[{src:'用地审批库',tables:['demo_t_approval_apply','demo_t_approval_accept','demo_t_approval_complete'],views:['demo_v_approval_flow']}],roles:9,status:'off',authorized:false,authScopes:[]},
      {id:'D-04',name:'耕地保护',icon:'fa-wheat-awn',color:'#a78bfa',desc:'基本农田、占补平衡、进出平衡',parentId:'D-C5',type:'leaf',
       sources:[{src:'耕地保护库',tables:['demo_t_farmland_basic'],views:['demo_v_farmland_stats']}],roles:6,status:'stop',authorized:true,authScopes:['D::演示部门16']},
    {id:'D-C6',name:'监管执法',icon:'fa-folder',color:'#ec4899',desc:'执法监察归类',parentId:'D-C4',type:'category',status:'on',authorized:false},
      {id:'D-06',name:'执法监察',icon:'fa-scale-balanced',color:'#ef4444',desc:'违法用地、卫片执法、案件管理',parentId:'D-C6',type:'leaf',
       sources:[{src:'执法监察库',tables:['demo_t_case_illegal'],views:[]}],roles:4,status:'off',authorized:false,authScopes:[]},
];
const BD_MAX_DEPTH=3;
function bdById(id){ return BD_LIST.find(x=>x.id===id); }
function bdChildrenOf(id){ return BD_LIST.filter(x=>x.parentId===id); }
function bdIsLeaf(d){ return bdChildrenOf(d.id).length===0; }
function bdDepth(id){ let d=0,cur=bdById(id); while(cur&&cur.parentId){ d++; cur=bdById(cur.parentId); } return d+1; }
function bdTableCount(d){ return (d.sources||[]).reduce((s,x)=>s+(x.tables?x.tables.length:0)+(x.views?x.views.length:0),0); }
function bdAgg(id){
  let leaves=0,tables=0,views=0; const src=new Set();
  (function walk(nid){ bdChildrenOf(nid).forEach(ch=>{
    if(bdIsLeaf(ch)){ leaves++; (ch.sources||[]).forEach(s=>{ src.add(s.src); tables+=(s.tables||[]).length; views+=(s.views||[]).length; }); }
    else walk(ch.id);
  }); })(id);
  return {leaves, tables, views, srcCount:src.size};
}
function bdPathName(id){ const parts=[]; let cur=bdById(id); while(cur){ parts.unshift(cur.name); cur=cur.parentId?bdById(cur.parentId):null; } return parts.join(' / '); }
/* 目录树视图（最多三级） */
let bdKw='';
let bdOnlyUnauth=false;
const bdCollapsed=new Set();
/* 授权规则：业务子域必须授权后才能被业务应用访问；父域（业务分类）允许不单独授权
   注意：声明为业务分类但暂无子域的节点，结构上虽无子节点，仍按父域对待（不强制授权） */
function bdIsLeafDomain(d){ return bdIsLeaf(d) && d.type!=='category'; }
function bdUnauthLeaves(){ return BD_LIST.filter(d=>bdIsLeafDomain(d)&&!bdAuthorized(d)); }
function bdHasUnauthLeaf(d){ return bdIsLeafDomain(d) ? !bdAuthorized(d) : bdChildrenOf(d.id).some(bdHasUnauthLeaf); }
function bdToggleUnauthFilter(){ bdOnlyUnauth=!bdOnlyUnauth; renderView('domain'); }
function bdToggleNode(id){ if(bdCollapsed.has(id)) bdCollapsed.delete(id); else bdCollapsed.add(id); renderView('domain'); }
function bdExpandAll(){ bdCollapsed.clear(); renderView('domain'); }
function bdCollapseAll(){ BD_LIST.forEach(d=>{ if(!bdIsLeaf(d)) bdCollapsed.add(d.id); }); renderView('domain'); }
function bdSearchTree(v){ bdKw=v; renderView('domain'); }

function bdTreeNodeHTML(d, depth){
  const isLeaf=bdIsLeafDomain(d);      /* 语义业务子域：绑定数据、须授权 */
  const hasKids=!bdIsLeaf(d);          /* 结构上是否已有子节点 */
  const kw=bdKw.trim();
  const expanded = (kw||bdOnlyUnauth) ? true : !bdCollapsed.has(d.id);
  const agg=isLeaf?null:bdAgg(d.id);
  const cnt=bdTableCount(d);
  const indent=18*depth;
  const statHtml = isLeaf
    ? `<span class="bd-stat"><b>${d.sources?d.sources.length:0}</b> 数据源 · <b>${cnt}</b> 表/视图</span>`
    : `<span class="bd-stat"><b>${agg.leaves}</b> 子域 · <b>${agg.srcCount}</b> 数据源 · <b>${agg.tables+agg.views}</b> 表/视图</span>`;
  const caret = hasKids
    ? `<span class="bd-caret ${expanded?'open':''}" onclick="event.stopPropagation();bdToggleNode('${d.id}')"><i class="fa-solid fa-chevron-right"></i></span>`
    : `<span class="bd-caret empty"></span>`;
  const nodeIcon = isLeaf
    ? `<i class="fa-solid ${d.icon}"></i>`
    : `<i class="fa-solid fa-folder-tree"></i>`;
  const addBtn = !isLeaf ? `<a title="新建子域" onclick="event.stopPropagation();bdOpenModal(null,'${d.id}')"><i class="fa-solid fa-folder-plus"></i></a>` : '';
  const rowOnclick = hasKids ? `bdToggleNode('${d.id}')` : `bdOpenModal('${d.id}')`;
  const authed=bdAuthorized(d);
  const cntTxt=(d.authScopes&&d.authScopes.length)?('已授权 · '+d.authScopes.length+' 项'):'已授权';
  /* 三态：已授权（绿）／业务子域未授权（琥珀待办）／父域未单独授权（弱化，允许） */
  const authHtml = authed
    ? `<span class="bd-auth on" title="${cntTxt}，点击调整授权范围" onclick="event.stopPropagation();bdOpenAuth('${d.id}')"><i class="fa-solid fa-shield-check"></i>已授权</span>`
    : isLeaf
      ? `<span class="bd-auth warn" title="待授权：业务子域须完成授权后才能被业务应用访问，点击立即配置" onclick="event.stopPropagation();bdOpenAuth('${d.id}')"><i class="fa-solid fa-triangle-exclamation"></i>待授权</span>`
      : `<span class="bd-auth none" title="父域未单独授权（允许）：访问权限由其下业务子域各自控制，点击可单独授权" onclick="event.stopPropagation();bdOpenAuth('${d.id}')"><i class="fa-solid fa-shield"></i>未单独授权</span>`;
  const row = `<div class="bd-node-row ${isLeaf?'leaf':'cat'}" style="padding-left:${indent+14}px" onclick="${rowOnclick}">
    ${caret}
    <span class="bd-node-ic ${isLeaf?'leaf':'cat'}">${nodeIcon}</span>
    <span class="bd-node-name">${d.name}</span>
    ${statHtml}
    <span class="pill ${d.status==='on'?'on':d.status==='off'?'warn':'off'}">${d.status==='on'?'已启用':d.status==='off'?'未启用':'已停用'}</span>
    ${authHtml}
    <span class="act">
      ${addBtn}
      <a title="授权" onclick="event.stopPropagation();bdOpenAuth('${d.id}')"><i class="fa-solid fa-user-shield"></i></a>
      <a title="编辑" onclick="event.stopPropagation();bdOpenModal('${d.id}')"><i class="fa-solid fa-pen"></i></a>
      <a class="del" title="删除" onclick="event.stopPropagation();bdRemove('${d.id}')"><i class="fa-solid fa-trash"></i></a>
    </span>
  </div>`;
  let kids='';
  if(hasKids && expanded){
    kids = bdChildrenOf(d.id).filter(ch=>!bdOnlyUnauth||bdHasUnauthLeaf(ch)).map(ch=>bdTreeNodeHTML(ch, depth+1)).join('');
  }
  return `<div class="bd-node">${row}${kids}</div>`;
}

VIEWS.domain=()=>{
  const kw=bdKw.trim().toLowerCase();
  const top=BD_LIST.filter(d=>!d.parentId);
  let visibleTop=top;
  if(kw){
    const hit=new Set();
    const mark=(d)=>{ let m=(d.name+' '+(d.desc||'')).toLowerCase().includes(kw); bdChildrenOf(d.id).forEach(ch=>{ if(mark(ch)) m=true; }); if(m) hit.add(d.id); return m; };
    top.forEach(d=>mark(d));
    visibleTop=top.filter(d=>hit.has(d.id));
  }
  if(bdOnlyUnauth) visibleTop=visibleTop.filter(d=>bdHasUnauthLeaf(d));
  const treeHtml = visibleTop.map(d=>bdTreeNodeHTML(d,0)).join('');
  const unauth=bdUnauthLeaves();
  const alertHtml = unauth.length ? `
  <div class="bd-alert">
    <i class="fa-solid fa-triangle-exclamation"></i>
    <span>有 <b>${unauth.length}</b> 个业务子域尚未授权（${unauth.slice(0,3).map(d=>d.name).join('、')}${unauth.length>3?' 等':''}），未授权的业务子域无法被业务应用访问，请及时完成授权。</span>
    <button class="btn sm ${bdOnlyUnauth?'primary':''}" onclick="bdToggleUnauthFilter()"><i class="fa-solid ${bdOnlyUnauth?'fa-list':'fa-filter'}"></i>${bdOnlyUnauth?'显示全部':'仅看待授权'}</button>
  </div>` : '';
  const emptyTxt = bdOnlyUnauth ? '全部业务子域均已完成授权' : '未找到匹配的业务域';
  return `
${ph('业务域管理','业务域支持父子层级（最多三级）：仅业务子域绑定数据表并须完成授权，非业务子域作为业务分类可不单独授权','')}
<div class="card">
  <div class="tbl-bar" id="bdTreeBar">
    <div class="bd-bar-left">
      <button class="btn sm" onclick="bdExpandAll()"><i class="fa-solid fa-arrow-down-wide-short"></i>展开全部</button>
      <button class="btn sm" onclick="bdCollapseAll()"><i class="fa-solid fa-arrow-up-wide-short"></i>收起全部</button>
    </div>
    <div class="bd-bar-right">
      <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索业务域名称" value="${bdKw}" oninput="bdSearchTree(this.value)"></div>
      <button class="btn primary" onclick="bdOpenModal()"><i class="fa-solid fa-plus"></i>新建业务域</button>
    </div>
  </div>
  ${alertHtml}
  <div class="bd-tree">
    ${treeHtml || `<div class="bd-empty">${emptyTxt}</div>`}
  </div>
</div>`;
};

/* ================= 业务应用管理（参考 AI应用注册管理：检索设置 → 关联数据设置） ================= */
const APP_LIST=[
  {id:'A-01',name:'综合演示助手',auth:'单点登录认证',dept:'演示部门08',contact:'演示用户16',
   domains:['国土空间规划','不动产登记','建设项目审批'],mode:'混合检索',desc:'面向多规合一业务的智能问答助手',status:'running'},
  {id:'A-02',name:'规划助手',auth:'单点登录认证',dept:'演示部门08',contact:'演示用户12',
   domains:['国土空间规划','建设项目审批'],mode:'自然语言检索',desc:'规划编制与审查辅助助手',status:'stopped'},
  {id:'A-03',name:'登记中心客服',auth:'无需认证',dept:'演示部门01',contact:'***',
   domains:['不动产登记'],mode:'精确匹配',desc:'不动产登记业务咨询客服',status:'running'},
  {id:'A-04',name:'移动端演示助手',auth:'移动令牌认证',dept:'演示部门08',contact:'演示用户14',
   domains:['农业农村','执法监察','测绘地理信息'],mode:'混合检索',desc:'面向移动端的政务 AI 助手',status:'offline'},
  {id:'A-05',name:'AI助手',auth:'单点登录认证',dept:'演示部门08',contact:'演示用户14',
   domains:['国土空间规划','农业农村','执法监察','测绘地理信息','建设项目审批','不动产登记'],mode:'自然语言检索',desc:'通用政务问答助手',status:'running'},
];
let baEditId=null, baSelDomains=new Set(), baKw='', baStatus='', baDomKw='', baDomCollapsed=new Set(), baSelExpanded=new Set();
let baViewMode='card';   // 'card' 卡片视图（默认） | 'list' 列表视图
function baPill(s){
  if(s==='running') return '<span class="pill on">已启用</span>';
  if(s==='stopped') return '<span class="pill warn">未启用</span>';
  return '<span class="pill off">已禁用</span>';
}
function baActs(r){
  let acts=`<a title="复制 code" onclick="baCopyCode('${r.name}')"><i class="fa-solid fa-code"></i></a>`
    +`<a title="修改" onclick="baOpenModal('${r.id}')"><i class="fa-solid fa-pen"></i></a>`;
  /* 查看运行数据：已启用 / 已禁用 均支持（已禁用应用保留历史运行数据可供查看） */
  if(r.status==='running' || r.status==='offline'){ acts+=`<a class="go" title="查看运行数据" onclick="baViewRun('${r.id}')"><i class="fa-solid fa-chart-line"></i></a>`; }
  /* SQL 召回测试：所有状态均支持 */
  acts+=`<a class="go" title="SQL 召回测试" onclick="baSqlTest('${r.id}')"><i class="fa-solid fa-magnifying-glass-chart"></i></a>`;
  if(r.status==='running'){ acts+=`<a class="warn" title="禁用" onclick="baToggle('${r.id}')"><i class="fa-solid fa-circle-stop"></i></a>`; }
  else if(r.status==='offline'){ acts+=`<a class="go" title="启用" onclick="baToggle('${r.id}')"><i class="fa-solid fa-circle-play"></i></a>`; }
  else { acts+=`<a class="go" title="启用" onclick="baToggle('${r.id}')"><i class="fa-solid fa-circle-play"></i></a><a class="del" title="删除" onclick="baRemove('${r.id}')"><i class="fa-solid fa-trash"></i></a>`; }
  return acts;
}
function baRow(r){
  const idx=APP_LIST.indexOf(r)+1;
  const scope=(r.domains&&r.domains.length)?r.domains.join('、'):'—';
  return `<tr>
    <td>${idx}</td>
    <td><b>${r.name}</b></td>
    <td>${r.auth}</td>
    <td>${r.dept}</td>
    <td>${r.contact}</td>
    <td style="max-width:300px;color:var(--text-2)">${scope}</td>
    <td>${baPill(r.status)}</td>
    <td><div class="act">${baActs(r)}</div></td>
  </tr>`;
}
function baFilterRows(){
  const kw=baKw.trim().toLowerCase();
  return APP_LIST.filter(r=>{
    if(baStatus && r.status!==baStatus) return false;
    if(kw){ const hay=(r.name+' '+r.dept+' '+r.contact+' '+(r.domains||[]).join(' ')).toLowerCase(); if(!hay.includes(kw)) return false; }
    return true;
  });
}
function baApplyFilter(){ baRenderBody(); }
function baSearch(v){ baKw=v; baApplyFilter(); }
function baStatusFilter(s,el){
  baStatus=(el.classList.contains('active'))? '' : s;
  document.querySelectorAll('#baTblBar .chip').forEach(c=>c.classList.remove('active'));
  if(baStatus===''){ const a=document.querySelector('#baTblBar .chip-all'); if(a) a.classList.add('active'); }
  else el.classList.add('active');
  baApplyFilter();
}
/* 关联业务域：左侧业务域目录树 → 右侧已选清单（左右布局，参考业务域授权窗口） */
/* 选中父节点后，子节点仅可展开查看、不可单独勾选；右侧显示勾选节点，父节点可展开查看其子节点 */
function baDomLeaves(d){
  const set=[];
  (function walk(n){ bdChildrenOf(n).forEach(ch=>{ if(bdIsLeaf(ch)) set.push(ch.name); else walk(ch.id); }); })(d.id);
  return set;
}
function baDomDescendantNames(d){
  const set=[];
  (function walk(n){ bdChildrenOf(n).forEach(ch=>{ set.push(ch.name); if(!bdIsLeaf(ch)) walk(ch.id); }); })(d.id);
  return set;
}
function baDomAncestorNames(name){
  const d=BD_LIST.find(x=>x.name===name); if(!d||!d.parentId) return [];
  const res=[]; let cur=bdById(d.parentId);
  while(cur){ res.push(cur.name); if(!cur.parentId) break; cur=bdById(cur.parentId); }
  return res;
}
function baDomCovered(name){ return baDomAncestorNames(name).some(a=>baSelDomains.has(a)); }
function baDomToggle(id){
  const d=bdById(id); if(!d) return;
  if(baDomCovered(d.name)) return; // 已被上级节点覆盖选中，子节点不可单独切换
  if(baSelDomains.has(d.name)) baSelDomains.delete(d.name);
  else { baSelDomains.add(d.name); baDomDescendantNames(d).forEach(n=>baSelDomains.delete(n)); } // 选中父节点后子节点由父覆盖
  baDomainRender();
}
function baDomToggleNode(id){ if(baDomCollapsed.has(id)) baDomCollapsed.delete(id); else baDomCollapsed.add(id); baDomainRender(); }
function baDomNodeHTML(d, depth){
  const isLeaf=bdIsLeaf(d);
  const kw=baDomKw.trim();
  const expanded = kw ? true : !baDomCollapsed.has(d.id);
  const agg=!isLeaf?bdAgg(d.id):null;
  const cnt=bdTableCount(d);
  const indent=18*depth;
  const covered=baDomCovered(d.name);
  const checked=baSelDomains.has(d.name) || covered;
  const disabled=covered; // 被上级覆盖时不可勾选
  const statHtml = isLeaf
    ? `<span class="bd-stat"><b>${d.sources?d.sources.length:0}</b> 数据源 · <b>${cnt}</b> 表/视图</span>`
    : `<span class="bd-stat"><b>${agg.leaves}</b> 子域 · <b>${agg.srcCount}</b> 数据源 · <b>${agg.tables+agg.views}</b> 表/视图</span>`;
  const caret = !isLeaf
    ? `<span class="bd-caret ${expanded?'open':''}" onclick="event.stopPropagation();baDomToggleNode('${d.id}')"><i class="fa-solid fa-chevron-right"></i></span>`
    : `<span class="bd-caret empty"></span>`;
  const nodeIcon = isLeaf ? `<i class="fa-solid ${d.icon}"></i>` : `<i class="fa-solid fa-folder-tree"></i>`;
  const cb = `<label class="bd-cbwrap" onclick="event.stopPropagation()"><input type="checkbox" ${checked?'checked':''} ${disabled?'disabled':''} onchange="baDomToggle('${d.id}')"></label>`;
  const rowOnclick = isLeaf ? `baDomToggle('${d.id}')` : `baDomToggleNode('${d.id}')`;
  const row = `<div class="bd-node-row ${isLeaf?'leaf':'cat'} ${checked?'on':''} ${disabled?'cov':''}" style="padding-left:${indent+14}px" onclick="${rowOnclick}">
    ${caret}
    ${cb}
    <span class="bd-node-ic ${isLeaf?'leaf':'cat'}">${nodeIcon}</span>
    <span class="bd-node-name">${d.name}</span>
    ${statHtml}
    ${covered?'<span class="bd-cov-tag">已随上级关联</span>':''}
  </div>`;
  let kids='';
  if(!isLeaf && expanded){ kids = bdChildrenOf(d.id).map(ch=>baDomNodeHTML(ch, depth+1)).join(''); }
  return `<div class="bd-node">${row}${kids}</div>`;
}
function baDomSelLeafHtml(d){
  const cnt=bdTableCount(d);
  const src=d.sources?d.sources.length:0;
  const path=bdPathName(d.id);
  const sub=[path,src?`${src} 数据源`:'',`${cnt} 表/视图`].filter(Boolean).join(' · ');
  return `<div class="obj-row sel">
    <span class="oi"><i class="fa-solid ${d.icon}"></i></span>
    <span class="nm-wrap"><span class="ot">${d.name}</span><span class="ofc">${sub}</span></span>
    <a class="tf-rm" onclick="baDomRemove('${d.name.replace(/'/g,"\\'")}')" title="移除"><i class="fa-solid fa-xmark"></i></a>
  </div>`;
}
function baDomSelChildHtml(leaf){
  const cnt=bdTableCount(leaf);
  const src=leaf.sources?leaf.sources.length:0;
  const path=bdPathName(leaf.id);
  const sub=[path,src?`${src} 数据源`:'',`${cnt} 表/视图`].filter(Boolean).join(' · ');
  return `<div class="obj-row sel ro">
    <span class="oi"><i class="fa-solid ${leaf.icon}"></i></span>
    <span class="nm-wrap"><span class="ot">${leaf.name}</span><span class="ofc">${sub}</span></span>
  </div>`;
}
function baDomSelRowForName(n){
  const d=BD_LIST.find(x=>x.name===n);
  if(!d){
    return `<div class="obj-row sel">
      <span class="oi"><i class="fa-solid fa-folder"></i></span>
      <span class="nm-wrap"><span class="ot">${n}</span><span class="ofc">（未在业务域目录中）</span></span>
      <a class="tf-rm" onclick="baDomRemove('${n.replace(/'/g,"\\'")}')" title="移除"><i class="fa-solid fa-xmark"></i></a>
    </div>`;
  }
  if(bdIsLeaf(d)) return baDomSelLeafHtml(d);
  const agg=bdAgg(d.id);
  const path=bdPathName(d.id);
  const sub=[path,`${agg.leaves} 子域`,`${agg.srcCount} 数据源`,`${agg.tables+agg.views} 表/视图`].filter(Boolean).join(' · ');
  const open=baSelExpanded.has(d.id);
  const kids=baDomLeaves(d).map(ln=>{ const l=BD_LIST.find(x=>x.name===ln); return l?baDomSelChildHtml(l):''; }).join('');
  return `<div class="obj-row sel ba-sel-parent">
    <span class="oi"><i class="fa-solid fa-folder-tree"></i></span>
    <span class="nm-wrap"><span class="ot">${n}</span><span class="ofc">${sub}</span></span>
    <a class="tf-caret-btn ${open?'open':''}" onclick="baSelToggle('${d.id}')" title="查看子节点"><i class="fa-solid fa-chevron-right"></i></a>
    <a class="tf-rm" onclick="baDomRemove('${n.replace(/'/g,"\\'")}')" title="移除"><i class="fa-solid fa-xmark"></i></a>
  </div>
  <div class="ba-sel-kids" id="baSelKids-${d.id}" style="display:${open?'block':'none'}">${kids}</div>`;
}
function baDomSelHtml(){
  const names=[...baSelDomains];
  if(!names.length) return `<div class="tf-empty">尚未关联业务域，请从左侧目录树勾选</div>`;
  return names.map(baDomSelRowForName).join('');
}
function baSelToggle(id){
  if(baSelExpanded.has(id)) baSelExpanded.delete(id); else baSelExpanded.add(id);
  const box=document.getElementById('baSelKids-'+id);
  if(box) box.style.display = baSelExpanded.has(id)?'block':'none';
  const row=box?box.previousElementSibling:null;
  const caret=row?row.querySelector('.tf-caret-btn'):null;
  if(caret) caret.classList.toggle('open', baSelExpanded.has(id));
}
function baDomRemove(name){ baSelDomains.delete(name); BD_LIST.forEach(d=>{ if(d.name===name) baSelExpanded.delete(d.id); }); baDomainRender(); }
function baDomAll(box){
  const topCats=BD_LIST.filter(d=>!d.parentId).map(d=>d.name);
  if(box.checked){ baSelDomains.clear(); topCats.forEach(n=>baSelDomains.add(n)); }
  else { topCats.forEach(n=>baSelDomains.delete(n)); }
  baDomainRender();
}
function baDomClear(){ baSelDomains.clear(); baSelExpanded.clear(); baDomainRender(); }
function baDomainRender(){
  const wrap=document.getElementById('baDomainTransfer'); if(!wrap) return;
  const kw=baDomKw.trim().toLowerCase();
  const top=BD_LIST.filter(d=>!d.parentId);
  let visibleTop=top;
  if(kw){
    const hit=new Set();
    const mark=(d)=>{ let m=(d.name+' '+(d.desc||'')).toLowerCase().includes(kw); bdChildrenOf(d.id).forEach(ch=>{ if(mark(ch)) m=true; }); if(m) hit.add(d.id); return m; };
    top.forEach(d=>mark(d));
    visibleTop=top.filter(d=>hit.has(d.id));
  }
  const treeHtml = visibleTop.map(d=>baDomNodeHTML(d,0)).join('');
  const topCats=BD_LIST.filter(d=>!d.parentId).map(d=>d.name);
  const allOn=topCats.length>0 && topCats.every(n=>baSelDomains.has(n));
  wrap.innerHTML=`<div class="transfer">
    <div class="tf-pane">
      <div class="tf-bar">
        <label class="chk-all"><input type="checkbox" ${allOn?'checked':''} onchange="baDomAll(this)"> 全选</label>
        <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索业务域名称" value="${baDomKw}" oninput="baDomKw=this.value;baDomainRender()"></div>
      </div>
      <div class="obj-list tf-avail ba-dom-tree">${treeHtml || '<div class="bd-empty">未找到匹配的业务域</div>'}</div>
    </div>
    <div class="tf-pane">
      <div class="tf-bar">
        <span class="obj-count">已关联 ${baSelDomains.size} 项</span>
        ${baSelDomains.size?`<a class="tf-clear" onclick="baDomClear()"><i class="fa-solid fa-xmark"></i> 清空已选</a>`:''}
      </div>
      <div class="obj-list tf-seled">${baDomSelHtml()}</div>
    </div>
  </div>`;
  if(kw){ const s=wrap.querySelector('.tf-avail input'); if(s){ s.focus(); try{ s.setSelectionRange(s.value.length,s.value.length); }catch(e){} } }
}
function baOpenModal(id){
  baEditId=id||null;
  const r=id?APP_LIST.find(x=>x.id===id):null;
  document.getElementById('baName').value=r?r.name:'';
  document.getElementById('baAuth').value=r?r.auth:'单点登录认证';
  document.getElementById('baDept').value=r?r.dept:'';
  document.getElementById('baContact').value=r?r.contact:'';
  document.getElementById('baDesc').value=r?r.desc:'';
  baSelDomains=new Set(r?r.domains:[]);
  baDomKw=''; baDomCollapsed.clear(); baSelExpanded.clear();
  baDomainRender();
  document.getElementById('baModalTitle').textContent=r?'编辑业务应用':'注册业务应用';
  openModal('baModal');
}
function baSave(){
  const name=document.getElementById('baName').value.trim();
  if(!name){ showToast('请输入应用名称'); return; }
  const data={
    name,
    auth:document.getElementById('baAuth').value,
    dept:document.getElementById('baDept').value.trim(),
    contact:document.getElementById('baContact').value.trim(),
    desc:document.getElementById('baDesc').value.trim(),
    domains:[...baSelDomains]
  };
  if(baEditId){ const r=APP_LIST.find(x=>x.id===baEditId); Object.assign(r,data); }
  else { APP_LIST.push({id:'A-'+String(APP_LIST.length+1).padStart(2,'0'),status:'stopped',...data}); }
  closeModal('baModal'); renderView('bizapp');
  showToast(baEditId?'业务应用已更新':'业务应用「'+name+'」创建成功');
}
function baToggle(id){
  const r=APP_LIST.find(x=>x.id===id); if(!r) return;
  r.status = r.status==='running' ? 'offline' : 'running';
  renderView('bizapp'); showToast(r.name+' 已'+(r.status==='running'?'启用':'禁用'));
}
function baRemove(id){
  const r=APP_LIST.find(x=>x.id===id); if(!r) return;
  showConfirm('确定删除业务应用「'+r.name+'」吗？删除后无法恢复。',()=>{
    const i=APP_LIST.findIndex(x=>x.id===id); if(i>=0) APP_LIST.splice(i,1);
    renderView('bizapp'); showToast('业务应用已删除');
  });
}
function baCopyCode(name){ showToast('已复制应用 code：'+name); }

function baTableHTML(){
  const rows=baFilterRows();
  return `<div class="card">
    <div class="tbl-wrap"><table>
      <thead><tr><th style="width:56px">#</th><th>应用名称</th><th>认证类型</th><th>所属部门</th><th>联系人</th><th>关联业务域</th><th>应用状态</th><th style="width:148px">操作</th></tr></thead>
      <tbody id="baTbody">${rows.map(r=>baRow(r)).join('')}</tbody>
    </table></div>
    <div class="pager" id="baPager"><span>共 ${rows.length} 条</span><a class="on">1</a></div>
  </div>`;
}
function baCard(r){
  const domTags=(r.domains&&r.domains.length)?r.domains.map(d=>`<span class="tag">${d}</span>`).join(''):'<span class="tag">—</span>';
  return `<div class="ba-card">
    <div class="ba-hd">
      <div class="ic"><i class="fa-solid fa-cube"></i></div>
      <div class="nm"><b>${r.name}</b><small>${r.id}</small></div>
      ${baPill(r.status)}
    </div>
    <div class="ba-meta">
      <div><span class="k">认证</span><span>${r.auth}</span></div>
      <div><span class="k">部门</span><span>${r.dept}</span></div>
    </div>
    <div class="ba-scope"><span class="k">关联业务域</span><div class="tags">${domTags}</div></div>
    <div class="ba-ft"><div class="act">${baActs(r)}</div></div>
  </div>`;
}
function baCardGrid(){
  const rows=baFilterRows();
  if(!rows.length) return '<div class="empty-soon" style="grid-column:1/-1"><i class="fa-solid fa-cube"></i>暂无符合条件的业务应用</div>';
  return `<div class="ba-grid">${rows.map(r=>baCard(r)).join('')}</div>`;
}
function baRenderBody(){
  const b=document.getElementById('baBody'); if(!b) return;
  b.innerHTML = baViewMode==='card' ? baCardGrid() : baTableHTML();
}
VIEWS.bizapp=()=>`
${ph('业务应用管理','统一管理业务应用的接入、认证方式与关联业务域配置',
  `<div class="meta-toggle">
    <button class="seg ${baViewMode==='list'?'on':''}" onclick="baSetView('list')"><i class="fa-solid fa-list"></i> 列表视图</button>
    <button class="seg ${baViewMode==='card'?'on':''}" onclick="baSetView('card')"><i class="fa-solid fa-table-cells-large"></i> 卡片视图</button>
  </div>`)}
<div class="card">
  <div class="tbl-bar" id="baTblBar">
    <span class="chip chip-all ${baStatus===''?'active':''}" onclick="baStatusFilter('',this)">全部</span>
    <span class="chip ${baStatus==='running'?'active':''}" onclick="baStatusFilter('running',this)">已启用</span>
    <span class="chip ${baStatus==='stopped'?'active':''}" onclick="baStatusFilter('stopped',this)">未启用</span>
    <span class="chip ${baStatus==='offline'?'active':''}" onclick="baStatusFilter('offline',this)">已禁用</span>
    <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input id="baSearchInput" placeholder="搜索应用名称 / 部门 / 联系人" value="${baKw}" oninput="baSearch(this.value)"></div>
    <div class="tbl-acts"><button class="btn primary" onclick="baOpenModal()"><i class="fa-solid fa-plus"></i>注册应用</button></div>
  </div>
</div>
<div id="baBody">${baViewMode==='card'?baCardGrid():baTableHTML()}</div>`;
function baSetView(m){ if(baViewMode===m) return; baViewMode=m; renderView('bizapp'); }
function baViewRun(id){ const r=APP_LIST.find(x=>x.id===id); showToast('正在打开「'+(r?r.name:id)+'」的运行数据看板…'); }
/* ---- SQL 召回测试 ---- */
let baTestId=null;
function baSqlTest(id){
  const r=APP_LIST.find(x=>x.id===id); if(!r) return;
  baTestId=id;
  const h=document.getElementById('baSqlTestTitle'); if(h) h.textContent='SQL 召回测试 · '+r.name;
  const domTags=(r.domains&&r.domains.length)?r.domains.map(d=>`<span class="tag">${d}</span>`).join(''):'<span class="tag">—</span>';
  const info=document.getElementById('baSqlTestInfo');
  if(info) info.innerHTML=`<div class="ba-test-meta"><span class="k">认证</span><span>${r.auth}</span></div><div class="ba-test-meta"><span class="k">关联业务域</span><div class="tags">${domTags}</div></div>`;
  const ta=document.getElementById('baSqlTestInput'); if(ta) ta.value='';
  const res=document.getElementById('baSqlTestResult');
  if(res) res.innerHTML='<div class="ba-test-tip"><i class="fa-solid fa-circle-info"></i> 输入自然语言问句后点击「执行召回测试」，系统将基于该应用关联业务域的 SQL 样例库进行语义召回。</div>';
  openModal('baSqlTestModal');
  if(ta) setTimeout(()=>ta.focus(),60);
}
function baSqlTestRun(){
  const r=APP_LIST.find(x=>x.id===baTestId); if(!r) return;
  const ta=document.getElementById('baSqlTestInput'); const q=(ta?ta.value:'').trim();
  const res=document.getElementById('baSqlTestResult');
  if(!q){ showToast('请输入测试问句'); if(ta) ta.focus(); return; }
  const ql=q.toLowerCase();
  const qTokens=ql.split(/[\s，。、,；;：:]+/).filter(t=>t.length>=1);
  const domSet=new Set(r.domains||[]);
  const cand=SQL_SAMPLES.filter(s=>s.status!=='off').map(s=>{
    const text=(s.desc+' '+s.sql+' '+(s.domains||[]).join(' ')).toLowerCase();
    let hit=0; qTokens.forEach(tk=>{ if(tk && text.indexOf(tk)>=0) hit++; });
    const domMatch=(s.domains||[]).filter(d=>domSet.has(d)).length;
    let score=(qTokens.length? hit/qTokens.length*68 : 0) + (domMatch? Math.min(domMatch,3)/3*32 : 0);
    if(hit===0 && domMatch>0) score=Math.max(score, 42+domMatch*6);
    if(qTokens.length===0) score=domMatch? 50 : 28;
    return { s, score:Math.max(0,Math.min(98,Math.round(score))) };
  });
  cand.sort((a,b)=>b.score-a.score);
  const top=cand.slice(0,3);
  const cost=(Math.random()*0.9+0.25).toFixed(2);
  if(!res) return;
  res.innerHTML=`<div class="ba-test-summary"><span>召回耗时 <b>${cost}s</b></span><span>命中样例 <b>${top.filter(t=>t.score>0).length}</b> 条</span><span>样例库共 <b>${SQL_SAMPLES.length}</b> 条</span></div>`
    + top.map((t,i)=>{
        const s=t.s;
        const domTags=(s.domains||[]).map(d=>`<span class="tag ${domSet.has(d)?'hit':''}">${d}</span>`).join('');
        const lvl=t.score>=60?'ok':t.score>=30?'mid':'low';
        return `<div class="ba-test-item">
          <div class="ba-test-item-h"><span class="rank">${i+1}</span><b>${escHtml(s.desc)}</b><span class="score ${lvl}">相似度 ${t.score}%</span></div>
          <pre class="ba-test-sql">${escHtml(s.sql)}</pre>
          <div class="ba-test-item-f"><span>类型：${s.type}</span><span>引用表：${(s.tables||[]).join('、')||'—'}</span><span>累计命中：${s.hits}</span></div>
          <div class="ba-test-doms">${domTags}</div>
        </div>`;
      }).join('');
}
/* ---- 新建 / 编辑业务域 ---- */
let bdEditId=null;
const BD_PALETTE=['#4f8cff','#22c55e','#f59e0b','#a78bfa','#22d3ee','#ef4444','#ec4899','#14b8a6'];
/* 由业务域已绑定的 sources（{src,tables[],views[]}）还原为穿梭组件选中集合 */
function bdObjSelFromSources(sources){
  const sel=new Set();
  (sources||[]).forEach(s=>{
    (s.tables||[]).forEach(t=>sel.add(s.src+'::'+t));
    (s.views||[]).forEach(v=>sel.add(s.src+'::'+v));
  });
  return sel;
}
/* 由穿梭组件选中集合（src::name）构建 sources（{src,tables[],views[]}） */
function bdSourcesFromSel(){
  const srcMap={};
  dcObjSel.forEach(k=>{
    const idx=k.indexOf('::'); const src=k.slice(0,idx); const nm=k.slice(idx+2);
    const o=DB_OBJS.find(x=>x.src===src && x.n===nm);
    const entry=srcMap[src]=srcMap[src]||{src, tables:[], views:[]};
    if(o && o.t==='view') entry.views.push(nm); else entry.tables.push(nm);
  });
  return Object.values(srcMap);
}
let bdModalType='leaf';
function bdParentOptions(excludeId){
  const opts=['<option value="">顶级（无上级，一级业务域）</option>'];
  BD_LIST.forEach(d=>{
    if(excludeId){
      if(d.id===excludeId) return;
      let cur=d; while(cur&&cur.parentId){ if(cur.parentId===excludeId) return; cur=bdById(cur.parentId); }
    }
    if(bdDepth(d.id) < BD_MAX_DEPTH){
      const pad='　'.repeat(bdDepth(d.id)-1);
      opts.push(`<option value="${d.id}">${pad}${d.name}（${bdIsLeaf(d)?'业务子域':'业务分类'}）</option>`);
    }
  });
  return opts.join('');
}
function bdSetType(v, force){
  const btn=document.querySelector('#bdTypeSeg .seg[data-v="'+v+'"]');
  if(btn && btn.classList.contains('disabled') && !force) return;
  bdModalType=v;
  document.querySelectorAll('#bdTypeSeg .seg').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  const sec=document.getElementById('bdBindSection'); if(sec) sec.style.display=(v==='category')?'none':'';
  /* 业务域类型提示固定显示在标签右侧，不再随类型切换显隐 */
}
function bdOnParentChange(){
  const p=document.getElementById('bdParent').value;
  const segBtns=document.querySelectorAll('#bdTypeSeg .seg');
  if(p && bdDepth(p)>=BD_MAX_DEPTH-1){
    segBtns.forEach(b=>{ if(b.dataset.v==='category') b.classList.add('disabled'); });
    bdSetType('leaf', true);
  } else {
    segBtns.forEach(b=>b.classList.remove('disabled'));
  }
}
function bdOpenModal(id, parentId){
  bdEditId=id||null;
  const r=id?bdById(id):null;
  document.getElementById('bdName').value=r?r.name:'';
  document.getElementById('bdAlias').value=r?r.alias:'';
  document.getElementById('bdDesc').value=r?r.desc:'';
  const sel=document.getElementById('bdParent');
  sel.innerHTML=bdParentOptions(id);
  sel.value = parentId || (r?r.parentId:'') || '';
  sel.onchange=bdOnParentChange;
  document.querySelectorAll('#bdTypeSeg .seg').forEach(b=>b.classList.remove('disabled'));
  if(r && !bdIsLeaf(r)){
    bdSetType('category', true);
    document.querySelectorAll('#bdTypeSeg .seg').forEach(b=>{ if(b.dataset.v==='leaf') b.classList.add('disabled'); });
  } else if(r){
    bdSetType(r.type||'leaf', true);
  } else {
    /* 顶部「新建业务域」默认业务分类；节点「新建子域」默认业务子域 */
    bdSetType(parentId ? 'leaf' : 'category', true);
  }
  if(sel.value) bdOnParentChange();
  /* 图标与主题色由系统自动生成，不再由用户选择 */
  dcObjSel = r ? bdObjSelFromSources(r.sources||[]) : new Set();
  dcObjKw=''; dcObjSrcCollapsed=new Set(); dcObjSchCollapsed=new Set();
  document.getElementById('bdModalTitle').textContent=r?'编辑业务域':'新建业务域';
  openModal('bdModal');
  if(document.getElementById('dcObjWrap')) dcObjRender();
}
function bdSave(){
  const name=document.getElementById('bdName').value.trim();
  if(!name){ showToast('请输入业务域名称'); return; }
  const desc=document.getElementById('bdDesc').value.trim();
  const alias=document.getElementById('bdAlias').value.trim();
  const parent=document.getElementById('bdParent').value||null;
  const type=bdModalType;
  if(parent && bdDepth(parent)>=BD_MAX_DEPTH){ showToast('上级层级过深，业务域最多支持三级'); return; }
  let sources=[];
  if(type==='leaf'){
    sources=bdSourcesFromSel();
    if(!sources.length){ showToast('请至少关联一个数据对象'); return; }
  }
  if(bdEditId){
    const r=bdById(bdEditId);
    Object.assign(r,{name, alias, desc, parentId:parent, type, sources: type==='leaf'?sources:[]});
    closeModal('bdModal'); renderView('domain'); showToast('业务域已更新');
    return;
  }
  const color=BD_PALETTE[BD_LIST.length%BD_PALETTE.length];
  const icon= type==='category'?'fa-folder':'fa-layer-group';
  const nid=bdNewId();
  /* 新建节点一律未授权：业务子域随后引导授权，父域可保持不单独授权 */
  BD_LIST.unshift({id:nid,name,alias,icon,color,desc,parentId:parent,type,sources: type==='leaf'?sources:[],roles:0,status:'on',authorized:false,authScopes:[]});
  closeModal('bdModal'); renderView('domain');
  if(type==='leaf'){
    showConfirm('业务域「'+name+'」创建成功。业务子域须完成授权后才能被业务应用访问，是否立即配置授权范围？',
      ()=>bdOpenAuth(nid),
      {title:'创建成功 · 待授权', okText:'<i class="fa-solid fa-user-shield"></i>立即授权', okClass:'primary', cancelText:'稍后处理'});
  } else {
    showToast('业务分类「'+name+'」创建成功，可不单独授权');
  }
}
function bdNewId(){ let n=BD_LIST.length+1, id; do{ id='D-'+String(n).padStart(2,'0'); n++; }while(bdById(id)); return id; }
function bdRemove(id){
  const r=bdById(id); if(!r) return;
  const ids=[id];
  (function collect(nid){ bdChildrenOf(nid).forEach(ch=>{ ids.push(ch.id); collect(ch.id); }); })(id);
  showConfirm('确定删除业务域「'+r.name+'」？'+(ids.length>1?('将一并删除其下 '+(ids.length-1)+' 个子域，'):'')+'删除后不可恢复。',()=>{
    ids.forEach(i=>{ const k=BD_LIST.findIndex(x=>x.id===i); if(k>=0) BD_LIST.splice(k,1); });
    bdCollapsed.delete(id);
    renderView('domain'); showToast('业务域已删除');
  });
}
/* ---- 业务域授权（组织人员目录树 → 已选范围，参考关联数据对象） ---- */
let bdAuthId=null, bdAuthSel=new Set(), bdAuthKw='';
function bdAuthorized(d){ return d.authScopes ? d.authScopes.length>0 : !!d.authorized; }
function bdAuthAllKeys(){
  const set=new Set();
  USER_DEPTS.forEach(d=>{ set.add('D::'+d.name); if(Array.isArray(d.sub)) d.sub.forEach(s=>set.add('D::'+s.name)); });
  USER_LIST.forEach(u=>set.add('U::'+u.acct));
  return set;
}
function bdAuthToggleNode(el){ const n=el.closest('.ot-node'); if(n) n.classList.toggle('collapsed'); }
function bdOpenAuth(id){
  const d=bdById(id); if(!d) return;
  bdAuthId=id;
  bdAuthSel = new Set(d.authScopes ? d.authScopes : []);
  bdAuthKw='';
  document.getElementById('bdAuthTitle').textContent='业务域授权 · '+d.name;
  openModal('bdAuthModal');
  bdAuthRender();
}
function bdAuthToggle(key){ if(bdAuthSel.has(key)) bdAuthSel.delete(key); else bdAuthSel.add(key); bdAuthRender(); }
function bdAuthAll(box){
  const all=bdAuthAllKeys();
  if(box.checked) all.forEach(k=>bdAuthSel.add(k)); else all.forEach(k=>bdAuthSel.delete(k));
  bdAuthRender();
}
function bdAuthClear(){ bdAuthSel.clear(); bdAuthRender(); }
function bdAuthMemberHtml(u){
  const k='U::'+u.acct;
  return `<li class="ot-member" onclick="bdAuthToggle('${k}')">
    <label class="ot-cbwrap" onclick="event.stopPropagation()"><input type="checkbox" ${bdAuthSel.has(k)?'checked':''} onchange="bdAuthToggle('${k}')"></label>
    <div class="ph" style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--accent));color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600">${u.name[0]}</div>
    <div style="min-width:0">
      <b>${u.name}</b>
    </div>
  </li>`;
}
function bdAuthSubDeptHtml(sd){
  const k='D::'+sd.name;
  const ms=USER_LIST.filter(u=>u.dept===sd.name);
  return `<li class="ot-node ot-sub">
    <div class="ot-head" onclick="bdAuthToggleNode(this)">
      <label class="ot-cbwrap" onclick="event.stopPropagation()"><input type="checkbox" ${bdAuthSel.has(k)?'checked':''} onchange="bdAuthToggle('${k}')"></label>
      <i class="ot-caret fa-solid fa-chevron-down"></i>
      <i class="ot-ico fa-solid fa-diagram-project"></i>
      <b>${sd.name}</b>
      <span class="muted" style="font-size:12px">${ms.length} 人</span>
    </div>
    <ul class="ot-children">${ms.map(bdAuthMemberHtml).join('')}</ul>
  </li>`;
}
function bdAuthDeptHtml(d){
  const k='D::'+d.name;
  const hasSub=Array.isArray(d.sub)&&d.sub.length;
  const subNames=hasSub?d.sub.map(s=>s.name):[];
  const inner = hasSub ? d.sub.map(bdAuthSubDeptHtml).join('') : USER_LIST.filter(u=>u.dept===d.name).map(bdAuthMemberHtml).join('');
  const total = hasSub ? USER_LIST.filter(u=>subNames.includes(u.dept)).length : USER_LIST.filter(u=>u.dept===d.name).length;
  return `<li class="ot-node">
    <div class="ot-head" onclick="bdAuthToggleNode(this)">
      <label class="ot-cbwrap" onclick="event.stopPropagation()"><input type="checkbox" ${bdAuthSel.has(k)?'checked':''} onchange="bdAuthToggle('${k}')"></label>
      <i class="ot-caret fa-solid fa-chevron-down"></i>
      <i class="ot-ico fa-solid fa-sitemap"></i>
      <b>${d.name}</b>
      <span class="muted" style="font-size:12px">${total} 人</span>
    </div>
    <ul class="ot-children">${inner}</ul>
  </li>`;
}
function bdAuthTreeHtml(rootAll){
  const kw=bdAuthKw.trim().toLowerCase();
  const matchesU=u=>!kw||(u.name+u.dept).toLowerCase().includes(kw);
  const deptHit=d=>{
    if(d.name.toLowerCase().includes(kw)) return true;
    if(Array.isArray(d.sub)&&d.sub.length) return d.sub.some(sd=> sd.name.toLowerCase().includes(kw) || USER_LIST.some(u=>u.dept===sd.name&&matchesU(u)));
    return USER_LIST.some(u=>u.dept===d.name&&matchesU(u));
  };
  const tree=USER_DEPTS.filter(d=>!kw||deptHit(d)).map(d=>{
    if(kw){
      const hasSub=Array.isArray(d.sub)&&d.sub.length;
      const subHtml=hasSub?d.sub.filter(sd=> sd.name.toLowerCase().includes(kw)||USER_LIST.some(u=>u.dept===sd.name&&matchesU(u))).map(sd=>{
        const ms=USER_LIST.filter(u=>u.dept===sd.name&&matchesU(u));
        return `<li class="ot-node ot-sub"><div class="ot-head" onclick="bdAuthToggleNode(this)"><label class="ot-cbwrap" onclick="event.stopPropagation()"><input type="checkbox" ${bdAuthSel.has('D::'+sd.name)?'checked':''} onchange="bdAuthToggle('D::${sd.name}')"></label><i class="ot-caret fa-solid fa-chevron-down"></i><i class="ot-ico fa-solid fa-diagram-project"></i><b>${sd.name}</b><span class="muted" style="font-size:12px">${ms.length} 人</span></div><ul class="ot-children">${ms.map(bdAuthMemberHtml).join('')}</ul></li>`;
      }).join(''):'';
      const directMs=!hasSub?USER_LIST.filter(u=>u.dept===d.name&&matchesU(u)):[];
      const inner=subHtml+directMs.map(bdAuthMemberHtml).join('');
      if(!inner) return '';
      return `<li class="ot-node"><div class="ot-head" onclick="bdAuthToggleNode(this)"><label class="ot-cbwrap" onclick="event.stopPropagation()"><input type="checkbox" ${bdAuthSel.has('D::'+d.name)?'checked':''} onchange="bdAuthToggle('D::${d.name}')"></label><i class="ot-caret fa-solid fa-chevron-down"></i><i class="ot-ico fa-solid fa-sitemap"></i><b>${d.name}</b></div><ul class="ot-children">${inner}</ul></li>`;
    }
    return bdAuthDeptHtml(d);
  }).join('');
  return `<ul class="org-tree bd-auth-tree">
    <li class="ot-node">
      <div class="ot-head" onclick="bdAuthToggleNode(this)">
        <label class="ot-cbwrap" onclick="event.stopPropagation()"><input type="checkbox" ${rootAll?'checked':''} onchange="bdAuthAll(this)"></label>
        <i class="ot-caret fa-solid fa-chevron-down"></i>
        <i class="ot-ico fa-solid fa-building"></i>
        <b>规划和自然资源局</b>
        <span class="pill info">${USER_DEPTS.length} 个部门</span>
      </div>
      <ul class="ot-children">${tree}</ul>
    </li>
  </ul>`;
}
function bdAuthSelHtml(){
  const deptKeys=[...bdAuthSel].filter(k=>k.startsWith('D::'));
  const userKeys=[...bdAuthSel].filter(k=>k.startsWith('U::'));
  const deptHtml=deptKeys.map(k=>{
    const name=k.slice(3);
    const allNames=new Set([name]); const d=USER_DEPTS.find(x=>x.name===name); if(d&&Array.isArray(d.sub)) d.sub.forEach(s=>allNames.add(s.name));
    const count=USER_LIST.filter(u=>allNames.has(u.dept)).length;
    return `<div class="obj-row sel">
      <span class="oi"><i class="fa-solid fa-sitemap"></i></span>
      <span class="nm-wrap"><span class="ot">${name}</span><span class="ofc">${count} 人</span></span>
      <a class="tf-rm" onclick="bdAuthToggle('${k}')" title="移除"><i class="fa-solid fa-xmark"></i></a>
    </div>`;
  }).join('');
  const userHtml=userKeys.map(k=>{
    const u=USER_LIST.find(x=>x.acct===k.slice(3)); if(!u) return '';
    return `<div class="obj-row sel">
      <span class="oi"><i class="fa-solid fa-user"></i></span>
      <span class="nm-wrap"><span class="ot">${u.name}</span><span class="ofc">${u.dept}</span></span>
      <a class="tf-rm" onclick="bdAuthToggle('${k}')" title="移除"><i class="fa-solid fa-xmark"></i></a>
    </div>`;
  }).join('');
  const sec=(title,arr,html)=> arr.length?`<div class="bd-auth-sel-sec">${title}<span class="cnt">${arr.length}</span></div>${html}`:'';
  const body=sec('已选部门',deptKeys,deptHtml)+sec('已选人员',userKeys,userHtml);
  return body || `<div class="tf-empty">尚未选择授权对象，请从左侧勾选部门或人员</div>`;
}
function bdAuthRender(){
  const wrap=document.getElementById('bdAuthWrap'); if(!wrap) return;
  const all=bdAuthAllKeys();
  const rootAll=all.size>0 && [...all].every(k=>bdAuthSel.has(k));
  wrap.innerHTML=`<div class="transfer">
    <div class="tf-pane">
      <div class="tf-bar">
        <label class="chk-all"><input type="checkbox" ${rootAll?'checked':''} onchange="bdAuthAll(this)"> 全选</label>
        <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索部门 / 人员" value="${bdAuthKw}" oninput="bdAuthKw=this.value;bdAuthRender()"></div>
      </div>
      <div class="obj-list tf-avail bd-auth-tree-wrap">${bdAuthTreeHtml(rootAll)}</div>
    </div>
    <div class="tf-pane">
      <div class="tf-bar">
        <span class="obj-count">已选 ${bdAuthSel.size} 项</span>
        ${bdAuthSel.size?`<a class="tf-clear" onclick="bdAuthClear()"><i class="fa-solid fa-xmark"></i> 清空已选</a>`:''}
      </div>
      <div class="obj-list tf-seled">${bdAuthSelHtml()}</div>
    </div>
  </div>`;
  if(bdAuthKw){ const s=wrap.querySelector('.tf-avail input'); if(s){ s.focus(); try{ s.setSelectionRange(s.value.length,s.value.length); }catch(e){} } }
}
function bdAuthSave(){
  const d=bdById(bdAuthId); if(!d) return;
  d.authScopes=[...bdAuthSel];
  d.authorized=d.authScopes.length>0;
  closeModal('bdAuthModal'); renderView('domain');
  if(d.authorized){ showToast('已更新「'+d.name+'」授权范围（'+d.authScopes.length+' 项）'); }
  else if(bdIsLeafDomain(d)){ showToast('已撤销「'+d.name+'」授权，该业务子域将无法被业务应用访问'); }
  else { showToast('已撤销「'+d.name+'」授权，父域可不单独授权'); }
}
/* ---- 业务域创建（独立页面，参考数据库接入向导） ---- */
let dcStep=1, dcObjSel=new Set(), dcObjKw='', dcObjSrcCollapsed=new Set(), dcObjSchCollapsed=new Set();
let dcScopeMode='dept', dcScopeSel=new Set();
let dcType='leaf', dcParent=null;
function dcInit(){
  dcStep=1; dcObjSel=new Set(); dcObjKw='';
  dcObjSrcCollapsed=new Set(); dcObjSchCollapsed=new Set();
  dcScopeMode='dept'; dcScopeSel=new Set();
  dcType='leaf'; dcParent=null;
  const n=document.getElementById('dcName'); if(n) n.value='';
  const a=document.getElementById('dcAlias'); if(a) a.value='';
  const d=document.getElementById('dcDesc'); if(d) d.value='';
  const c=document.getElementById('dcCode'); if(c) c.value='';
  dcRender();
}
function dcStepsHTML(){
  const steps=[
    {n:1,ic:'fa-folder-plus',t:'① 基本信息',s:'填写业务域名称与描述'},
    {n:2,ic:'fa-table-list',t:'② 关联数据对象',s:'勾选纳入业务域的表与视图'},
    {n:3,ic:'fa-user-shield',t:'③ 授权范围',s:'配置可访问的部门或人员'},
  ];
  return steps.map(x=>{ const cls=x.n===dcStep?'active':(x.n<dcStep?'done':''); return `<div class="step ${cls}" data-step="${x.n}" onclick="dcGo(${x.n})"><div class="si"><i class="fa-solid ${x.ic}"></i></div><div class="st-txt"><b>${x.t}</b><small>${x.s}</small></div><span class="st-tag">${x.n===dcStep?'当前步骤':(x.n<dcStep?'已完成':'待处理')}</span></div>`; }).join('');
}
function dcRender(){
  const ind=document.getElementById('dcSteps'); if(ind) ind.innerHTML=dcStepsHTML();
  const h=document.getElementById('dcCardH'), b=document.getElementById('dcCardB');
  if(!h||!b) return;
  if(dcStep===1){
    h.innerHTML='<h3>基本信息 <span class="sub">填写业务域名称、类型与描述</span></h3>';
    b.innerHTML=`<div class="form-grid">
      <div class="form-field">
        <label><span class="req">*</span>业务域名称：</label>
        <input id="dcName" placeholder="例如：国土空间规划">
      </div>
      <div class="form-field">
        <label>业务域别名（选填）：</label>
        <input id="dcAlias" placeholder="建议输入英文名或拼音等有意义的字符，如 land-use-planning">
      </div>
      <div class="form-field">
        <label>业务域类型：</label>
        <div style="display:flex;gap:8px" id="dcTypeSeg">
          <button type="button" class="seg ${dcType==='category'?'on':''}" data-v="category" onclick="dcSetType('category')"><i class="fa-solid fa-folder-tree"></i> 业务分类（仅归类）</button>
          <button type="button" class="seg ${dcType==='leaf'?'on':''}" data-v="leaf" onclick="dcSetType('leaf')"><i class="fa-solid fa-table-list"></i> 业务子域（绑定数据）</button>
        </div>
      </div>
      <div class="form-field">
        <label>上级业务域：</label>
        <select id="dcParent" onchange="dcOnParentChange()">${bdParentOptions()}</select>
      </div>
      <div class="form-field full">
        <label>描述：</label>
        <textarea id="dcDesc" placeholder="一句话描述业务域范畴" style="min-height:64px"></textarea>
      </div>
    </div>`;
  } else if(dcStep===2){
    h.innerHTML='<h3>关联数据对象 <span class="sub">选择该业务域可访问的表与视图</span></h3>';
    b.innerHTML='<div id="dcObjWrap"></div>';
    dcObjRender();
  } else if(dcStep===3){
    h.innerHTML='<h3>授权范围 <span class="sub">配置可访问该业务域的部门与人员</span></h3>';
    b.innerHTML='<div id="dcScopeWrap"></div>';
    dcScopeRender();
  }
  const prev=document.getElementById('dcPrev'), next=document.getElementById('dcNext'), ok=document.getElementById('dcCreate');
  if(prev) prev.style.visibility=(dcStep>1)?'visible':'hidden';
  if(next) next.style.display=(dcStep<3)?'':'none';
  if(ok) ok.style.display=(dcStep<3)?'none':'';
}
function dcGo(n){ if(n<1||n>3) return; dcStep=n; dcRender(); }
function dcSetType(v){
  dcType=v;
  document.querySelectorAll('#dcTypeSeg .seg').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
}
function dcOnParentChange(){
  const sel=document.getElementById('dcParent');
  dcParent=sel.value||null;
  const depth=dcParent ? (bdDepth(bdById(dcParent))+1) : 0;
  if(depth>=2){
    dcType='leaf';
    document.querySelectorAll('#dcTypeSeg .seg').forEach(b=>{
      b.classList.toggle('on', b.dataset.v==='leaf');
      if(b.dataset.v==='category') b.classList.add('disabled');
    });
  } else {
    document.querySelectorAll('#dcTypeSeg .seg').forEach(b=>b.classList.remove('disabled'));
  }
}
function dcObjRender(){
  const wrap=document.getElementById('dcObjWrap'); if(!wrap) return;
  const kw=dcObjKw.trim().toLowerCase();
  const srcIcon=(name)=>{ const d=DS_LIST.find(x=>x.name===name); return d?d.icon:'fa-database'; };

  /* ---- 构建待选目录树（左栏） ---- */
  const availTree=DS_LIST.map(s=>{
    const src=s.name;
    const srcObjs=DB_OBJS.filter(o=>o.src===src);
    if(!srcObjs.length) return '';
    const srcOpen=!!kw || !dcObjSrcCollapsed.has(src);
    const srcAll=srcObjs.length>0 && srcObjs.every(o=>dcObjSel.has(o.src+'::'+o.n));
    const srcSome=srcObjs.some(o=>dcObjSel.has(o.src+'::'+o.n));
    const schs=[...new Set(srcObjs.map(o=>o.s))];
    const schHTML=schs.map(sch=>{
      const key=src+'::'+sch;
      const schObjs=srcObjs.filter(o=>o.s===sch);
      const schOpen=!!kw || !dcObjSchCollapsed.has(key);
      const schAll=schObjs.length>0 && schObjs.every(o=>dcObjSel.has(o.src+'::'+o.n));
      const schSome=schObjs.some(o=>dcObjSel.has(o.src+'::'+o.n));
      const visibleObjs=schObjs.filter(o=>!kw||o.n.toLowerCase().includes(kw)||o.d.toLowerCase().includes(kw)||src.toLowerCase().includes(kw)||sch.toLowerCase().includes(kw));
      if(!visibleObjs.length && !kw) return '';
      if(!visibleObjs.length && kw) return '';
      const tables=visibleObjs.filter(o=>o.t!=='view');
      const views=visibleObjs.filter(o=>o.t==='view');
      const rowHTML=(o)=>{ const k=o.src+'::'+o.n; return `<div class="obj-row" onclick="dcObjToggle('${k}')">
          <input type="checkbox" class="dc-cb" ${dcObjSel.has(k)?'checked':''} onclick="event.stopPropagation();dcObjToggle('${k}')" title="选择 / 取消选择 ${o.n}">
          <span class="oi"><i class="fa-solid ${o.t==='view'?'fa-table-columns':'fa-table'}"></i></span>
          <span class="nm-wrap"><span class="ot">${o.n}</span><span class="cn">${o.d}</span><span class="sep">·</span><span class="ofc">${o.f} 字段</span><span class="sch-tag">${o.s}</span></span>
        </div>`; };
      const groupHTML=(list,typeLabel)=>list.length?`<div class="tf-group">
        <div class="tf-sec">${typeLabel} · ${list.length}</div>
        ${list.map(rowHTML).join('')}
      </div>`:'';
      const leafHTML=groupHTML(tables,'表')+groupHTML(views,'视图');
      return `<div class="tree-sch ${schOpen?'open':''}">
        <div class="tf-sch ${schOpen?'is-open':'is-collapsed'}" onclick="dcObjSchToggle('${src}','${sch}')">
          <i class="tf-caret fa-solid ${schOpen?'fa-chevron-down':'fa-chevron-right'}"></i>
          <input type="checkbox" class="tf-sch-cb dc-cb" ${schAll?'checked':''} ${schSome&&!schAll?'data-indet="1"':''} onclick="event.stopPropagation();dcObjSchAll('${src}','${sch}')" title="全选 / 取消全选 ${sch}">
          <i class="fa-solid fa-folder${schOpen?'-open':''}"></i> schema: <b>${sch}</b>
          <span class="sch-cnt">${schObjs.length}</span>
        </div>
        <div class="tree-tbls">${leafHTML}</div>
      </div>`;
    }).join('');
    if(kw && !schHTML.replace(/\s/g,'')) return '';
    const list=`<div class="tree-schs">${schHTML||`<div class="tree-tbl" style="color:var(--text-3);cursor:default"><span>无匹配表</span></div>`}</div>`;
    return `<div class="tree-src ${srcOpen?'open':''}">
      <div class="ts-head" onclick="dcObjSrcToggle('${src}')">
        <i class="fa-solid fa-caret-right ts-caret"></i>
        <input type="checkbox" class="dc-cb" ${srcAll?'checked':''} ${srcSome&&!srcAll?'data-indet="1"':''} onclick="event.stopPropagation();dcObjSrcAll('${src}')" title="全选 / 取消全选 ${src}">
        <i class="fa-solid ${srcIcon(src)} ts-ic"></i>
        <span class="ts-name">${src}</span>
        <span class="ts-count">${srcObjs.length}</span>
        ${srcSome&&!srcAll?'<span class="ts-badge">已选部分</span>':''}
      </div>${list}</div>`;
  }).join('');

  /* 全选仅作用于当前可见（未选中）对象 */
  const allFiltered=[];
  DS_LIST.forEach(s=>{
    DB_OBJS.filter(o=>o.src===s.name).forEach(o=>{
      if(!kw || o.n.toLowerCase().includes(kw) || o.d.toLowerCase().includes(kw) || s.name.toLowerCase().includes(kw) || o.s.toLowerCase().includes(kw)) allFiltered.push(o);
    });
  });
  const allFilteredSel=allFiltered.length>0 && allFiltered.every(o=>dcObjSel.has(o.src+'::'+o.n));

  /* ---- 构建已选目录树（右栏，按数据源 → schema 分组） ---- */
  const selKeys=[...dcObjSel];
  const selItems=selKeys.map(k=>DB_OBJS.find(o=>o.src+'::'+o.n===k)).filter(Boolean);
  const selSrcs=[...new Set(selItems.map(o=>o.src))];
  const selTree=selSrcs.map(src=>{
    const srcObjs=selItems.filter(o=>o.src===src);
    const srcOpen=!dcObjSrcCollapsed.has(src);
    const schs=[...new Set(srcObjs.map(o=>o.s))];
    const schHTML=schs.map(sch=>{
      const key=src+'::'+sch;
      const schObjs=srcObjs.filter(o=>o.s===sch);
      const schOpen=!dcObjSchCollapsed.has(key);
      const rowHTML=schObjs.map(o=>{
        const k=o.src+'::'+o.n;
        return `<div class="obj-row sel" title="${o.d}">
          <span class="oi"><i class="fa-solid ${o.t==='view'?'fa-table-columns':'fa-table'}"></i></span>
          <span class="nm-wrap"><span class="ot">${o.n}</span><span class="cn">${o.d}</span><span class="sep">·</span><span class="ofc">${o.f} 字段</span><span class="sch-tag">${o.s}</span></span>
          <a class="tf-rm" onclick="dcObjToggle('${k}')" title="移除"><i class="fa-solid fa-xmark"></i></a>
        </div>`;
      }).join('');
      const tables=schObjs.filter(o=>o.t!=='view'), views=schObjs.filter(o=>o.t==='view');
      return `<div class="tf-sch ${schOpen?'is-open':'is-collapsed'}" onclick="dcObjSchToggle('${src}','${sch}')">
        <i class="tf-caret fa-solid ${schOpen?'fa-chevron-down':'fa-chevron-right'}"></i>
        <i class="fa-solid fa-folder${schOpen?'-open':''}"></i> schema: <b>${sch}</b>
        <span class="sch-cnt">${schObjs.length}</span>
      </div>${schOpen?`<div class="tf-group">${tables.length?`<div class="tf-sec">表 · ${tables.length}</div>${tables.map(o=>{
        const k=o.src+'::'+o.n;
        return `<div class="obj-row sel" title="${o.d}"><span class="oi"><i class="fa-solid fa-table"></i></span><span class="nm-wrap"><span class="ot">${o.n}</span><span class="cn">${o.d}</span><span class="sep">·</span><span class="ofc">${o.f} 字段</span></span><a class="tf-rm" onclick="dcObjToggle('${k}')" title="移除"><i class="fa-solid fa-xmark"></i></a></div>`;
      }).join('')}`:''}${views.length?`<div class="tf-sec">视图 · ${views.length}</div>${views.map(o=>{
        const k=o.src+'::'+o.n;
        return `<div class="obj-row sel" title="${o.d}"><span class="oi"><i class="fa-solid fa-table-columns"></i></span><span class="nm-wrap"><span class="ot">${o.n}</span><span class="cn">${o.d}</span><span class="sep">·</span><span class="ofc">${o.f} 字段</span></span><a class="tf-rm" onclick="dcObjToggle('${k}')" title="移除"><i class="fa-solid fa-xmark"></i></a></div>`;
      }).join('')}`:''}</div>`:''}`;
    }).join('');
    return `<div class="dc-sel-src ${srcOpen?'is-open':'is-collapsed'}" onclick="dcObjSrcToggle('${src}')">
      <div class="dc-sel-src-h"><i class="tf-caret fa-solid ${srcOpen?'fa-chevron-down':'fa-chevron-right'}"></i><i class="fa-solid ${srcIcon(src)}"></i> <b>${src}</b><span class="sch-cnt">${srcObjs.length}</span></div>
      ${srcOpen?`<div class="dc-sel-src-b">${schHTML}</div>`:''}
    </div>`;
  }).join('');

  wrap.innerHTML=`<div class="transfer">
    <div class="tf-pane">
      <div class="tf-bar">
        <label class="chk-all"><input type="checkbox" ${allFilteredSel&&allFiltered.length?'checked':''} onchange="dcObjAllFiltered(this)"> 全选</label>
        <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input id="dcObjSearch" placeholder="搜索数据源 / schema / 表 / 视图" value="${dcObjKw}" oninput="dcObjKw=this.value;dcObjRender()"></div>
      </div>
      <div class="obj-list tf-avail">
        ${availTree||`<div class="tf-empty">暂无可用数据源</div>`}
      </div>
    </div>
    <div class="tf-pane">
      <div class="tf-bar">
        <span class="obj-count">已选 ${selItems.length} 项</span>
        ${selItems.length?`<a class="tf-clear" onclick="dcObjClear()"><i class="fa-solid fa-xmark"></i> 清空已选</a>`:''}
      </div>
      <div class="obj-list tf-seled">
        ${selTree||`<div class="tf-empty">尚未选择对象，请从左侧添加</div>`}
      </div>
    </div>
  </div>`;

  wrap.querySelectorAll('input[data-indet="1"]').forEach(cb=>{ cb.indeterminate=true; });
  if(dcObjKw){ const s=document.getElementById('dcObjSearch'); if(s){ s.focus(); try{ s.setSelectionRange(s.value.length,s.value.length); }catch(e){} } }
}
function dcObjAllFiltered(box){
  const kw=dcObjKw.trim().toLowerCase();
  DS_LIST.forEach(s=>{
    DB_OBJS.filter(o=>o.src===s.name).forEach(o=>{
      if(!kw || o.n.toLowerCase().includes(kw) || o.d.toLowerCase().includes(kw) || s.name.toLowerCase().includes(kw) || o.s.toLowerCase().includes(kw)){
        const k=o.src+'::'+o.n; if(box.checked) dcObjSel.add(k); else dcObjSel.delete(k);
      }
    });
  });
  dcObjRender();
}
function dcObjSrcToggle(name){ if(dcObjSrcCollapsed.has(name)) dcObjSrcCollapsed.delete(name); else dcObjSrcCollapsed.add(name); dcObjRender(); }
function dcObjSchToggle(src,sch){ const key=src+'::'+sch; if(dcObjSchCollapsed.has(key)) dcObjSchCollapsed.delete(key); else dcObjSchCollapsed.add(key); dcObjRender(); }
function dcObjSrcAll(name){ const objs=DB_OBJS.filter(o=>o.src===name); const all=objs.length>0 && objs.every(o=>dcObjSel.has(o.src+'::'+o.n)); objs.forEach(o=>{ const k=o.src+'::'+o.n; if(all) dcObjSel.delete(k); else dcObjSel.add(k); }); dcObjRender(); }
function dcObjSchAll(src,sch){ const objs=DB_OBJS.filter(o=>o.src===src && o.s===sch); const all=objs.length>0 && objs.every(o=>dcObjSel.has(o.src+'::'+o.n)); objs.forEach(o=>{ const k=o.src+'::'+o.n; if(all) dcObjSel.delete(k); else dcObjSel.add(k); }); dcObjRender(); }
function dcObjToggle(key){ if(dcObjSel.has(key)) dcObjSel.delete(key); else dcObjSel.add(key); dcObjRender(); }
function dcObjClear(){ dcObjSel.clear(); dcObjRender(); }
function dcScopeRender(){
  const wrap=document.getElementById('dcScopeWrap'); if(!wrap) return;
  const list=dcScopeMode==='dept'?DOM_DEPTS:DOM_USERS;
  const items=list.map(x=>{ const on=dcScopeSel.has(dcScopeMode+'::'+x); return `<label class="scope-item ${on?'on':''}" onclick="dcScopeToggle('${dcScopeMode}::${x}')"><input type="checkbox" disabled ${on?'checked':''}><span class="si-ic"><i class="fa-solid ${dcScopeMode==='dept'?'fa-sitemap':'fa-user'}"></i></span><span class="si-nm">${x}</span><span class="si-check"><i class="fa-solid fa-check"></i></span></label>`; }).join('');
  wrap.innerHTML=`<div class="scope-tabs"><button class="scope-tab ${dcScopeMode==='dept'?'active':''}" onclick="dcScopePick('dept')">按部门</button><button class="scope-tab ${dcScopeMode==='user'?'active':''}" onclick="dcScopePick('user')">按人员</button></div>
  <div class="scope-tip">${dcScopeMode==='dept'?'选择可访问该业务域的部门（可多选）':'选择可访问该业务域的人员（可多选）'}</div>
  <div class="scope-grid">${items}</div>`;
}
function dcScopePick(m){ dcScopeMode=m; dcScopeRender(); }
function dcScopeToggle(key){ if(dcScopeSel.has(key)) dcScopeSel.delete(key); else dcScopeSel.add(key); dcScopeRender(); }
function dcCreate(){
  const name=(document.getElementById('dcName').value||'').trim();
  const alias=(document.getElementById('dcAlias').value||'').trim();
  const desc=(document.getElementById('dcDesc').value||'').trim();
  const code=(document.getElementById('dcCode').value||'').trim();
  const parent=document.getElementById('dcParent').value||null;
  if(!name){ showToast('请填写业务域名称'); dcGo(1); return; }
  if(dcType==='leaf' && dcObjSel.size===0){ showToast('请至少关联一个数据对象'); dcGo(2); return; }
  if(dcType!=='leaf') dcObjSel.clear();
  const palette=['#4f8cff','#22c55e','#f59e0b','#a78bfa','#22d3ee','#ef4444','#ec4899','#14b8a6'];
  const color=palette[BD_LIST.length%palette.length];
  const icon= dcType==='category'?'fa-folder':'fa-layer-group';
  const srcMap={};
  dcObjSel.forEach(k=>{
    const idx=k.indexOf('::'); const src=k.slice(0,idx); const nm=k.slice(idx+2);
    const o=DB_OBJS.find(x=>x.src===src && x.n===nm);
    const entry=srcMap[src]=srcMap[src]||{src, tables:[], views:[]};
    if(o && o.t==='view') entry.views.push(nm); else entry.tables.push(nm);
  });
  const sources=Object.values(srcMap);
  BD_LIST.push({id:'D-'+String(BD_LIST.length+1).padStart(2,'0'), name, alias:alias||undefined, icon, color, desc:desc||'—', code:code||undefined, parentId:parent, type:dcType, sources: dcType==='leaf'?sources:[], roles:dcScopeSel.size, status:'on', authorized:true});
  renderView('domain');
  showToast('业务域「'+name+'」创建成功');
}
VIEWS.domain_create=()=>{
  setTimeout(()=>dcInit(),0);
  return `
${ph('业务域创建','新建业务域并关联数据对象、配置访问授权 · 三步向导 ',
  '<button class="btn" onclick="go(\'domain\')"><i class="fa-solid fa-arrow-left"></i>返回业务域管理</button>')}
<div class="pipe" id="dcSteps"></div>
<div class="card" id="dcCard" style="margin-top:18px">
  <div class="card-h" id="dcCardH"></div>
  <div class="card-b" id="dcCardB"></div>
  <div class="modal-f" id="dcFoot">
    <button class="btn" id="dcPrev" onclick="dcGo(dcStep-1)">上一步</button>
    <button class="btn" id="dcNext" onclick="dcGo(dcStep+1)">下一步</button>
    <button class="btn primary" id="dcCreate" onclick="dcCreate()" style="display:none">创建业务域</button>
  </div>
</div>
</div>`;
};

/* ---- API 服务管理 ---- */
VIEWS.apiservice=()=>`
${ph('API 服务管理','查询服务发布为 RESTful API · 订阅令牌 · 鉴权限流 · 调用记录 ')}
<div class="kpi-grid">
  <div class="kpi blue"><div class="ic blue"><i class="fa-solid fa-plug"></i></div><div class="lbl">已发布 API</div><div class="val">42</div></div>
  <div class="kpi green"><div class="ic green"><i class="fa-solid fa-key"></i></div><div class="lbl">订阅令牌</div><div class="val">18</div></div>
  <div class="kpi cyan"><div class="ic cyan"><i class="fa-solid fa-arrow-right-arrow-left"></i></div><div class="lbl">今日调用量</div><div class="val">86.4k</div><div class="trend up">+12%</div></div>
  <div class="kpi orange"><div class="ic orange"><i class="fa-solid fa-gauge-high"></i></div><div class="lbl">触发限流</div><div class="val">3</div></div>
</div>
<div class="card">
  <div class="tbl-bar"><span class="chip active">全部服务</span><span class="chip">运行中</span><span class="chip">已下线</span>
    <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索API名称"></div>
    <div class="tbl-acts"><button class="btn"><i class="fa-solid fa-book"></i>接口文档</button><button class="btn primary"><i class="fa-solid fa-plus"></i>发布服务</button></div></div>
  <div class="tbl-wrap"><table>
    <thead><tr><th>服务名称</th><th>接口路径</th><th>业务域</th><th>订阅方</th><th>QPS 限流</th><th>状态</th><th>操作</th></tr></thead>
    <tbody>
      ${[
        ['用地审批查询服务','/api/v1/approval/query','用地审批','一张图系统','100','on'],
        ['不动产登记查询','/api/v1/estate/reg','不动产','政务大厅','200','on'],
        ['耕地指标查询','/api/v1/farmland/index','耕地保护','决策驾驶舱','50','on'],
        ['地块空间查询','/api/v1/parcel/geo','国土空间规划','移动执法App','80','off'],
      ].map(r=>`<tr><td><b>${r[0]}</b></td><td class="mono" style="color:var(--accent-2);font-size:11.5px">${r[1]}</td><td><span class="pill info">${r[2]}</span></td><td>${r[3]}</td><td class="mono">${r[4]}/s</td>
      <td>${r[5]==='on'?'<span class="pill on">运行中</span>':'<span class="pill off">已下线</span>'}</td>
      <td><div class="act"><a title="调试"><i class="fa-solid fa-vial"></i></a><a title="调用记录"><i class="fa-solid fa-list"></i></a><a title="编辑"><i class="fa-solid fa-pen"></i></a></div></td></tr>`).join('')}
    </tbody>
  </table></div>
</div>`;

/* ---- 模型管理 ---- */
const MODEL_TYPE_COLOR={'大语言模型':'#4f8cff','嵌入模型':'#22d3ee','重排序模型':'#a78bfa','视觉模型':'#ec4899','自研微调模型':'#f59e0b'};
const MODEL_TYPE_ICON={'大语言模型':'fa-comment-dots','嵌入模型':'fa-vector-square','重排序模型':'fa-arrows-left-right','视觉模型':'fa-eye','自研微调模型':'fa-brain'};
const MODEL_LIST=[
  {id:'M-01',name:'Qwen2.5-72B',type:'大语言模型',vendor:'阿里云 · 通义千问',source:'云端 API',addr:'https://model-a.example.com/v1',role:'意图识别 / SQL 生成',status:'enabled',
   desc:'通义千问 720 亿参数开源大模型，负责自然语言意图识别与 Text-to-SQL 生成，平台主模型。',
   params:{temperature:0.2,top_p:0.9,top_k:40,max_tokens:2048,freq_penalty:0.1,pres_penalty:0.0,stop:'',stream:true}},
  {id:'M-02',name:'DeepSeek-V3',type:'大语言模型',vendor:'深度求索',source:'云端 API',addr:'https://model-b.example.com/v1',role:'SQL 生成（A/B 灰度）',status:'enabled',
   desc:'671B MoE 大模型，作为 SQL 生成主模型的 A/B 灰度对照版本，用于生成质量评估。',
   params:{temperature:0.3,top_p:0.85,top_k:50,max_tokens:2048,freq_penalty:0.0,pres_penalty:0.0,stop:'',stream:true}},
  {id:'M-03',name:'BGE-large-zh',type:'嵌入模型',vendor:'智源研究院',source:'本地部署',addr:'https://embedding.example.com/v1',role:'向量语义召回',status:'enabled',
   desc:'中文通用句向量模型，用于用户问题向量化与样例语义召回。',params:null},
  {id:'M-04',name:'GLM-4',type:'大语言模型',vendor:'智谱 AI',source:'云端 API',addr:'https://model-c.example.com/v1',role:'数据解读 / 多轮追问',status:'enabled',
   desc:'负责查询结果的自然语言解读、图表文字说明与多轮追问补全。',
   params:{temperature:0.5,top_p:0.95,top_k:0,max_tokens:1024,freq_penalty:0.0,pres_penalty:0.0,stop:'',stream:true}},
  {id:'M-05',name:'自研 NL2SQL',type:'自研微调模型',vendor:'本平台',source:'本地部署',addr:'https://nl2sql.example.com/v1',role:'规自领域微调',
   desc:'基于规自行业语料微调的 NL2SQL 专用模型，当前灰度测试中。',status:'not_enabled',params:null},
];
const GEN_PARAM_DEFS=[
  {key:'temperature',name:'温度 Temperature',min:0,max:2,step:0.01,def:0.2,desc:'控制生成随机性，值越高输出越发散、越有创意。'},
  {key:'top_p',name:'Top-P',min:0,max:1,step:0.01,def:0.9,desc:'核采样概率阈值，仅从累计概率 Top-P 的候选词中采样。'},
  {key:'top_k',name:'Top-K',min:0,max:100,step:1,def:40,desc:'候选词数量上限，0 表示不限制。'},
  {key:'max_tokens',name:'最大生成长度',min:256,max:8192,step:64,def:2048,desc:'单次请求生成的最大 token 数量。'},
  {key:'freq_penalty',name:'频率惩罚',min:-2,max:2,step:0.01,def:0.0,desc:'降低已出现词语的重复概率。'},
  {key:'pres_penalty',name:'存在惩罚',min:-2,max:2,step:0.01,def:0.0,desc:'鼓励引入新话题，降低重复句式。'},
];
let modelFlt='全部';
let modelKw='';
let modelViewMode='card';   // 'card' 卡片视图（默认） | 'list' 列表视图
let modelGpIdx=-1;
let modelEditIdx=-1;

function modelTypePill(m){
  const c=MODEL_TYPE_COLOR[m.type]||'#888';
  return `<span class="pill info" style="color:${c};background:${c}1f">${m.type}</span>`;
}
function modelStatusPill(m){
  if(m.status==='enabled') return '<span class="pill on"><i class="fa-solid fa-circle"></i>已启用</span>';
  if(m.status==='not_enabled') return '<span class="pill warn"><i class="fa-solid fa-circle"></i>未启用</span>';
  return '<span class="pill off"><i class="fa-solid fa-circle"></i>已停用</span>';
}
function modelRolePill(m){
  return `<span class="pill">${m.role}</span>`;
}
/* 卡片视图：精简展示，不显示厂商 / 来源 / 服务地址 / 描述 */
function renderModelGrid(){
  const list=modelFlt==='全部'?MODEL_LIST:MODEL_LIST.filter(m=>m.type===modelFlt);
  if(!list.length) return '<div class="empty-soon" style="grid-column:1/-1"><i class="fa-solid fa-microchip"></i>暂无该类型的模型</div>';
  return list.map(m=>{
    const gi=MODEL_LIST.indexOf(m);
    const c=MODEL_TYPE_COLOR[m.type]||'#888';
    const isLLM=m.type==='大语言模型';
    const gpBtn=isLLM?'<button class="btn" onclick="modelOpenGenParam('+gi+')"><i class="fa-solid fa-sliders"></i>生成参数</button>':'';
    return `<div class="card mdl-card">
      <div class="mdl-hd">
        <div class="ic" style="background:${c}1f;color:${c}"><i class="fa-solid ${MODEL_TYPE_ICON[m.type]||'fa-microchip'}"></i></div>
        <div class="nm"><b>${m.name}</b><small style="color:${c}">${m.type}</small></div>
        ${modelStatusPill(m)}
      </div>
      <div class="mdl-tags">${modelRolePill(m)}</div>
      <div class="mdl-ft">
        ${gpBtn}
        <div class="act">
          <a title="编辑" onclick="modelOpenEdit(${gi})"><i class="fa-solid fa-pen"></i></a>
          <a title="启停" onclick="modelToggleStatus(${gi})"><i class="fa-solid fa-power-off"></i></a>
          <a class="del ${m.status==='not_enabled'?'':'disabled'}" title="${m.status==='not_enabled'?'删除':'仅未启用状态的模型可删除'}" ${m.status==='not_enabled'?'onclick="modelDelete('+gi+')"':''}><i class="fa-solid fa-trash"></i></a>
        </div>
      </div>
    </div>`;
  }).join('');
}
/* 列表视图：完整展示名称 / 类型 / 厂商 / 来源 / 服务地址 / 描述 / 状态 */
function modelListRow(m){
  const gi=MODEL_LIST.indexOf(m);
  const isLLM=m.type==='大语言模型';
  const gpBtn=isLLM?'<a title="生成参数" onclick="modelOpenGenParam('+gi+')"><i class="fa-solid fa-sliders"></i></a>':'';
  return `<tr>
    <td><div class="mdl-cell"><div class="ic sm" style="background:${MODEL_TYPE_COLOR[m.type]||'#888'}1f;color:${MODEL_TYPE_COLOR[m.type]||'#888'}"><i class="fa-solid ${MODEL_TYPE_ICON[m.type]||'fa-microchip'}"></i></div><div><b>${m.name}</b><div class="mono" style="font-size:11px;color:var(--text-3)">${m.id}</div></div></div></td>
    <td>${modelTypePill(m)}</td>
    <td>${m.vendor}</td>
    <td>${m.source}</td>
    <td style="color:var(--text-2)">${m.role}</td>
    <td class="mono" style="font-size:12px;color:var(--accent-2)">${m.addr}</td>
    <td>${modelStatusPill(m)}</td>
    <td><div class="act">${gpBtn}<a title="编辑" onclick="modelOpenEdit(${gi})"><i class="fa-solid fa-pen"></i></a><a title="启停" onclick="modelToggleStatus(${gi})"><i class="fa-solid fa-power-off"></i></a><a class="del ${m.status==='not_enabled'?'':'disabled'}" title="${m.status==='not_enabled'?'删除':'仅未启用状态的模型可删除'}" ${m.status==='not_enabled'?'onclick="modelDelete('+gi+')"':''}><i class="fa-solid fa-trash"></i></a></div></td>
  </tr>`;
}
function modelListHTML(){
  const kw=modelKw.trim().toLowerCase();
  const rows=MODEL_LIST.filter(m=>{
    if(modelFlt!=='全部' && m.type!==modelFlt) return false;
    if(kw){ const hay=(m.name+' '+m.vendor+' '+m.desc).toLowerCase(); if(!hay.includes(kw)) return false; }
    return true;
  });
  return `<div class="card"><div class="tbl-wrap"><table>
    <thead><tr><th>模型名称</th><th>类型</th><th>厂商</th><th>来源</th><th>用途</th><th>服务地址</th><th>状态</th><th style="width:120px">操作</th></tr></thead>
    <tbody id="modelTbody">${rows.map(r=>modelListRow(r)).join('')}</tbody>
  </table></div>
  <div class="pager" id="modelPager"><span>共 ${rows.length} 条</span><a class="on">1</a></div></div>`;
}
/* 仅重渲染主体区域（切换筛选 / 搜索时保留输入框焦点） */
function modelRenderBody(){
  const b=document.getElementById('modelBody'); if(!b) return;
  b.innerHTML = modelViewMode==='card' ? `<div class="mdl-grid">${renderModelGrid()}</div>` : modelListHTML();
}
VIEWS.model=()=>`
${ph('模型管理','平台 AI 模型统一管理 · 接入 · 信息维护 · 生成参数配置 · 启停 ',
  `<div class="meta-toggle">
    <button class="seg ${modelViewMode==='list'?'on':''}" onclick="modelSetView('list')"><i class="fa-solid fa-list"></i> 列表视图</button>
    <button class="seg ${modelViewMode==='card'?'on':''}" onclick="modelSetView('card')"><i class="fa-solid fa-table-cells-large"></i> 卡片视图</button>
  </div>`)}
<div class="tbl-bar" id="modelTblBar">
  <span class="chip chip-all ${modelFlt==='全部'?'active':''}" onclick="modelSetFilter('全部',this)">全部</span>
  ${Array.from(new Set(MODEL_LIST.map(m=>m.type))).map(t=>`<span class="chip ${modelFlt===t?'active':''}" onclick="modelSetFilter('${t}',this)">${t}</span>`).join('')}
  <div class="mini-search" style="margin-left:auto"><i class="fa-solid fa-magnifying-glass"></i><input id="modelSearchInput" placeholder="搜索模型名称 / 厂商" value="${modelKw}" oninput="modelSearch(this.value)"></div>
  <div class="tbl-acts"><button class="btn primary" onclick="modelOpenAdd()"><i class="fa-solid fa-plus"></i>接入模型</button></div>
</div>
<div id="modelBody">${modelViewMode==='card'?`<div class="mdl-grid">${renderModelGrid()}</div>`:modelListHTML()}</div>`;
function modelSetView(m){ if(modelViewMode===m) return; modelViewMode=m; renderView('model'); }
function modelSetFilter(t,el){
  modelFlt=t;
  document.querySelectorAll('#modelTblBar .chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  else { const a=document.querySelector('#modelTblBar .chip-all'); if(a) a.classList.add('active'); }
  modelRenderBody();
}
function modelSearch(v){ modelKw=v; modelRenderBody(); }

/* 接入 / 编辑模型 */
function modelOpenAdd(){ modelEditIdx=-1; modelFillForm(null); document.getElementById('modelModalTitle').textContent='接入模型'; openModal('modelEditModal'); }
function modelOpenEdit(i){ modelEditIdx=i; modelFillForm(MODEL_LIST[i]); document.getElementById('modelModalTitle').textContent='编辑模型'; openModal('modelEditModal'); }
function modelFillForm(m){
  document.getElementById('mName').value=m?m.name:'';
  document.getElementById('mType').value=m?m.type:'大语言模型';
  document.getElementById('mVendor').value=m?m.vendor:'';
  document.getElementById('mSource').value=m?m.source:'云端 API';
  document.getElementById('mAddr').value=m?m.addr:'';
  document.getElementById('mRole').value=m?m.role:'';
  document.getElementById('mDesc').value=m?m.desc:'';
}
function modelSave(){
  const name=(document.getElementById('mName').value||'').trim();
  const addr=(document.getElementById('mAddr').value||'').trim();
  if(!name){ showToast('请填写模型名称'); return; }
  if(!addr){ showToast('请填写服务地址'); return; }
  const data={
    name,
    type:document.getElementById('mType').value,
    vendor:document.getElementById('mVendor').value.trim()||'—',
    source:document.getElementById('mSource').value,
    addr,
    role:document.getElementById('mRole').value.trim()||'—',
    desc:document.getElementById('mDesc').value.trim()||'—',
  };
  if(modelEditIdx>=0){
    Object.assign(MODEL_LIST[modelEditIdx],data);
  }else{
    data.id='M-'+String(MODEL_LIST.length+1).padStart(2,'0');
    data.status='not_enabled';
    data.params=data.type==='大语言模型'?{temperature:0.2,top_p:0.9,top_k:40,max_tokens:2048,freq_penalty:0,pres_penalty:0,stop:'',stream:true}:null;
    MODEL_LIST.push(data);
  }
  renderView('model');
  closeModal('modelEditModal');
  showToast(modelEditIdx>=0?'模型信息已更新':'模型已接入');
}
function modelToggleStatus(i){
  const m=MODEL_LIST[i];
  if(m.status==='not_enabled'){ m.status='enabled'; }
  else if(m.status==='enabled'){ m.status='disabled'; }
  else { m.status='enabled'; }
  renderView('model');
  showToast(m.name+' · '+(m.status==='enabled'?'已启用':m.status==='not_enabled'?'未启用':'已停用'));
}
function modelDelete(i){
  const m=MODEL_LIST[i];
  if(m.status!=='not_enabled'){ showToast('仅未启用状态的模型可删除'); return; }
  showConfirm('确认删除模型「'+m.name+'」？删除后不可恢复。',()=>{ MODEL_LIST.splice(i,1); renderView('model'); showToast('已删除模型'); });
}

/* 大语言模型生成参数调整 */
function modelOpenGenParam(i){
  modelGpIdx=i;
  const m=MODEL_LIST[i];
  document.getElementById('modelGpTitle').textContent='生成参数 · '+m.name;
  const body=document.getElementById('modelGpBody');
  body.innerHTML=GEN_PARAM_DEFS.map(d=>{
    const v=m.params[d.key];
    return `<div class="gp-row">
      <div class="gp-top"><span class="gp-name">${d.name}</span><span class="gp-val" id="gpv_${d.key}">${v}</span></div>
      <div class="gp-desc">${d.desc}</div>
      <input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" id="gpr_${d.key}" oninput="gpSync('${d.key}')">
    </div>`;
  }).join('')+`
    <div class="gp-extra">
      <div class="form-field"><label>停止词 Stop（可选，逗号分隔）</label><input id="gp_stop" placeholder="如：\\n\\n, ###" value="${m.params.stop||''}"></div>
      <div class="form-field"><label>流式输出 Stream</label>
        <select id="gp_stream"><option value="1" ${m.params.stream?'selected':''}>开启</option><option value="0" ${!m.params.stream?'selected':''}>关闭</option></select>
      </div>
    </div>`;
  openModal('modelGenParamModal');
}
function gpSync(key){
  const r=document.getElementById('gpr_'+key);
  document.getElementById('gpv_'+key).textContent=r.value;
}
function modelResetGp(){
  const m=MODEL_LIST[modelGpIdx];
  GEN_PARAM_DEFS.forEach(d=>{ if(m.params[d.key]!==undefined) m.params[d.key]=d.def; });
  modelOpenGenParam(modelGpIdx);
}
function modelSaveGp(){
  const m=MODEL_LIST[modelGpIdx];
  GEN_PARAM_DEFS.forEach(d=>{ m.params[d.key]=parseFloat(document.getElementById('gpr_'+d.key).value); });
  m.params.stop=document.getElementById('gp_stop').value.trim();
  m.params.stream=document.getElementById('gp_stream').value==='1';
  closeModal('modelGenParamModal');
  showToast('「'+m.name+'」生成参数已保存');
}

/* ---- 用户与权限 ---- */
/* ---- 用户与权限：组织人员（目录树，含子部门）/ 权限管理（业务域授权记录查询） 两个 Tab ---- */
let userCurTab='org';
let userAuthStatus='全部';
const userSyncTs={org:'—'};
const userKw={org:'',perm:''};
/* st: on=已启用 / off=已停用；src: sync=系统同步（不可改删） / local=人工新增（可改删） */
const USER_DEPTS=[
  {name:'演示部门03', sub:null, src:'sync', st:'on'},
  {name:'演示部门01', sub:[{name:'演示部门18',src:'sync',st:'on'},{name:'演示部门11',src:'sync',st:'on'},{name:'演示部门12',src:'sync',st:'off'}], src:'sync', st:'on'},
  {name:'演示部门16', sub:null, src:'sync', st:'on'},
  {name:'演示部门13', sub:[{name:'演示部门05',src:'sync',st:'on'},{name:'演示部门04',src:'sync',st:'on'}], src:'sync', st:'on'},
  {name:'演示部门06', sub:null, src:'sync', st:'off'},
  {name:'演示部门02', sub:[{name:'演示部门20',src:'sync',st:'on'},{name:'演示部门09',src:'sync',st:'on'},{name:'演示部门07',src:'local',st:'on'}], src:'sync', st:'on'},
  {name:'演示部门10', sub:null, src:'local', st:'on'},
];
const USER_LIST=[
  {acct:'demo_user_09',name:'演示用户13',gender:'男',dept:'演示部门03',phone:'000-0000-0000',email:'demo11@example.com',st:'on',src:'sync'},
  {acct:'demo_user_10',name:'演示用户26',gender:'女',dept:'演示部门03',phone:'000-0000-0000',email:'demo12@example.com',st:'on',src:'sync'},
  {acct:'demo_user_01',name:'演示用户32',gender:'男',dept:'演示部门18',phone:'000-0000-0000',email:'demo02@example.com',st:'on',src:'sync'},
  {acct:'demo_user_13',name:'演示用户06',gender:'女',dept:'演示部门11',phone:'000-0000-0000',email:'demo15@example.com',st:'on',src:'sync'},
  {acct:'demo_user_08',name:'演示用户05',gender:'男',dept:'演示部门12',phone:'000-0000-0000',email:'demo10@example.com',st:'off',src:'sync'},
  {acct:'demo_user_04',name:'演示用户17',gender:'男',dept:'演示部门16',phone:'000-0000-0000',email:'demo05@example.com',st:'on',src:'sync'},
  {acct:'demo_user_11',name:'演示用户25',gender:'女',dept:'演示部门16',phone:'000-0000-0000',email:'demo13@example.com',st:'off',src:'sync'},
  {acct:'demo_user_07',name:'演示用户21',gender:'男',dept:'演示部门05',phone:'000-0000-0000',email:'demo09@example.com',st:'on',src:'sync'},
  {acct:'demo_user_12',name:'演示用户27',gender:'女',dept:'演示部门04',phone:'000-0000-0000',email:'demo14@example.com',st:'on',src:'sync'},
  {acct:'demo_user_06',name:'演示用户09',gender:'男',dept:'演示部门06',phone:'000-0000-0000',email:'demo08@example.com',st:'on',src:'sync'},
  {acct:'demo_admin',name:'演示用户23',gender:'男',dept:'演示部门20',phone:'000-0000-0000',email:'demo01@example.com',st:'on',src:'sync'},
  {acct:'demo_user_02',name:'演示用户02',gender:'女',dept:'演示部门09',phone:'000-0000-0000',email:'demo03@example.com',st:'on',src:'sync'},
  {acct:'demo_user_05',name:'演示用户31',gender:'女',dept:'演示部门07',phone:'000-0000-0000',email:'demo07@example.com',st:'on',src:'local'},
  {acct:'demo_user_03',name:'演示用户01',gender:'男',dept:'演示部门10',phone:'000-0000-0000',email:'demo04@example.com',st:'off',src:'local'},
];
const USER_PERM=[
  {name:'数据接入',type:'功能权限',desc:'注册与配置数据源',roles:2},
  {name:'元数据管理',type:'功能权限',desc:'采集与维护表字段元数据',roles:2},
  {name:'业务域授权',type:'功能权限',desc:'授权业务域访问范围',roles:3},
  {name:'系统管理',type:'功能权限',desc:'管理系统参数与字典',roles:1},
  {name:'数据查询',type:'数据权限',desc:'执行问数 SQL 查询',roles:4},
];
/* 业务域授权记录：业务域 → 授权对象（部门 / 角色 / 业务应用）的授权留痕，供权限管理 Tab 查询 */
const USER_AUTH_RECS=[
  {id:'AUTH-2026-001',domain:'自然资源',dtype:'业务分类',target:'全局（自然资源综合归类）',scope:'全部部门',granter:'管理员',time:'2026-07-10 08:00',status:'已授权'},
  {id:'AUTH-2026-002',domain:'空间规划',dtype:'业务分类',target:'演示部门03',scope:'演示部门03',granter:'数据治理组',time:'2026-07-14 11:12',status:'已授权'},
  {id:'AUTH-2026-003',domain:'国土空间规划',dtype:'业务子域',target:'综合演示助手',scope:'演示部门03、演示部门09',granter:'管理员',time:'2026-07-15 10:20',status:'已授权'},
  {id:'AUTH-2026-004',domain:'测绘地理信息',dtype:'业务子域',target:'演示部门05、演示部门04',scope:'演示部门05、演示部门04',granter:'数据治理组',time:'2026-07-16 14:05',status:'已授权'},
  {id:'AUTH-2026-005',domain:'权属登记',dtype:'业务分类',target:'演示部门01',scope:'演示部门01',granter:'管理员',time:'2026-07-11 15:20',status:'已授权'},
  {id:'AUTH-2026-006',domain:'不动产登记',dtype:'业务子域',target:'演示部门18、演示部门11、演示部门12',scope:'演示部门01',granter:'管理员',time:'2026-07-12 09:30',status:'已授权'},
  {id:'AUTH-2026-007',domain:'政务审批监管',dtype:'业务分类',target:'全局（审批与耕地保护归类）',scope:'全部部门',granter:'演示用户17',time:'2026-07-13 10:00',status:'已授权'},
  {id:'AUTH-2026-008',domain:'耕地保护',dtype:'业务子域',target:'演示部门16',scope:'演示部门16',granter:'演示用户17',time:'2026-07-18 16:40',status:'已授权'},
  {id:'AUTH-2026-009',domain:'用地审批',dtype:'业务子域',target:'—',scope:'—',granter:'—',time:'—',status:'待授权'},
  {id:'AUTH-2026-010',domain:'执法监察',dtype:'业务子域',target:'—',scope:'—',granter:'—',time:'—',status:'待授权'},
  {id:'AUTH-2026-011',domain:'测绘地理信息',dtype:'业务子域',target:'演示部门06',scope:'演示部门06',granter:'管理员',time:'2026-06-30 09:00',status:'已撤销'},
  {id:'AUTH-2026-012',domain:'耕地保护',dtype:'业务子域',target:'演示部门06',scope:'演示部门06',granter:'演示用户17',time:'2026-06-20 14:00',status:'已撤销'},
];
function userSync(kind){
  const label={org:'组织人员'}[kind]||kind;
  const d=new Date();
  const p=n=>String(n).padStart(2,'0');
  const ts=`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  userSyncTs[kind]=ts;
  showToast(`已从「单位权限管理系统」同步${label}（${ts}）`);
  if(userCurTab===kind){ const b=document.getElementById('userTabBody'); if(b) b.innerHTML=userTabBody(kind); }
}
/* 编辑态：null=新增；否则为被编辑对象的标识（部门名 / 用户账号） */
let userEditKey={dept:null,user:null};
/* 所属部门级联：一级部门下拉（无子部门的部门可直接作为归属） */
function userTopDeptOptions(sel){
  return USER_DEPTS.map(d=>`<option value="${d.name}"${d.name===sel?' selected':''}>${d.name}</option>`).join('');
}
/* 根据一级部门刷新第二级下拉：有子部门则列出子部门，无子部门则置为「本部门（无下级）」 */
function userDeptCascade(sel){
  const s1=document.getElementById('f_dept1'), s2=document.getElementById('f_dept2');
  if(!s1||!s2) return;
  const d=USER_DEPTS.find(x=>x.name===s1.value);
  const subs=(d&&Array.isArray(d.sub))?d.sub:[];
  if(subs.length){
    s2.disabled=false;
    s2.innerHTML=subs.map(s=>`<option value="${s.name}"${s.name===sel?' selected':''}>${s.name}</option>`).join('');
  } else {
    s2.disabled=true;
    s2.innerHTML='<option value="">本部门（无下级）</option>';
  }
}
/* 取级联选择的最终归属部门名 */
function userCascadeValue(){
  const s1=document.getElementById('f_dept1'), s2=document.getElementById('f_dept2');
  if(!s1) return '';
  return (s2&&!s2.disabled&&s2.value)?s2.value:s1.value;
}
function userOpenForm(mode,editId){
  if(mode==='dept'){
    const body=document.getElementById('userDeptModalBody'); if(!body) return;
    const f=editId?userFindDept(editId):null;
    userEditKey.dept=f?f.node.name:null;
    const nm=f?f.node.name:'';
    const pv=f?(f.parent?f.parent.name:'__root__'):'__root__';
    body.innerHTML=`
      <div class="form-field" style="margin-bottom:14px"><label>部门名称</label><input id="f_deptname" class="di" placeholder="如：财务科" value="${nm}"></div>
      <div class="form-field" style="margin-bottom:14px"><label>上级部门</label><select id="f_parent" class="di">${allDeptOptions(pv,nm)}</select></div>
      <div class="form-field"><label>说明（选填）</label><input id="f_deptdesc" class="di" placeholder="请输入部门说明" value="${f&&f.node.desc?f.node.desc:''}"></div>`;
    const ttl=document.getElementById('userDeptModalTitle'); if(ttl) ttl.textContent=f?'编辑部门':'新增部门';
    const sb=document.getElementById('userDeptSubmitBtn'); if(sb) sb.innerHTML=`<i class="fa-solid fa-check"></i>${f?'保存修改':'确认新增'}`;
    openModal('userDeptModal');
    setTimeout(()=>{ const el=document.getElementById('f_deptname'); if(el) el.focus(); },60);
  } else {
    const body=document.getElementById('userUserModalBody'); if(!body) return;
    const u=editId?USER_LIST.find(x=>x.acct===editId):null;
    userEditKey.user=u?u.acct:null;
    const g=u?u.gender:'男';
    const genderOpts=['男','女'].map(x=>`<option${x===g?' selected':''}>${x}</option>`).join('');
    // 级联初值：由用户当前部门反推所属一级部门
    let top=u?u.dept:USER_DEPTS[0].name, sub='';
    if(u){ const f=userFindDept(u.dept); if(f){ if(f.parent){ top=f.parent.name; sub=f.node.name; } else { top=f.node.name; } } }
    body.innerHTML=`
      <div class="form-field" style="margin-bottom:12px"><label>姓名</label><input id="f_name" class="di" placeholder="如：演示用户29" value="${u?u.name:''}"></div>
      <div class="form-field" style="margin-bottom:12px"><label>账号</label><input id="f_acct" class="di" placeholder="如：qian.dd" value="${u?u.acct:''}"${u?' disabled':''}></div>
      <div class="form-field" style="margin-bottom:12px"><label>性别</label><select id="f_gender" class="di">${genderOpts}</select></div>
      <div class="form-field" style="margin-bottom:12px"><label>所属部门</label>
        <div class="cascade">
          <select id="f_dept1" class="di" onchange="userDeptCascade()">${userTopDeptOptions(top)}</select>
          <select id="f_dept2" class="di"></select>
        </div>
      </div>
      <div class="form-field" style="margin-bottom:12px"><label>联系方式</label><input id="f_phone" class="di" placeholder="如：000-0000-0000" value="${u?u.phone:''}"></div>
      <div class="form-field"><label>邮箱</label><input id="f_email" class="di" placeholder="如：demo06@example.com" value="${u?u.email:''}"></div>`;
    userDeptCascade(sub);
    const ttl=document.getElementById('userUserModalTitle'); if(ttl) ttl.textContent=u?'编辑用户':'新增用户';
    const sb=document.getElementById('userUserSubmitBtn'); if(sb) sb.innerHTML=`<i class="fa-solid fa-check"></i>${u?'保存修改':'确认新增'}`;
    openModal('userUserModal');
    setTimeout(()=>{ const el=document.getElementById('f_name'); if(el) el.focus(); },60);
  }
}
function userSubmitDept(){
  const name=(document.getElementById('f_deptname')?.value||'').trim();
  const parent=(document.getElementById('f_parent')?.value||'__root__');
  const desc=(document.getElementById('f_deptdesc')?.value||'').trim();
  if(!name){ showToast('请输入部门名称'); return; }
  const editKey=userEditKey.dept;
  const dup=userFindDept(name);
  if(dup&&(!editKey||dup.node.name!==editKey)){ showToast('已存在同名部门「'+name+'」'); return; }
  if(editKey){
    const f=userFindDept(editKey); if(!f){ showToast('待修改的部门不存在'); return; }
    const d=f.node, oldName=d.name;
    const curParent=f.parent?f.parent.name:'__root__';
    if(parent!==curParent){
      const subs=Array.isArray(d.sub)?d.sub:[];
      if(subs.length&&parent!=='__root__'){ showToast('该部门下已有子部门，不能再挂到其他部门下'); return; }
      if(f.parent){ const k=f.parent.sub.indexOf(d); if(k>=0) f.parent.sub.splice(k,1); }
      else { const k=USER_DEPTS.indexOf(d); if(k>=0) USER_DEPTS.splice(k,1); }
      if(parent==='__root__'){ d.sub=d.sub||null; USER_DEPTS.push(d); }
      else { const p=USER_DEPTS.find(x=>x.name===parent); if(!p){ showToast('上级部门不存在'); return; } delete d.sub; p.sub=p.sub||[]; p.sub.push(d); }
    }
    d.name=name; d.desc=desc;
    if(oldName!==name) USER_LIST.forEach(u=>{ if(u.dept===oldName) u.dept=name; });
    userEditKey.dept=null;
    closeModal('userDeptModal'); showToast('部门「'+name+'」已更新');
  } else {
    if(parent==='__root__'){ USER_DEPTS.push({name,sub:null,src:'local',st:'on',desc}); }
    else {
      const p=USER_DEPTS.find(d=>d.name===parent);
      if(!p){ showToast('上级部门不存在'); return; }
      p.sub=p.sub||[];
      p.sub.push({name,src:'local',st:'on',desc});
    }
    closeModal('userDeptModal'); showToast('已新增本地部门：'+name);
  }
  userRerenderOrg();
}
function userSubmitUser(){
  const name=(document.getElementById('f_name')?.value||'').trim();
  const acct=(document.getElementById('f_acct')?.value||'').trim();
  const gender=document.getElementById('f_gender')?.value||'男';
  const dept=userCascadeValue();
  const phone=(document.getElementById('f_phone')?.value||'').trim();
  const email=(document.getElementById('f_email')?.value||'').trim();
  if(!name||!acct||!dept){ showToast('请填写姓名、账号、所属部门'); return; }
  const editKey=userEditKey.user;
  if(editKey){
    const u=USER_LIST.find(x=>x.acct===editKey); if(!u){ showToast('待修改的用户不存在'); return; }
    Object.assign(u,{name,gender,dept,phone,email});
    userEditKey.user=null;
    closeModal('userUserModal'); showToast('用户「'+name+'」已更新');
  } else {
    if(USER_LIST.some(u=>u.acct===acct)){ showToast('账号「'+acct+'」已存在'); return; }
    USER_LIST.push({acct,name,gender,dept,phone,email,st:'on',src:'local'});
    closeModal('userUserModal'); showToast('已新增本地用户：'+name);
  }
  userRerenderOrg();
}
function userTab(t){
  userCurTab=t;
  document.querySelectorAll('#userTabs .mtab').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
  const b=document.getElementById('userTabBody'); if(b) b.innerHTML=userTabBody(t);
}
function userSearch(t){
  const kw=userKw[t].trim().toLowerCase();
  document.querySelectorAll('#userTabBody tbody tr').forEach(r=>{
    r.style.display=(!kw||r.textContent.toLowerCase().includes(kw))?'':'none';
  });
}
/* 权限管理 Tab：业务域授权记录查询（关键字 + 状态筛选） */
function userAuthSearch(){
  const kw=userKw.perm.trim().toLowerCase();
  const st=userAuthStatus;
  document.querySelectorAll('#userTabBody tbody tr').forEach(r=>{
    const rowSt=r.querySelector('td[data-st]')?.dataset.st||'';
    const okKw=!kw||r.textContent.toLowerCase().includes(kw);
    const okSt=st==='全部'||rowSt===st;
    r.style.display=(okKw&&okSt)?'':'none';
  });
}
function userToggleNode(el){ const n=el.closest('.ot-node'); if(n) n.classList.toggle('collapsed'); }
function userOrgSearch(){
  const val=userKw.org.trim().toLowerCase();
  document.querySelectorAll('#userTabBody .ot-member').forEach(m=>{
    const txt=(m.dataset.s||m.textContent).toLowerCase();
    m.style.display=(!val||txt.includes(val))?'':'none';
  });
  [...document.querySelectorAll('#userTabBody .ot-node')].reverse().forEach(n=>{
    const head=n.querySelector(':scope > .ot-head'); if(!head) return;
    const kids=[...n.querySelectorAll(':scope > .ot-children > *')]; if(!kids.length) return;
    const visible=kids.some(k=>k.style.display!=='none');
    const selfHit=(head.querySelector('b')?.textContent||'').toLowerCase().includes(val);
    n.style.display=((val&&!visible&&!selfHit)?'none':'');
    if(val&&(visible||selfHit)) n.classList.remove('collapsed');
  });
}
function userSrcTag(src){ return src==='local'?'<span class="ot-src local">人工新增</span>':'<span class="ot-src sync">系统同步</span>'; }
/* 上级部门仅支持「根」与一级部门（组织树为两级），exclude 用于编辑时排除自身 */
function allDeptOptions(sel,exclude){
  const opts=[`<option value="__root__"${sel==='__root__'?' selected':''}>规划和自然资源局（根）</option>`];
  USER_DEPTS.forEach(d=>{
    if(d.name===exclude) return;
    opts.push(`<option value="${d.name}"${d.name===sel?' selected':''}>${d.name}</option>`);
  });
  return opts.join('');
}
function allLeafDeptNames(){
  const arr=[];
  USER_DEPTS.forEach(d=>{ if(Array.isArray(d.sub)&&d.sub.length) d.sub.forEach(s=>arr.push(s.name)); else arr.push(d.name); });
  return arr;
}
/* ---- 组织人员：节点操作（启用 / 禁用 / 修改 / 删除） ---- */
function userRerenderOrg(){ const b=document.getElementById('userTabBody'); if(b&&userCurTab==='org') b.innerHTML=userTabBody('org'); }
/* 按名称定位部门，返回 {node, parent}（parent 为 null 表示一级部门） */
function userFindDept(name){
  for(const d of USER_DEPTS){
    if(d.name===name) return {node:d,parent:null};
    if(Array.isArray(d.sub)) for(const s of d.sub){ if(s.name===name) return {node:s,parent:d}; }
  }
  return null;
}
/* 部门下的直属人员（一级部门若有子部门，则统计其子部门人员） */
function userDeptMembers(d){
  if(Array.isArray(d.sub)&&d.sub.length){ const ns=d.sub.map(s=>s.name); return USER_LIST.filter(u=>ns.includes(u.dept)); }
  return USER_LIST.filter(u=>u.dept===d.name);
}
function userSetSt(kind,id,st){
  if(kind==='user'){
    const u=USER_LIST.find(x=>x.acct===id); if(!u) return;
    u.st=st; userRerenderOrg(); showToast('已'+(st==='on'?'启用':'停用')+'用户「'+u.name+'」');
    return;
  }
  const f=userFindDept(id); if(!f) return;
  const d=f.node;
  const subs=Array.isArray(d.sub)?d.sub:[];
  const ms=userDeptMembers(d);
  if(st==='off'){
    // 停用部门：其下子部门与人员一并停用
    const extra=[]; if(subs.length) extra.push(subs.length+' 个子部门'); if(ms.length) extra.push(ms.length+' 名人员');
    const tip=extra.length?`其下 ${extra.join('、')}将一并停用。`:'';
    showConfirm(`确定停用部门「${d.name}」？${tip}`,()=>{
      d.st='off'; subs.forEach(s=>s.st='off'); ms.forEach(u=>u.st='off');
      userRerenderOrg(); showToast('已停用部门「'+d.name+'」');
    });
  } else {
    // 启用部门：仅启用该节点本身，其下成员状态保持不变；若上级已停用则一并恢复
    d.st='on';
    if(f.parent&&f.parent.st==='off') f.parent.st='on';
    userRerenderOrg(); showToast('已启用部门「'+d.name+'」');
  }
}
function userDel(kind,id){
  if(kind==='user'){
    const u=USER_LIST.find(x=>x.acct===id); if(!u) return;
    if(u.src!=='local'){ showToast('系统同步的用户不支持删除'); return; }
    showConfirm(`确定删除用户「${u.name}」？删除后不可恢复。`,()=>{
      const i=USER_LIST.indexOf(u); if(i>=0) USER_LIST.splice(i,1);
      userRerenderOrg(); showToast('已删除用户「'+u.name+'」');
    });
    return;
  }
  const f=userFindDept(id); if(!f) return;
  const d=f.node;
  if(d.src!=='local'){ showToast('系统同步的部门不支持删除'); return; }
  const subs=Array.isArray(d.sub)?d.sub:[];
  const ms=userDeptMembers(d);
  const extra=[]; if(subs.length) extra.push(subs.length+' 个子部门'); if(ms.length) extra.push(ms.length+' 名人员');
  const tip=extra.length?`其下 ${extra.join('、')}将一并删除。`:'';
  showConfirm(`确定删除部门「${d.name}」？${tip}删除后不可恢复。`,()=>{
    const delNames=[d.name,...subs.map(s=>s.name)];
    for(let i=USER_LIST.length-1;i>=0;i--){ if(delNames.includes(USER_LIST[i].dept)) USER_LIST.splice(i,1); }
    if(f.parent){ const k=f.parent.sub.indexOf(d); if(k>=0) f.parent.sub.splice(k,1); }
    else { const k=USER_DEPTS.indexOf(d); if(k>=0) USER_DEPTS.splice(k,1); }
    userRerenderOrg(); showToast('已删除部门「'+d.name+'」');
  });
}
function userEdit(kind,id){
  if(kind==='user'){
    const u=USER_LIST.find(x=>x.acct===id); if(!u) return;
    if(u.src!=='local'){ showToast('系统同步的用户不支持修改'); return; }
    userOpenForm('user',u.acct);
  } else {
    const f=userFindDept(id); if(!f) return;
    if(f.node.src!=='local'){ showToast('系统同步的部门不支持修改'); return; }
    userOpenForm('dept',f.node.name);
  }
}
function userStPill(st){ return st==='on'?'<span class="pill on">已启用</span>':'<span class="pill off">已停用</span>'; }
/* 节点操作按钮：启用（仅已停用节点）/ 禁用（仅已启用节点）/ 修改 + 删除（仅人工新增节点） */
function userNodeActs(kind,id,st,src){
  const q=String(id).replace(/'/g,"\\'");
  const btns=[];
  if(st==='off') btns.push(`<a class="go" title="启用" onclick="event.stopPropagation();userSetSt('${kind}','${q}','on')"><i class="fa-solid fa-circle-play"></i></a>`);
  if(st==='on')  btns.push(`<a title="禁用" onclick="event.stopPropagation();userSetSt('${kind}','${q}','off')"><i class="fa-solid fa-circle-pause"></i></a>`);
  if(src==='local'){
    btns.push(`<a title="修改" onclick="event.stopPropagation();userEdit('${kind}','${q}')"><i class="fa-solid fa-pen-to-square"></i></a>`);
    btns.push(`<a class="del" title="删除" onclick="event.stopPropagation();userDel('${kind}','${q}')"><i class="fa-solid fa-trash-can"></i></a>`);
  }
  return `<span class="act">${btns.join('')}</span>`;
}
function userOrgTreeHtml(){
  const memberHtml=u=>`
    <li class="ot-member${u.st==='off'?' st-off':''}" data-s="${u.name} ${u.acct} ${u.phone}">
      <div class="ph" style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--accent));color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600">${u.name[0]}</div>
      <div style="min-width:0">
        <b>${u.name}</b>
        <div class="mono" style="color:var(--text-3);font-size:11px">${u.acct} · ${u.gender} · ${u.phone}</div>
      </div>
      ${userSrcTag(u.src)}
      <span class="ot-right">${userStPill(u.st)}${userNodeActs('user',u.acct,u.st,u.src)}</span>
    </li>`;
  const subDeptHtml=sd=>{
    const ms=USER_LIST.filter(u=>u.dept===sd.name);
    return `<li class="ot-node ot-sub${sd.st==='off'?' st-off':''}">
      <div class="ot-head" onclick="userToggleNode(this)">
        <i class="ot-caret fa-solid fa-chevron-down"></i>
        <i class="ot-ico fa-solid fa-diagram-project"></i>
        <b>${sd.name}</b>
        <span class="muted" style="font-size:12px">${ms.length} 人</span>
        ${userSrcTag(sd.src)}
        <span class="ot-right">${userStPill(sd.st)}${userNodeActs('dept',sd.name,sd.st,sd.src)}</span>
      </div>
      <ul class="ot-children">${ms.map(memberHtml).join('')}</ul>
    </li>`;
  };
  const deptHtml=d=>{
    const hasSub=Array.isArray(d.sub)&&d.sub.length;
    const subNames=hasSub?d.sub.map(s=>s.name):[];
    const total = hasSub
      ? USER_LIST.filter(u=>subNames.includes(u.dept)).length
      : USER_LIST.filter(u=>u.dept===d.name).length;
    const inner = hasSub
      ? d.sub.map(subDeptHtml).join('')
      : USER_LIST.filter(u=>u.dept===d.name).map(memberHtml).join('');
    return `<li class="ot-node${d.st==='off'?' st-off':''}">
      <div class="ot-head" onclick="userToggleNode(this)">
        <i class="ot-caret fa-solid fa-chevron-down"></i>
        <i class="ot-ico fa-solid fa-sitemap"></i>
        <b>${d.name}</b>
        <span class="muted" style="font-size:12px">${total} 人</span>
        ${userSrcTag(d.src)}
        <span class="ot-right">${userStPill(d.st)}${userNodeActs('dept',d.name,d.st,d.src)}</span>
      </div>
      <ul class="ot-children">${inner}</ul>
    </li>`;
  };
  return `<ul class="org-tree">
    <li class="ot-node">
      <div class="ot-head" onclick="userToggleNode(this)">
        <i class="ot-caret fa-solid fa-chevron-down"></i>
        <i class="ot-ico fa-solid fa-building"></i>
        <b>规划和自然资源局</b>
        <span class="muted" style="font-size:12px">${USER_DEPTS.length} 个部门 · ${USER_LIST.length} 人</span>
        <span class="ot-right"><span class="pill info">组织根节点</span></span>
      </div>
      <ul class="ot-children">${USER_DEPTS.map(deptHtml).join('')}</ul>
    </li>
  </ul>`;
}
function userTabBody(t){
  if(t==='org'){
    return `<div class="tbl-bar">
      <div class="sync-note inline">最近同步：<b>${userSyncTs.org}</b> · 来源：<span class="src">单位权限管理系统</span></div>
      <div class="bar-right">
        <div class="mini-search" style="width:240px"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索部门 / 子部门 / 人员" value="${userKw.org}" oninput="userKw.org=this.value;userOrgSearch()"></div>
        <div class="tbl-acts">
          <button class="btn" onclick="userOpenForm('dept')"><i class="fa-solid fa-folder-plus"></i>新增部门</button>
          <button class="btn" onclick="userOpenForm('user')"><i class="fa-solid fa-user-plus"></i>新增用户</button>
          <button class="btn primary" onclick="userSync('org')"><i class="fa-solid fa-arrows-rotate"></i>同步数据</button>
        </div>
      </div></div>
    <div class="org-tree-wrap">${userOrgTreeHtml()}</div>`;
  }
  return `<div class="tbl-bar">
      <div class="sm-filters">
        <select class="gl-sel" onchange="userAuthStatus=this.value;userAuthSearch()">
          <option value="全部"${userAuthStatus==='全部'?' selected':''}>全部状态</option>
          <option value="已授权"${userAuthStatus==='已授权'?' selected':''}>已授权</option>
          <option value="已撤销"${userAuthStatus==='已撤销'?' selected':''}>已撤销</option>
          <option value="待授权"${userAuthStatus==='待授权'?' selected':''}>待授权</option>
        </select>
      </div>
      <div class="mini-search" style="margin-left:0;width:280px"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="搜索业务域 / 授权对象 / 授权编号" value="${userKw.perm}" oninput="userKw.perm=this.value;userAuthSearch()"></div>
      <div class="tbl-acts"><button class="btn" onclick="userAuthSearch();showToast('已刷新授权记录')"><i class="fa-solid fa-rotate"></i>刷新</button></div>
    </div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>授权编号</th><th>业务域</th><th>域类型</th><th>授权对象</th><th>授权范围</th><th>授权人</th><th>授权时间</th><th>状态</th><th style="width:80px">操作</th></tr></thead>
      <tbody>${USER_AUTH_RECS.map(r=>`<tr>
        <td>${r.id}</td>
        <td><b>${r.domain}</b></td>
        <td><span class="pill ${r.dtype==='业务子域'?'info':'warn'}">${r.dtype}</span></td>
        <td>${r.target}</td>
        <td class="muted">${r.scope}</td>
        <td>${r.granter}</td>
        <td>${r.time}</td>
        <td data-st="${r.status}">${r.status==='已授权'?'<span class="pill on">已授权</span>':r.status==='已撤销'?'<span class="pill off">已撤销</span>':'<span class="pill warn">待授权</span>'}</td>
        <td><a class="lnk" onclick="showToast('查看授权详情（演示）')">查看</a></td>
      </tr>`).join('')}</tbody>
    </table></div>
    <div class="sync-note">授权记录来源于业务域管理模块的授权操作 · 共 ${USER_AUTH_RECS.length} 条</div>`;
}
VIEWS.user=()=>`${ph('用户与权限管理','组织人员（目录树，含部门与子部门） · 权限管理（业务域授权记录查询） · 组织人员支持从单位权限管理系统同步')}
<div class="card">
  <div class="meta-tabs" id="userTabs">
    <button class="mtab${userCurTab==='org'?' on':''}" data-t="org" onclick="userTab('org')"><i class="fa-solid fa-sitemap"></i>&nbsp;组织人员</button>
    <button class="mtab${userCurTab==='perm'?' on':''}" data-t="perm" onclick="userTab('perm')"><i class="fa-solid fa-key"></i>&nbsp;权限管理</button>
  </div>
  <div id="userTabBody">${userTabBody(userCurTab)}</div>
</div>`;

/* ---- 系统参数配置（按分组管理 + 参数 CRUD） ---- */
const SYS_PARAM_GROUPS=['基础运行参数','查询引擎参数','存储与配额'];
const SYS_PARAM_LIST=[
  /* 基础运行参数 */
  { id:'p_sql_timeout', key:'sql_timeout', label:'SQL 执行超时（秒）', value:'30', group:'基础运行参数', icon:'fa-hourglass-half', desc:'单条 SQL 执行超过该时长将被强制中断' },
  { id:'p_max_rows', key:'max_rows', label:'单次查询最大返回行数', value:'10,000', group:'基础运行参数', icon:'fa-table-list', desc:'保护查询性能，防止结果集过大拖垮服务' },
  { id:'p_intent_model', key:'intent_model', label:'意图识别模型', value:'qwen-plus', group:'基础运行参数', icon:'fa-brain', desc:'用于识别用户自然语言问题所属业务意图的模型' },
  { id:'p_sql_model', key:'sql_model', label:'SQL 生成模型', value:'qwen-max', group:'基础运行参数', icon:'fa-code', desc:'用于将业务意图与数据模式转换为可执行 SQL 的模型' },
  { id:'p_rerank_model', key:'rerank_model', label:'样例重排模型', value:'bge-reranker-v2-m3', group:'基础运行参数', icon:'fa-arrow-down-wide-short', desc:'用于对召回样例按相关性进行重排序的模型' },
  /* 查询引擎参数 */
  { id:'p_topk', key:'topk', label:'样例召回 Top-K', value:'5', group:'查询引擎参数', icon:'fa-magnifying-glass', desc:'问题改写后召回的参考样例数量' },
  { id:'p_ctx_turns', key:'ctx_turns', label:'问答上下文轮次上限', value:'20', group:'查询引擎参数', icon:'fa-comments', desc:'多轮对话保留的历史轮次' },
  { id:'p_recall_score', key:'recall_score_threshold', label:'样例召回 score 阈值', value:'0.6', group:'查询引擎参数', icon:'fa-filter', desc:'召回样例与问题的语义相似度低于该阈值时不予采纳' },
  /* 存储与配额 */
  { id:'p_file_quota', key:'file_storage_quota', label:'文件存储空间配额（GB）', value:'50', group:'存储与配额', icon:'fa-file', desc:'用户上传文件的总存储空间上限' },
  { id:'p_spatial_quota', key:'spatial_storage_quota', label:'空间数据服务存储空间配额（GB）', value:'100', group:'存储与配额', icon:'fa-map-location-dot', desc:'空间数据服务相关数据的存储空间上限' },
];
let sysParamCur=SYS_PARAM_GROUPS[0];
let sysParamEditId=null;
function sysParamCommitEdit(){
  if(!sysParamEditId) return;
  const id=sysParamEditId;
  const f=s=>document.querySelector('[data-pid="'+id+'"][data-f="'+s+'"]');
  const p=SYS_PARAM_LIST.find(x=>x.id===id); if(!p){ sysParamEditId=null; return; }
  const c=f('code'),n=f('name'),d=f('desc'),v=f('value');
  if(c) p.key=c.value;
  if(n) p.label=n.value;
  if(d) p.desc=d.value;
  if(v) p.value=v.value;
  p.isNew=false;
  sysParamEditId=null;
}
function sysParamSel(g){ sysParamCommitEdit(); sysParamCur=g; renderView('sysparam'); }
function sysParamFilter(){
  const box=document.getElementById('spSearch'); if(!box) return;
  const kw=box.value.trim().toLowerCase();
  document.querySelectorAll('#spList .param-item').forEach(r=>{
    const hit=(r.dataset.label||'').toLowerCase().includes(kw)||(r.dataset.key||'').toLowerCase().includes(kw);
    r.style.display=hit?'':'none';
  });
}
function sysParamAddGroup(){ document.getElementById('spGroupName').value=''; openModal('spGroupModal'); setTimeout(()=>{ const el=document.getElementById('spGroupName'); if(el) el.focus(); },60); }
function sysParamConfirmGroup(){
  const el=document.getElementById('spGroupName'); const name=(el.value||'').trim();
  if(!name){ showToast('请输入分组名称'); return; }
  if(SYS_PARAM_GROUPS.includes(name)){ showToast('分组「'+name+'」已存在'); return; }
  SYS_PARAM_GROUPS.push(name); sysParamCur=name; closeModal('spGroupModal'); renderView('sysparam');
}
function sysParamDelGroup(g){
  if(!confirm('确认删除分组「'+g+'」？')) return;
  const n=SYS_PARAM_LIST.filter(p=>p.group===g).length;
  if(n>0 && !confirm('该分组下还有 '+n+' 个参数，删除后将一并移除，确认继续？')) return;
  const i=SYS_PARAM_GROUPS.indexOf(g); if(i>=0) SYS_PARAM_GROUPS.splice(i,1);
  for(let j=SYS_PARAM_LIST.length-1;j>=0;j--){ if(SYS_PARAM_LIST[j].group===g) SYS_PARAM_LIST.splice(j,1); }
  if(sysParamCur===g) sysParamCur=SYS_PARAM_GROUPS[0]||'';
  renderView('sysparam');
}
function sysParamAdd(){
  sysParamCommitEdit();
  const id='p_'+Date.now();
  SYS_PARAM_LIST.push({ id, key:'', label:'', value:'', group:sysParamCur, icon:'fa-gear', desc:'', isNew:true });
  sysParamEditId=id; renderView('sysparam'); sysParamGrow();
}
function sysParamDel(id){
  sysParamCommitEdit();
  const i=SYS_PARAM_LIST.findIndex(p=>p.id===id); if(i<0) return;
  SYS_PARAM_LIST.splice(i,1); renderView('sysparam');
}
function sysParamEdit(id){ sysParamCommitEdit(); sysParamEditId=id; renderView('sysparam'); sysParamGrow(); }
function sysParamSaveRow(){ sysParamCommitEdit(); renderView('sysparam'); }
function sysParamCancelEdit(){
  const p=SYS_PARAM_LIST.find(x=>x.id===sysParamEditId);
  if(p && p.isNew){ SYS_PARAM_LIST.splice(SYS_PARAM_LIST.indexOf(p),1); }
  sysParamEditId=null; renderView('sysparam');
}
function sysParamAutoGrow(ta){ if(!ta) return; ta.style.height='auto'; ta.style.height=ta.scrollHeight+'px'; }
function sysParamGrow(){ const ta=document.querySelector('#spList textarea.pi-desc-ta'); if(ta) sysParamAutoGrow(ta); }
VIEWS.sysparam=()=>{
  const params=SYS_PARAM_LIST.filter(p=>p.group===sysParamCur);
  const empty=params.length===0;
  return `
${ph('系统参数配置','按分组维护系统运行参数 · 支持自定义分组与参数增删改查 ',
  '')}
<div class="param-split">
  <div class="param-cats">
    <div class="param-cats-h"><span>参数分组</span><button class="btn" style="height:32px" onclick="sysParamAddGroup()"><i class="fa-solid fa-plus"></i>新增分组</button></div>
    <div class="param-cats-b">
    ${SYS_PARAM_GROUPS.map(g=>{
      const cnt=SYS_PARAM_LIST.filter(p=>p.group===g).length;
      return `
      <div class="param-cat${g===sysParamCur?' on':''}" onclick="sysParamSel('${g}')">
        <i class="fa-solid fa-layer-group pc-gic"></i>
        <span class="pc-name">${g}</span>
        <span class="dr-cnt">${cnt}</span>
        <a class="pc-del" title="删除分组" onclick="event.stopPropagation();sysParamDelGroup('${g.replace(/'/g,"\\'")}')"><i class="fa-solid fa-xmark"></i></a>
      </div>`;
    }).join('')}
    </div>
  </div>
  <div class="param-pane">
    <div class="card">
      <div class="card-h"><h3>${sysParamCur||'未选择分组'} <span class="sub">共 ${params.length} 项</span></h3>
        <div class="head-actions">
          <div class="dict-search" style="width:210px"><i class="fa-solid fa-magnifying-glass"></i><input id="spSearch" placeholder="搜索参数名称 / 编码 / 描述" oninput="sysParamFilter()"></div>
          <button class="btn primary" style="height:34px" onclick="sysParamAdd()"><i class="fa-solid fa-plus"></i>新增参数</button>
        </div>
      </div>
      <div class="card-b">
        ${empty?`<div class="bd-empty">该分组下暂无参数，点击右上角「新增参数」添加。</div>`:''}
        <div id="spList">
        ${params.map(p=>{
          const editing=p.id===sysParamEditId;
          const lbl=((p.label||'')+' '+(p.desc||'')).replace(/"/g,'&quot;');
          return `
          <div class="param-item${editing?' editing':''}" data-label="${lbl}" data-key="${p.key}">
            <div class="pi-ic"><i class="fa-solid ${p.icon||'fa-gear'}"></i></div>
            ${editing?`
            <div class="pi-edit">
              <div class="pi-grid2">
                <div class="pi-f"><label>参数名称</label><input class="di" data-pid="${p.id}" data-f="name" value="${p.label}"></div>
                <div class="pi-f"><label>参数编码</label><input class="di" data-pid="${p.id}" data-f="code" value="${p.key}"></div>
                <div class="pi-f"><label>参数值</label><input class="di" data-pid="${p.id}" data-f="value" value="${p.value}"></div>
                <div class="pi-f pi-f-full"><label>参数描述</label><textarea class="di pi-desc-ta" data-pid="${p.id}" data-f="desc" oninput="sysParamAutoGrow(this)">${p.desc||''}</textarea></div>
              </div>
              <div class="pi-acts">
                <button class="btn primary sm" onclick="sysParamSaveRow()">保存</button>
                <button class="btn sm" onclick="sysParamCancelEdit()">取消</button>
              </div>
            </div>`
            :`
            <div class="pi-body">
              <div class="pi-main">
                <div class="pi-line1">
                  <span class="pi-name">${p.label||'—'}</span>
                  ${p.key?`<span class="pi-code mono">${p.key}</span>`:''}
                </div>
                <div class="pi-line2">${p.desc||'—'}</div>
              </div>
              <div class="pi-val-wrap"><span class="pi-val">${p.value||'—'}</span></div>
              <div class="pi-acts">
                <a title="编辑" onclick="sysParamEdit('${p.id}')"><i class="fa-solid fa-pen"></i></a>
                <a title="删除" onclick="sysParamDel('${p.id}')"><i class="fa-solid fa-trash"></i></a>
              </div>
            </div>`}
          </div>`;
        }).join('')}
        </div>
      </div>
    </div>
  </div>
</div>`;
};

/* ---- 系统字典管理（字典名称与字典项分别配置） ---- */
const DICT_GROUPS=['数据库与查询引擎','AI 与模型','交互与反馈'];
const DICT_LIST=[
  /* ---- 数据库与查询引擎 ---- */
  { id:'d_dbtype', code:'DB_TYPE', name:'数据库类型', group:'数据库与查询引擎', desc:'平台支持接入的数据库引擎类型', items:[
    { code:'mysql', name:'MySQL', sort:1, status:'启用' },
    { code:'postgresql', name:'PostgreSQL', sort:2, status:'启用' },
    { code:'oracle', name:'Oracle', sort:3, status:'启用' },
    { code:'sqlserver', name:'SQL Server', sort:4, status:'启用' },
    { code:'clickhouse', name:'ClickHouse', sort:5, status:'启用' },
    { code:'doris', name:'Apache Doris', sort:6, status:'启用' },
    { code:'hive', name:'Hive', sort:7, status:'启用' },
    { code:'greenplum', name:'Greenplum', sort:8, status:'启用' },
    { code:'oceanbase', name:'OceanBase', sort:9, status:'启用' },
    { code:'polardb', name:'PolarDB', sort:10, status:'启用' },
  ]},
  { id:'d_sqlsample', code:'SQL_SAMPLE_TYPE', name:'SQL样例类型', group:'数据库与查询引擎', desc:'SQL 样例库的分类标签', items:[
    { code:'metric', name:'指标查询', sort:1, status:'启用' },
    { code:'detail', name:'明细查询', sort:2, status:'启用' },
    { code:'agg', name:'聚合统计', sort:3, status:'启用' },
    { code:'yoy', name:'同比环比', sort:4, status:'启用' },
    { code:'topo', name:'拓扑关联', sort:5, status:'启用' },
    { code:'spatial', name:'空间分析', sort:6, status:'启用' },
    { code:'timeseries', name:'时序趋势', sort:7, status:'启用' },
  ]},
  { id:'d_sqlerr', code:'SQL_EXEC_ERR', name:'SQL执行异常类型', group:'数据库与查询引擎', desc:'SQL 执行失败时的异常分类', items:[
    { code:'syntax', name:'语法错误', sort:1, status:'启用' },
    { code:'table_missing', name:'表不存在', sort:2, status:'启用' },
    { code:'column_missing', name:'字段不存在', sort:3, status:'启用' },
    { code:'no_privilege', name:'权限不足', sort:4, status:'启用' },
    { code:'timeout', name:'执行超时', sort:5, status:'启用' },
    { code:'conn_lost', name:'连接断开', sort:6, status:'启用' },
    { code:'deadlock', name:'死锁', sort:7, status:'启用' },
    { code:'type_mismatch', name:'类型不匹配', sort:8, status:'启用' },
  ]},
  /* ---- AI 与模型 ---- */
  { id:'d_model', code:'MODEL_TYPE', name:'模型类型', group:'AI 与模型', desc:'平台使用的 AI 模型能力分类', items:[
    { code:'llm', name:'大语言模型', sort:1, status:'启用' },
    { code:'embed', name:'向量嵌入模型', sort:2, status:'启用' },
    { code:'rerank', name:'重排模型', sort:3, status:'启用' },
    { code:'intent', name:'意图识别模型', sort:4, status:'启用' },
    { code:'ner', name:'实体抽取模型', sort:5, status:'启用' },
    { code:'vision', name:'视觉理解模型', sort:6, status:'启用' },
  ]},
  { id:'d_term', code:'BIZ_TERM_CAT', name:'业务术语分类', group:'AI 与模型', desc:'业务术语库的分类标签', items:[
    { code:'land', name:'用地类', sort:1, status:'启用' },
    { code:'plan', name:'规划类', sort:2, status:'启用' },
    { code:'approve', name:'审批类', sort:3, status:'启用' },
    { code:'register', name:'登记类', sort:4, status:'启用' },
    { code:'survey', name:'测绘类', sort:5, status:'启用' },
    { code:'eco', name:'生态类', sort:6, status:'启用' },
  ]},
  /* ---- 交互与反馈 ---- */
  { id:'d_dislike', code:'DISLIKE_REASON', name:'默认点踩原因', group:'交互与反馈', desc:'问答点踩时的默认反馈原因', items:[
    { code:'off_topic', name:'答非所问', sort:1, status:'启用' },
    { code:'sql_error', name:'SQL 语法错误', sort:2, status:'启用' },
    { code:'inaccurate', name:'结果不准确', sort:3, status:'启用' },
    { code:'stale', name:'数据已过期', sort:4, status:'启用' },
    { code:'wrong_field', name:'字段理解错误', sort:5, status:'启用' },
    { code:'slow', name:'响应太慢', sort:6, status:'启用' },
    { code:'no_basis', name:'未给出依据', sort:7, status:'启用' },
    { code:'other', name:'其他', sort:8, status:'启用' },
  ]},
];
let sysDictCur=DICT_LIST[0].id;
const sysDictCollapsed=new Set();
let sysDictDragFrom=null;
let sysDictItemDragIdx=null, sysDictItemDropIdx=null, sysDictItemAfter=false;
function sysDictSnapshot(){
  const d=DICT_LIST.find(x=>x.id===sysDictCur); if(!d) return;
  const nm=document.querySelector('[data-dname]'); if(nm) d.name=nm.value;
  const dc=document.querySelector('[data-dcode]'); if(dc) d.code=dc.value;
  const ds=document.querySelector('[data-ddesc]'); if(ds) d.desc=ds.value;
  const dg=document.querySelector('[data-dgroup]'); if(dg) d.group=dg.value;
  (d.items||[]).forEach((it,idx)=>{
    const code=document.querySelector('[data-ic="code"][data-i="'+idx+'"]');
    const name=document.querySelector('[data-ic="name"][data-i="'+idx+'"]');
    const st=document.querySelector('[data-ic="status"][data-i="'+idx+'"]');
    if(code) it.code=code.value;
    if(name) it.name=name.value;
    if(st) it.status = st.checked ? '启用' : '停用';
  });
}
function sysDictSel(id){ sysDictSnapshot(); sysDictCur=id; renderView('sysdict'); }
function sysDictAddDict(){
  sysDictSnapshot();
  const n=DICT_LIST.length+1, id='d_new'+n;
  DICT_LIST.push({ id, code:'NEW_DICT'+n, name:'新建字典'+n, desc:'', group:DICT_GROUPS[0]||'未分组', items:[] });
  sysDictCur=id; renderView('sysdict');
}
function sysDictAddItem(){
  sysDictSnapshot();
  const d=DICT_LIST.find(x=>x.id===sysDictCur); if(!d) return;
  const sort=(d.items.length||0)+1;
  d.items.push({ code:'I'+sort, name:'新字典项', sort, status:'启用' });
  renderView('sysdict');
}
function sysDictDelItem(idx){
  sysDictSnapshot();
  const d=DICT_LIST.find(x=>x.id===sysDictCur); if(!d) return;
  d.items.splice(idx,1);
  renderView('sysdict');
}
function sysDictSave(){ sysDictSnapshot(); showToast('系统字典配置已保存'); }
function sysDictAddGroup(){
  sysDictSnapshot();
  const nm=prompt('请输入新分组名称：');
  if(nm===null) return;
  const name=nm.trim();
  if(!name){ showToast('分组名称不能为空'); return; }
  if(DICT_GROUPS.includes(name)){ showToast('分组「'+name+'」已存在'); return; }
  DICT_GROUPS.push(name);
  renderView('sysdict');
}
function sysDictDelGroup(g){
  sysDictSnapshot();
  const cnt=DICT_LIST.filter(d=>d.group===g).length;
  const tip=cnt>0?('该分组下还有 '+cnt+' 个字典，删除后其字典项将一并移除，确定删除？'):'确定删除该分组？';
  if(!confirm(tip)) return;
  for(let i=DICT_LIST.length-1;i>=0;i--){ if(DICT_LIST[i].group===g) DICT_LIST.splice(i,1); }
  DICT_GROUPS.splice(DICT_GROUPS.indexOf(g),1);
  if(!DICT_LIST.some(d=>d.id===sysDictCur)) sysDictCur=DICT_LIST[0]?DICT_LIST[0].id:'';
  renderView('sysdict');
}
function sysDictSetGroup(){ sysDictSnapshot(); renderView('sysdict'); }
function sysDictToggleGroup(g){
  if(sysDictCollapsed.has(g)) sysDictCollapsed.delete(g); else sysDictCollapsed.add(g);
  renderView('sysdict');
}
/* ---- 字典拖拽换组 ---- */
function sysDictDragStart(id,e){
  sysDictDragFrom=id;
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain',id);
  const row=e.currentTarget; if(row) row.classList.add('dragging');
}
function sysDictDragEnd(e){
  document.querySelectorAll('#ddList .dict-row.dragging').forEach(r=>r.classList.remove('dragging'));
  document.querySelectorAll('#ddList .dict-grp-body.drag-over').forEach(b=>b.classList.remove('drag-over'));
  sysDictDragFrom=null;
}
function sysDictDragOver(e){
  e.preventDefault();
  document.querySelectorAll('#ddList .dict-grp-body.drag-over').forEach(b=>{ if(b!==e.currentTarget) b.classList.remove('drag-over'); });
  const body=e.currentTarget;
  if(body && body.classList.contains('dict-grp-body')) body.classList.add('drag-over');
}
function sysDictDropTo(g,e){
  e.preventDefault();
  const id=sysDictDragFrom||(e.dataTransfer&&e.dataTransfer.getData('text/plain'));
  document.querySelectorAll('#ddList .dict-grp-body.drag-over').forEach(b=>b.classList.remove('drag-over'));
  if(!id) return;
  const d=DICT_LIST.find(x=>x.id===id); if(!d) return;
  d.group=g;
  sysDictDragFrom=null;
  renderView('sysdict');
}
/* ---- 字典项拖拽排序 ---- */
function sysDictItemDrag(idx,e){
  sysDictItemDragIdx=idx;
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain',String(idx));
  const tr=e.currentTarget; if(tr) tr.classList.add('dragging');
}
function sysDictItemOver(idx,e){
  e.preventDefault();
  sysDictItemDropIdx=idx;
  const rect=e.currentTarget.getBoundingClientRect();
  sysDictItemAfter=e.clientY>rect.top+rect.height/2;
  document.querySelectorAll('.di-row.drop-before,.di-row.drop-after').forEach(r=>r.classList.remove('drop-before','drop-after'));
  e.currentTarget.classList.add(sysDictItemAfter?'drop-after':'drop-before');
}
function sysDictItemDrop(idx,e){
  e.preventDefault();
  const from=sysDictItemDragIdx;
  document.querySelectorAll('.di-row.dragging').forEach(r=>r.classList.remove('dragging'));
  document.querySelectorAll('.di-row.drop-before,.di-row.drop-after').forEach(r=>r.classList.remove('drop-before','drop-after'));
  if(from===null||from===undefined) return;
  const d=DICT_LIST.find(x=>x.id===sysDictCur); if(!d) return;
  const items=d.items;
  if(!items||!items.length) return;
  const moved=items.splice(from,1)[0];
  let to=(sysDictItemDropIdx===null?items.length:sysDictItemDropIdx)+(sysDictItemAfter?1:0);
  if(from<to) to--;
  if(to<0) to=0; if(to>items.length) to=items.length;
  items.splice(to,0,moved);
  items.forEach((it,i)=>it.sort=i+1);
  sysDictItemDragIdx=null; sysDictItemDropIdx=null;
  renderView('sysdict');
}
function sysDictItemEnd(e){
  document.querySelectorAll('.di-row.dragging').forEach(r=>r.classList.remove('dragging'));
  document.querySelectorAll('.di-row.drop-before,.di-row.drop-after').forEach(r=>r.classList.remove('drop-before','drop-after'));
  sysDictItemDragIdx=null; sysDictItemDropIdx=null;
}
function sysDictFilter(){
  const box=document.getElementById('ddSearch'); if(!box) return;
  const kw=box.value.trim().toLowerCase();
  document.querySelectorAll('#ddList .dict-grp').forEach(grp=>{
    const rows=grp.querySelectorAll('.dict-row');
    let any=false;
    rows.forEach(r=>{
      const hit=(r.dataset.name||'').toLowerCase().includes(kw)||(r.dataset.code||'').toLowerCase().includes(kw);
      r.style.display=hit?'':'none';
      if(hit) any=true;
    });
    grp.style.display=any?'':'none';
  });
}
VIEWS.sysdict=()=>{
  const cur=DICT_LIST.find(x=>x.id===sysDictCur)||DICT_LIST[0];
  return `
${ph('系统字典管理','字典名称与字典项分别维护 · 统一管理平台枚举值 ')}
<div class="dict-split">
  <div class="dict-list">
    <div class="dict-list-h"><span>字典清单</span>
      <div class="dict-h-acts">
        <button class="btn" style="height:32px" onclick="sysDictAddGroup()"><i class="fa-solid fa-folder-plus"></i>新增分组</button>
        <button class="btn" style="height:32px" onclick="sysDictAddDict()"><i class="fa-solid fa-plus"></i>新增字典</button>
      </div>
    </div>
    <div class="dict-search"><i class="fa-solid fa-magnifying-glass"></i><input id="ddSearch" placeholder="按名称 / 编码搜索" oninput="sysDictFilter()"></div>
    <div class="dict-list-b" id="ddList">
    ${DICT_GROUPS.map(g=>`
      <div class="dict-grp${sysDictCollapsed.has(g)?' collapsed':''}" data-group="${g}">
        <div class="dict-group" onclick="sysDictToggleGroup('${g}')">
          <span><i class="dg-caret fa-solid fa-chevron-down"></i>${g}</span>
          <span class="dg-count">${DICT_LIST.filter(d=>d.group===g).length} 项</span>
          <a class="dg-del" title="删除分组" onclick="event.stopPropagation();sysDictDelGroup('${g}')"><i class="fa-solid fa-xmark"></i></a>
        </div>
        <div class="dict-grp-body" ondragover="sysDictDragOver(event)" ondrop="sysDictDropTo('${g}',event)">
          ${DICT_LIST.filter(d=>d.group===g).map(d=>`
          <div class="dict-row${d.id===sysDictCur?' on':''}" draggable="true" data-id="${d.id}" data-name="${d.name}" data-code="${d.code}" onclick="sysDictSel('${d.id}')"
            ondragstart="sysDictDragStart('${d.id}',event)" ondragend="sysDictDragEnd(event)">
            <i class="dr-grip fa-solid fa-grip-vertical"></i>
            <div><div class="dr-name">${d.name}</div><div class="dr-code">${d.code}</div></div>
            <span class="dr-cnt">${(d.items||[]).length} 项</span>
          </div>`).join('')}
          ${DICT_LIST.filter(d=>d.group===g).length===0?'<div class="dg-empty">拖拽字典到此处</div>':''}
        </div>
      </div>
    `).join('')}
    </div>
  </div>
  <div class="dict-detail">
    <div class="card"><div class="card-h"><h3>字典配置 · <span style="color:var(--accent)">${cur.name}</span></h3></div>
    <div class="card-b">
      <div class="dict-sec">
        <div class="dict-sec-h"><i class="fa-solid fa-tag"></i>字典名称配置</div>
        <div class="form-grid dict-name-grid">
          <div class="form-field"><label>所属分组</label><select class="di" data-dgroup onchange="sysDictSetGroup()">${[...new Set([cur.group,...DICT_GROUPS])].filter(Boolean).map(g=>`<option${g===cur.group?' selected':''}>${g}</option>`).join('')}</select></div>
          <div class="form-field"><label>字典名称</label><input data-dname value="${cur.name}"></div>
          <div class="form-field"><label>字典编码</label><input class="mono" data-dcode value="${cur.code}"></div>
        </div>
        <div class="form-field" style="margin-top:12px"><label>字典说明</label><textarea data-ddesc rows="2" style="resize:vertical">${cur.desc||''}</textarea></div>
      </div>
      <div class="dict-sec">
        <div class="dict-sec-h"><i class="fa-solid fa-list-ol"></i>字典项配置 <span class="sub">共 ${(cur.items||[]).length} 项</span>
          <button class="btn" style="height:32px;margin-left:auto" onclick="sysDictAddItem()"><i class="fa-solid fa-plus"></i>新增字典项</button></div>
        ${(cur.items&&cur.items.length)?`
        <div class="tbl-wrap"><table>
          <thead><tr><th style="width:34px"></th><th>项编码</th><th>项名称</th><th style="width:96px">状态</th><th style="width:70px">操作</th></tr></thead>
          <tbody>
            ${cur.items.map((it,idx)=>`<tr class="di-row" ondragover="sysDictItemOver(${idx},event)" ondrop="sysDictItemDrop(${idx},event)">
              <td class="di-grip" draggable="true" ondragstart="sysDictItemDrag(${idx},event)" ondragend="sysDictItemEnd(event)" title="拖拽调整顺序"><i class="fa-solid fa-grip-vertical"></i></td>
              <td><input class="di" data-ic="code" data-i="${idx}" value="${it.code}"></td>
              <td><input class="di" data-ic="name" data-i="${idx}" value="${it.name}"></td>
              <td><label class="sw-toggle"><input type="checkbox" data-ic="status" data-i="${idx}" ${it.status==='启用'?'checked':''}><span class="sw-track"><span class="sw-thumb"></span></span></label></td>
              <td><div class="act"><a title="删除" onclick="sysDictDelItem(${idx})"><i class="fa-solid fa-trash"></i></a></div></td>
            </tr>`).join('')}
          </tbody>
        </table></div>`:`<div class="bd-empty">该字典暂未配置字典项，点击右上角「新增字典项」添加枚举值。</div>`}
      </div>
    </div>
    <div class="card-foot">
      <button class="btn primary" onclick="sysDictSave()"><i class="fa-solid fa-floppy-disk"></i>保存配置</button>
    </div>
  </div>
  </div>
</div>`;
};

/* ---- 日志审计 ---- */
const LOG_QA=[
  {app:'综合演示助手', title:'各区已审批用地面积统计', q:'2026年各区已审批用地面积统计', turns:6, up:3, down:0, user:'演示用户13', dept:'演示部门03', created:'2026-08-10 09:46:12', updated:'2026-08-10 10:12:05'},
  {app:'不动产智查', title:'高新区不动产抵押登记查询', q:'查询高新区不动产抵押登记情况', turns:3, up:1, down:1, user:'演示用户17', dept:'演示部门01', created:'2026-08-10 09:44:08', updated:'2026-08-10 09:50:33'},
  {app:'测绘分析', title:'地质灾害隐患点空间分析', q:'最近地质灾害隐患点空间分析', turns:5, up:2, down:0, user:'演示用户21', dept:'演示部门14', created:'2026-08-10 09:41:55', updated:'2026-08-10 09:58:41'},
  {app:'审批辅助', title:'各街道人口密度排名分析', q:'各街道人口密度排名', turns:2, up:0, down:2, user:'演示用户25', dept:'演示部门17', created:'2026-08-10 09:38:20', updated:'2026-08-10 09:39:10'},
  {app:'耕地卫士', title:'耕地占补平衡趋势分析', q:'近三年耕地占补平衡趋势', turns:4, up:5, down:0, user:'演示用户13', dept:'演示部门03', created:'2026-08-10 09:35:11', updated:'2026-08-10 09:52:27'},
];
const LOG_OP=[
  {module:'数据源管理', func:'新增数据源', note:'新增「规划审批库」PostgreSQL 连接', ip:'192.0.2.2', user:'演示用户13', dept:'演示部门03', time:'2026-08-10 09:30:14'},
  {module:'元数据管理', func:'编辑元数据', note:'修正 demo_t_estate_reg 字段注释与口径', ip:'192.0.2.3', user:'演示用户17', dept:'演示部门01', time:'2026-08-10 09:22:47'},
  {module:'业务域管理', func:'创建业务域', note:'创建「海洋资源」业务域并绑定数据源', ip:'192.0.2.4', user:'演示用户22', dept:'演示部门15', time:'2026-08-10 09:15:02'},
  {module:'SQL样例管理', func:'新增样例', note:'新增「占补平衡台账」查询样例', ip:'192.0.2.2', user:'演示用户35', dept:'演示部门21', time:'2026-08-10 08:58:36'},
  {module:'权限授权', func:'业务域授权', note:'为综合演示助手授权「国土空间规划」业务域', ip:'192.0.2.1', user:'管理员', dept:'系统管理', time:'2026-08-10 08:40:09'},
];
const LOG_DA=[
  {q:'2026年各区已审批用地面积统计', rw:'按行政区统计 2026 年已审批建设用地面积，关联 demo_t_approval_project 并按区县分组汇总', obj:'demo_t_approval_project', result:'成功，返回 36 行（12 个区县年度审批面积汇总）', rows:36, user:'演示用户13', dept:'演示部门03', time:'2026-08-10 09:46:12',
   sql:"SELECT district, SUM(approve_area) AS area\nFROM demo_t_approval_project\nWHERE YEAR(approve_date)=2026\nGROUP BY district\nORDER BY area DESC;"},
  {q:'查询高新区不动产抵押登记情况', rw:'筛选高新区且登记类型为抵押的不动产记录，关联产权人信息', obj:'demo_t_mortgage', result:'成功，返回 128 行（高新区抵押登记明细）', rows:128, user:'演示用户17', dept:'演示部门01', time:'2026-08-10 09:44:08',
   sql:"SELECT a.*, b.owner_name\nFROM demo_t_mortgage a\nLEFT JOIN demo_t_owner b ON a.owner_id=b.id\nWHERE a.region='高新区' AND a.reg_type='抵押登记';"},
  {q:'最近地质灾害隐患点空间分析', rw:'提取风险等级高于阈值的隐患点并输出经纬度与范围', obj:'demo_v_survey_summary', result:'成功，返回 24 行（高危隐患点清单）', rows:24, user:'演示用户21', dept:'演示部门14', time:'2026-08-10 09:41:55',
   sql:"SELECT point_id, lng, lat, risk_level\nFROM demo_v_survey_summary\nWHERE risk_level >= 3\nORDER BY risk_level DESC;"},
  {q:'各街道人口密度排名', rw:'按街道计算人口密度并降序排列（依赖 density 字段）', obj:'demo_t_land_parcel', result:'查询失败：字段 density 不存在，已记录异常', rows:0, user:'演示用户25', dept:'演示部门17', time:'2026-08-10 09:38:20',
   sql:"SELECT street, population/area AS density\nFROM demo_t_land_parcel\nORDER BY density DESC;  -- 错误: 字段 density 不存在"},
  {q:'近三年耕地占补平衡趋势', rw:'筛选 2023 年及以后耕地占补平衡台账，按年份输出结余趋势', obj:'demo_v_farmland_index', result:'成功，返回 9 行（三年占补平衡结余）', rows:9, user:'演示用户13', dept:'演示部门03', time:'2026-08-10 09:35:11',
   sql:"SELECT year, SUM(balance) AS balance\nFROM demo_v_farmland_index\nWHERE year >= 2023\nGROUP BY year\nORDER BY year;"},
];
VIEWS.logs=()=>`
${ph('日志审计','问答历史 · 用户操作 · 数据访问 ')}
<div class="card">
  <div class="tbl-bar">
    <div class="log-nav">
      <span class="chip active" onclick="logTab('qa',this)">问答历史</span>
      <span class="chip" onclick="logTab('op',this)">用户操作</span>
      <span class="chip" onclick="logTab('da',this)">数据访问</span>
    </div>
    <div class="mini-search"><i class="fa-solid fa-magnifying-glass"></i><input placeholder="按用户 / 业务应用 / 关键词检索"></div>
    <div class="tbl-acts"><button class="btn"><i class="fa-solid fa-calendar"></i>时间范围</button><button class="btn primary"><i class="fa-solid fa-download"></i>导出数据</button></div>
  </div>
  <div class="tbl-wrap" id="logQaTbl"><table>
    <thead><tr>
      <th style="width:54px">序号</th>
      <th style="width:96px">业务应用</th>
      <th style="width:152px">对话标题</th>
      <th style="width:200px">首轮提问</th>
      <th style="width:64px">对话轮数</th>
      <th style="width:104px">点赞 / 点踩</th>
      <th style="width:72px">用户</th>
      <th style="width:124px">所属部门</th>
      <th style="width:138px">对话创建时间</th>
      <th style="width:138px">最近更新时间</th>
      <th style="width:64px">操作</th>
    </tr></thead>
    <tbody>
      ${LOG_QA.map((r,i)=>`<tr>
        <td class="mono" style="color:var(--text-3)">${i+1}</td>
        <td><span class="pill info">${r.app}</span></td>
        <td>${r.title}</td>
        <td><span class="qa-q" title="${r.q}">${r.q}</span></td>
        <td class="mono" style="text-align:center">${r.turns}</td>
        <td class="fb-num">${r.up?`<span class="up">${r.up}</span>`:`<span class="zero">0</span>`}<span class="sep"> / </span>${r.down?`<span class="down">${r.down}</span>`:`<span class="zero">0</span>`}</td>
        <td>${r.user}</td><td>${r.dept}</td>
        <td class="mono" style="color:var(--text-3);font-size:12px">${r.created}</td>
        <td class="mono" style="color:var(--text-3);font-size:12px">${r.updated}</td>
        <td><div class="act"><a onclick="logQaView(${i})" title="查看对话过程"><i class="fa-solid fa-comments"></i></a></div></td>
      </tr>`).join('')}
    </tbody>
  </table></div>
  <div class="tbl-wrap" id="logOpTbl" style="display:none"><table>
    <thead><tr>
      <th style="width:56px">序号</th><th style="width:108px">操作模块</th><th style="width:104px">操作功能</th><th>备注</th><th style="width:84px">用户</th><th style="width:140px">所属部门</th><th style="width:172px">操作时间</th><th style="width:140px">设备地址</th>
    </tr></thead>
    <tbody>
      ${LOG_OP.map((r,i)=>`<tr>
        <td class="mono" style="color:var(--text-3)">${i+1}</td>
        <td>${r.module}</td><td>${r.func}</td>
        <td style="color:var(--text-2)">${r.note}</td>
        <td>${r.user}</td><td>${r.dept}</td>
        <td class="mono nowrap" style="color:var(--text-3);font-size:12px">${r.time}</td>
        <td class="mono" style="color:var(--text-3);font-size:12px">${r.ip}</td>
      </tr>`).join('')}
    </tbody>
  </table></div>
  <div class="tbl-wrap" id="logDaTbl" style="display:none"><table>
    <thead><tr>
      <th style="width:54px">序号</th><th style="width:170px">原始问题</th><th style="width:200px">改写问题</th>
      <th style="width:128px">数据对象</th><th style="width:84px">查询状态</th>
      <th style="width:84px">返回数据行数</th><th style="width:72px">用户</th><th style="width:124px">所属部门</th>
      <th style="width:150px">访问时间</th><th style="width:64px">操作</th>
    </tr></thead>
    <tbody>
      ${LOG_DA.map((r,i)=>{ const ok=r.rows>0; return `<tr>
        <td class="mono" style="color:var(--text-3)">${i+1}</td>
        <td><span class="qa-q" title="${r.q}">${r.q}</span></td>
        <td><span class="qa-q" title="${r.rw}">${r.rw}</span></td>
        <td class="mono" style="font-size:12.5px">${r.obj}</td>
        <td>${ok?'<span class="pill on">成功</span>':'<span class="pill err">失败</span>'}</td>
        <td class="mono" style="text-align:center">${r.rows}</td>
        <td>${r.user}</td><td>${r.dept}</td>
        <td class="mono" style="color:var(--text-3);font-size:12px">${r.time}</td>
        <td><div class="act"><a onclick="logSqlView(${i})" title="查看SQL"><i class="fa-solid fa-code"></i></a></div></td>
      </tr>`; }).join('')}
    </tbody>
  </table></div>
  <div class="pager"><span>共 18,642 条</span><a>‹</a><a class="on">1</a><a>2</a><a>3</a><a>…</a><a>›</a></div>
</div>`;
function logTab(name,el){
  document.querySelectorAll('.log-nav .chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  const map={qa:'logQaTbl',op:'logOpTbl',da:'logDaTbl'};
  Object.values(map).forEach(id=>{ const e=document.getElementById(id); if(e) e.style.display='none'; });
  const t=document.getElementById(map[name]); if(t) t.style.display='';
}
function logQaView(i){
  const r=LOG_QA[i]; if(!r) return;
  const body=document.getElementById('logQaBody'); if(!body) return;
  const turns=Math.max(1,r.turns);
  const userMsgs=[r.q,'能否按月维度拆分汇总？','再对比去年同期数据','导出为 Excel 表格','把结果同步给相关科室'];
  const aiMsgs=[
    `已基于「${r.app}」关联业务域生成查询，命中 ${12+r.up+r.down} 条记录并生成可视化图表。`,
    '已按月份重新聚合，生成 12 个月趋势数据。',
    '已拉取去年同期数据并完成同比计算，差异已标注。',
    `已生成 Excel 导出文件（${r.app}_问答明细.xlsx）。`,
    '已通过站内消息将结果推送至相关科室成员。',
  ];
  let html=`<div class="qa-meta">
    <span><b>业务应用</b>${r.app}</span>
    <span><b>用户</b>${r.user}（${r.dept}）</span>
    <span><b>对话轮数</b>${r.turns}</span>
    <span><b>创建时间</b>${r.created}</span>
    <span><b>最近更新</b>${r.updated}</span>
  </div><div class="qa-thread">`;
  for(let k=0;k<turns;k++){
    const u=userMsgs[k]||userMsgs[userMsgs.length-1];
    const a=aiMsgs[k]||aiMsgs[aiMsgs.length-1];
    html+=`<div class="qa-msg user"><div class="av">${r.user.slice(0,1)}</div><div><div class="qa-name">${r.user} · 用户</div><div class="qa-bubble">${u}</div></div></div>`;
    html+=`<div class="qa-msg ai"><div class="av"><i class="fa-solid fa-robot"></i></div><div><div class="qa-name">${r.app} · 智能助手</div><div class="qa-bubble">${a}</div></div></div>`;
  }
  html+=`</div>`;
  body.innerHTML=html;
  const t=document.getElementById('logQaTitle'); if(t) t.textContent='对话过程详情 · '+r.app;
  openModal('logQaModal');
}
function logSqlView(i){
  const r=LOG_DA[i]; if(!r) return;
  const body=document.getElementById('logSqlBody'); if(!body) return;
  const ok=r.rows>0;
  let html=`<div class="sql-meta">
    <span><b>原始问题</b>${escHtml(r.q)}</span>
    <span><b>改写问题</b>${escHtml(r.rw)}</span>
    <span><b>数据对象</b><span class="mono" style="font-size:12.5px">${escHtml(r.obj)}</span></span>
    <span><b>返回行数</b>${r.rows}</span>
    <span><b>状态</b><span class="pill ${ok?'on':'err'}">${ok?'成功':'失败'}</span></span>
  </div>
  <div class="sql-block">
    <div class="sql-block-h"><i class="fa-solid fa-code"></i>改写后执行 SQL<span class="sql-obj">${escHtml(r.obj)}</span></div>
    <pre class="sql-pre">${escHtml(r.sql)}</pre>
  </div>`;
  body.innerHTML=html;
  const t=document.getElementById('logSqlTitle'); if(t) t.textContent='查看SQL · '+r.obj;
  openModal('logSqlModal');
}

/* ---- 统计分析 ---- */
VIEWS.stats=()=>`
${ph('统计分析','运营指标 · 用户使用趋势 · SQL 样例命中 · Text-to-SQL 质量分析 ',
  '<button class="btn"><i class="fa-solid fa-calendar"></i>近 30 天</button><button class="btn primary"><i class="fa-solid fa-download"></i>导出</button>')}
<div class="kpi-grid kpi-side-on">
  <div class="kpi blue"><div class="kpi-main"><div class="ic blue"><i class="fa-solid fa-users"></i></div><div class="lbl">累计用户量</div><div class="val">8,642</div></div><div class="kpi-side"><span class="side-lbl">近一月</span><b class="side-val">8,120</b></div></div>
  <div class="kpi cyan"><div class="kpi-main"><div class="ic cyan"><i class="fa-solid fa-user-group"></i></div><div class="lbl">活跃用户量</div><div class="val">1,532</div></div><div class="kpi-side"><span class="side-lbl">近一月新增用户</span><b class="side-val">186</b></div></div>
  <div class="kpi green"><div class="kpi-main"><div class="ic green"><i class="fa-solid fa-magnifying-glass-chart"></i></div><div class="lbl">累计查询量</div><div class="val">386k</div></div><div class="kpi-side"><span class="side-lbl">近一月</span><b class="side-val">34.2k</b></div></div>
  <div class="kpi purple"><div class="kpi-main"><div class="ic purple"><i class="fa-solid fa-check-double"></i></div><div class="lbl">查询成功率</div><div class="val">96.3%</div></div><div class="kpi-side"><span class="side-lbl">近一月</span><b class="side-val">95.1%</b></div></div>
  <div class="kpi orange"><div class="kpi-main"><div class="ic orange"><i class="fa-solid fa-code"></i></div><div class="lbl">SQL生成执行量</div><div class="val">358,420</div></div><div class="kpi-side"><span class="side-lbl">近一月</span><b class="side-val">31,540</b></div></div>
  <div class="kpi green"><div class="kpi-main"><div class="ic green"><i class="fa-solid fa-circle-check"></i></div><div class="lbl">SQL执行成功率</div><div class="val">94.7%</div></div><div class="kpi-side"><span class="side-lbl">近一月</span><b class="side-val">93.8%</b></div></div>
  <div class="kpi red"><div class="kpi-main"><div class="ic red"><i class="fa-solid fa-file-csv"></i></div><div class="lbl">生成数据文件量</div><div class="val">12,847</div></div><div class="kpi-side"><span class="side-lbl">近一月</span><b class="side-val">1,186</b></div></div>
  <div class="kpi blue"><div class="kpi-main"><div class="ic blue"><i class="fa-solid fa-chart-pie"></i></div><div class="lbl">生成图形服务量</div><div class="val">3,592</div></div><div class="kpi-side"><span class="side-lbl">近一月</span><b class="side-val">342</b></div></div>
</div>
<div class="grid-2">
  <div class="card"><div class="card-h"><h3>用户使用趋势 <span class="sub">活跃用户 · 查询量</span></h3></div><div class="card-b"><canvas id="chStat1" height="120"></canvas></div></div>
  <div class="card"><div class="card-h"><h3>Text-to-SQL 质量分析 <span class="sub">SQL执行量 / 执行异常量 / 用户点踩量</span></h3></div><div class="card-b"><canvas id="chStat2" height="120"></canvas>
    <div class="legend"><span><i style="background:#4f8cff"></i>SQL执行量</span><span><i style="background:#ef4444"></i>执行异常量</span><span><i style="background:#a78bfa"></i>用户点踩量</span></div></div></div>
</div>
<div class="card"><div class="card-h"><h3>业务域查询热度排行 <span class="sub">累计查询次数</span></h3></div><div class="card-b">
  ${(()=>{const d=[['用地审批',18642],['不动产登记',16205],['国土空间规划',14038],['耕地保护',10127],['测绘地理信息',7684],['执法监察',5210]];const mx=Math.max(...d.map(x=>x[1]));return d.map(r=>`<div style="display:flex;align-items:center;gap:14px;margin-bottom:13px"><span style="width:110px;font-size:13px">${r[0]}</span><div class="bar" style="flex:1"><i style="width:${Math.round(r[1]/mx*100)}%"></i></div><b style="width:92px;text-align:right">${r[1].toLocaleString()} 次</b></div>`).join('');})()}
</div></div>`;

/* ---- 占位（后续细化） ---- */
VIEWS.soon=()=>`<div class="card"><div class="empty-soon"><i class="fa-solid fa-screwdriver-wrench"></i>该模块功能设计将在后续迭代中细化补充</div></div>`;

/* ================= 图表初始化 ================= */
function chartColors(){
  const cs=getComputedStyle(document.documentElement);
  const grid=cs.getPropertyValue('--divider').trim();
  const text=cs.getPropertyValue('--text-3').trim();
  return {grid,text};
}
function initDashCharts(){
  const tEl=document.getElementById('chTrend'), iEl=document.getElementById('chIntent');
  if(!tEl && !iEl) return;   // 我的主页已不渲染看板图表，安全跳过
  const {grid,text}=chartColors();
  Chart.defaults.color=text; Chart.defaults.font.family='PingFang SC,Microsoft YaHei,sans-serif';
  const days=Array.from({length:14},(_,i)=>`7/${11+i}`);
  if(tEl) new Chart(tEl,{type:'line',data:{labels:days,datasets:[
    {label:'问答量',data:[820,932,901,1290,1330,1120,1450,1380,1520,1610,1490,1720,1680,1846],borderColor:'#4f8cff',backgroundColor:'rgba(79,140,255,.12)',fill:true,tension:.4,yAxisID:'y',pointRadius:0,borderWidth:2.5},
    {label:'成功率',data:[89,90,88,91,92,90,93,92,94,93,94,95,94,94.7],borderColor:'#22c55e',backgroundColor:'transparent',tension:.4,yAxisID:'y1',pointRadius:0,borderWidth:2.5}
  ]},options:cOpts(grid,{y:{grid:{color:grid}},y1:{position:'right',min:80,max:100,grid:{drawOnChartArea:false}},x:{grid:{color:grid}}})});
  if(iEl) new Chart(iEl,{type:'doughnut',data:{labels:['指标查询','明细查询','趋势分析','空间分析','其他'],datasets:[{data:[38,26,19,11,6],backgroundColor:['#4f8cff','#22d3ee','#22c55e','#a78bfa','#f59e0b'],borderWidth:0}]},options:{cutout:'66%',plugins:{legend:{display:false}},maintainAspectRatio:true}});
}
function initStatCharts(){
  const {grid,text}=chartColors();
  Chart.defaults.color=text;
  const days=Array.from({length:12},(_,i)=>`第${i+1}周`);
  new Chart(document.getElementById('chStat1'),{type:'bar',data:{labels:days,datasets:[
    {label:'查询量(k)',data:[24,28,26,32,35,31,38,42,40,45,48,52],backgroundColor:'rgba(79,140,255,.65)',borderRadius:5,yAxisID:'y'},
    {label:'活跃用户',type:'line',data:[820,880,910,1020,1150,1080,1240,1320,1290,1410,1480,1532],borderColor:'#22d3ee',tension:.4,pointRadius:0,borderWidth:2.5,yAxisID:'y1'}
  ]},options:cOpts(grid,{y:{grid:{color:grid}},y1:{position:'right',grid:{drawOnChartArea:false}},x:{grid:{display:false}}})});
  new Chart(document.getElementById('chStat2'),{type:'line',data:{labels:['1月','2月','3月','4月','5月','6月','7月'],datasets:[
    {label:'SQL执行量',data:[21200,23500,24800,27600,28900,31200,35800],borderColor:'#4f8cff',backgroundColor:'rgba(79,140,255,.08)',fill:true,tension:.4,pointRadius:0,borderWidth:2.5},
    {label:'执行异常量',data:[820,760,910,840,780,690,640],borderColor:'#ef4444',backgroundColor:'transparent',tension:.4,pointRadius:0,borderWidth:2.5},
    {label:'用户点踩量',data:[120,145,110,98,102,86,72],borderColor:'#a78bfa',backgroundColor:'transparent',tension:.4,pointRadius:0,borderWidth:2.5}
  ]},options:cOpts(grid,{y:{grid:{color:grid}},x:{grid:{display:false}}})});
}
function cOpts(grid,scales){return{responsive:true,maintainAspectRatio:true,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(20,26,40,.92)',padding:10,cornerRadius:8}},scales};}

/* ---------- 弹窗 ---------- */
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function autoResize(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,320)+'px'; }
function toggleClear(){
  const el=document.getElementById('smartInput');
  const btn=document.getElementById('spClear');
  if(el && btn) btn.classList.toggle('show', el.value.trim().length>0);
}
function clearSmartInput(){
  const el=document.getElementById('smartInput');
  if(el){ el.value=''; el.style.height='auto'; toggleClear(); }
}
function parseSmartInput(){
  const txt=document.getElementById('smartInput').value.trim();
  if(!txt){ alert('请先粘贴数据库连接串或键值对描述'); return; }
  // 占位解析逻辑：仅作演示
  const jdbc=txt.match(/jdbc:(\w+):\/\/([^\/]+)(?:\/(\S+))?/i);
  if(jdbc){ document.getElementById('dbHost').value=jdbc[2]||''; document.getElementById('dbName').value=jdbc[3]||''; }
  const host=txt.match(/(?:数据库地址|地址|host|hostname)[:：]\s*(\S+)/i);
  const port=txt.match(/(?:端口|port)[:：]\s*(\d+)/i);
  const db=txt.match(/(?:数据库名|数据库|库名|database|db)[:：]\s*(\S+)/i);
  const user=txt.match(/(?:用户名|账号|账号名|user)[:：]\s*(\S+)/i);
  const pwd=txt.match(/(?:密码|passwd|password)[:：]\s*(\S+)/i);
  if(host){ document.getElementById('dbHost').value=(port?host[1]+':'+port[1]:host[1]); }
  if(db){ document.getElementById('dbName').value=db[1]; }
  if(user){ document.getElementById('dbUser').value=user[1]; }
  if(pwd){ document.getElementById('dbPwd').value=pwd[1]; }
  alert('已尝试智能识别，请核对并补充信息。');
}
function saveDatasource(){
  const fields=['dbSrcName','dbUser','dbPwd'];
  const empty=fields.find(id=>!document.getElementById(id).value.trim());
  if(empty){ alert('请填写所有必填项'); return; }
  if(dsEditIdx>=0){
    DS_LIST[dsEditIdx].name=document.getElementById('dbSrcName').value.trim();
    DS_LIST[dsEditIdx].acct=document.getElementById('dbUser').value.trim();
    renderView('datasource');
  }
  alert('数据源配置已保存（演示）');
  closeModal('dsModal');
}

/* ---------- 数据库接入：选择表与视图 ---------- */
const DB_OBJS=[
  /* 规划审批库 */
  {n:'demo_t_approval_project',d:'用地审批项目主表',t:'table',f:24,s:'public',src:'规划审批库'},
  {n:'demo_t_approval_flow',d:'审批流程记录表',t:'table',f:18,s:'public',src:'规划审批库'},
  {n:'demo_t_owner_info',d:'权利人信息表',t:'table',f:21,s:'public',src:'规划审批库'},
  {n:'demo_v_project_summary',d:'项目汇总视图',t:'view',f:12,s:'public',src:'规划审批库'},
  /* 不动产登记库 */
  {n:'demo_t_estate_reg',d:'不动产登记主表',t:'table',f:28,s:'re_sch',src:'不动产登记库'},
  {n:'demo_t_mortgage',d:'抵押登记表',t:'table',f:16,s:'re_sch',src:'不动产登记库'},
  {n:'demo_t_seizure',d:'查封登记表',t:'table',f:11,s:'re_sch',src:'不动产登记库'},
  {n:'demo_v_estate_summary',d:'不动产汇总视图',t:'view',f:14,s:'re_sch',src:'不动产登记库'},
  /* 国土空间规划库 */
  {n:'demo_t_land_parcel',d:'地块信息表',t:'table',f:32,s:'gis',src:'国土空间规划库'},
  {n:'demo_t_land_use_plan',d:'土地利用规划表',t:'table',f:15,s:'gis',src:'国土空间规划库'},
  {n:'demo_v_parcel_stats',d:'地块统计视图',t:'view',f:9,s:'gis',src:'国土空间规划库'},
  /* 耕地保护空间库 */
  {n:'demo_t_farmland',d:'基本农田保护块',t:'table',f:22,s:'gis',src:'耕地保护空间库'},
  {n:'demo_t_occupy_balance',d:'占补平衡台账',t:'table',f:13,s:'gis',src:'耕地保护空间库'},
  {n:'demo_v_farmland_index',d:'耕地指标视图',t:'view',f:10,s:'gis',src:'耕地保护空间库'},
  /* 执法监察库 */
  {n:'demo_t_law_case',d:'违法案件表',t:'table',f:19,s:'ENFORCE',src:'执法监察库'},
  {n:'demo_t_sat_image',d:'卫片影像任务表',t:'table',f:8,s:'ENFORCE',src:'执法监察库'},
  {n:'demo_v_enforce_stats',d:'执法统计视图',t:'view',f:7,s:'ENFORCE',src:'执法监察库'},
  /* 测绘成果库 */
  {n:'demo_t_survey_parcel',d:'测绘地块成果表',t:'table',f:26,s:'dbo',src:'测绘成果库'},
  {n:'demo_t_control_point',d:'控制点成果表',t:'table',f:12,s:'dbo',src:'测绘成果库'},
  {n:'demo_v_survey_summary',d:'测绘汇总视图',t:'view',f:11,s:'dbo',src:'测绘成果库'},
];
function openDbObj(ds){
  document.getElementById('dbObjTitle').textContent='选择表与视图 · '+ds;
  const list=document.getElementById('objList');
  list.innerHTML=DB_OBJS.map(o=>`<label class="obj-row">
    <input type="checkbox" onchange="updateObjCount()">
    <span class="oi"><i class="fa-solid ${o.t==='view'?'fa-table-columns':'fa-table'}"></i></span>
    <span><span class="ot">${o.n}</span><br><span class="od">${o.d} · ${o.f} 字段</span></span>
    <span class="otype ${o.t==='view'?'view':''}">${o.t==='view'?'视图':'表'}</span>
  </label>`).join('');
  const all=document.querySelector('#dbObjModal .chk-all input'); if(all) all.checked=false;
  document.getElementById('objCount').textContent='已选 0 项';
  openModal('dbObjModal');
}
function toggleAllObj(box){
  document.querySelectorAll('#objList input[type=checkbox]').forEach(c=>c.checked=box.checked);
  updateObjCount();
}
function updateObjCount(){
  const n=document.querySelectorAll('#objList input[type=checkbox]:checked').length;
  document.getElementById('objCount').textContent='已选 '+n+' 项';
}
function confirmDbObj(){
  const n=document.querySelectorAll('#objList input[type=checkbox]:checked').length;
  if(n===0){ alert('请至少选择一个表或视图'); return; }
  alert('已对所选 '+n+' 个对象发起元数据接入（演示）');
  closeModal('dbObjModal');
}

/* ---------- 启动 ---------- */
buildNav();
go('dashboard');
