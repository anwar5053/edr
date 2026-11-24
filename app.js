const D=864e5,now=Date.now();
const S={role:null,page:'new',basket:[],cur:null,scanned:false,qty:1,err:'',tab:'day',n:1043,
orders:[{id:1042,items:[{n:'Everyday Roastery Vanilla Latte - Full Cream Milk, 16oz',q:2}],t:now-36e5,s:'done'},{id:1041,items:[{n:'Everyday Roastery Americano Iced, 14oz',q:1}],t:now-2*D,s:'done'},{id:1040,items:[{n:'Everyday Roastery Mango Pineapple Frappe Can, 500ml',q:1},{n:'Everyday Roastery Americano Iced, 14oz',q:1}],t:now-3*D,s:'done'},{id:1039,items:[{n:'Everyday Roastery Iced Caramel Latte Skimmed Milk, 14oz',q:3}],t:now-5*D,s:'done'}]};
function qr(code){if(typeof qrcode=='undefined')return '<div class="qr err">QR library did not load.</div>';
const q=qrcode(0,'M');q.addData(code);q.make();const c=q.getModuleCount();let o='';
for(let y=0;y<c;y++)for(let x=0;x<c;x++)if(q.isDark(y,x))o+=`<rect x="${x}" y="${y}" width="1" height="1"/>`;
return `<svg class="qr" viewBox="-2 -2 ${c+4} ${c+4}" fill="#241A15" shape-rendering="crispEdges" aria-label="QR code ${code}">${o}</svg>`}
function go(p){S.page=p;S.sent=0;render()}
function setRole(r){S.role=r;S.page=r=='merchant'?'new':'queue';render()}
function search(){const v=document.getElementById('sku').value.trim().toUpperCase();
if(!/^[A-Z0-9]{6}$/.test(v)){S.err='Enter a 6-character SKU.';S.cur=null}
else if(!CAT[v]){S.err='No product with this SKU. Check the code and try again.';S.cur=null}
else{S.err='';S.cur=v;S.scanned=false;S.qty=1}render();}
function scan(){S.scanned=true;render()}
function qty(d){S.qty=Math.max(1,S.qty+d);render()}
function add(){const n=CAT[S.cur][0],e=S.basket.find(b=>b.n==n);e?e.q+=S.qty:S.basket.push({n,q:S.qty});S.cur=null;render();document.getElementById('sku').focus()}
function send(){const id=S.n++;S.orders.unshift({id,items:S.basket,t:Date.now(),s:'new'});S.basket=[];S.cur=null;S.sent=id;render()}
function setS(id,s){S.orders.find(o=>o.id==id).s=s;render()}
const li=a=>a.map(i=>`<div class="line"><span>${i.n}</span><b>× ${i.q}</b></div>`).join('');
function merchantNew(){
const basket=S.basket.length?li(S.basket):'<div class="empty">No drinks yet. Search a SKU to start an order.</div>';
let mid='';
if(S.cur){mid=`<div class="qrwrap">${qr(CAT[S.cur][1])}<div><div class="stat">${S.scanned?'Scanned':'Waiting for the device to scan this code'}</div>
${S.scanned?`<div class="drink">${CAT[S.cur][0].replace("Everyday Roastery ","")}</div><div class="stat">SKU ${S.cur}</div><div class="step"><button onclick="qty(-1)" aria-label="Less">−</button><b>${S.qty}</b><button onclick="qty(1)" aria-label="More">+</button></div><button class="btn" onclick="add()">Add to basket</button>`:`<button class="btn ghost" style="margin-top:12px" onclick="scan()">Simulate scan</button>`}</div></div>`}
return `${S.sent?`<div class="card" style="margin-bottom:16px;border-color:var(--ok);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span><b>Order #${S.sent}</b> sent to barista.</span><button class="btn ghost" onclick="go('history')">View in order history</button></div>`:''}<h1>New order</h1><p class="sub">Search a product by its 6-character SKU.</p><div class="row"><div class="col card">
<div class="field"><input id="sku" maxlength="6" autocomplete="off" placeholder="000000" value="${S.cur||''}" onkeydown="if(event.key=='Enter')search()"><button class="btn" onclick="search()">Search</button></div>
<div class="err">${S.err}</div>${mid}</div>
<div class="col card" style="max-width:380px"><h2>Basket</h2>${basket}
<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn ghost" onclick="document.getElementById('sku').focus()">Add another drink</button><button class="btn" ${S.basket.length?'':'disabled'} onclick="send()">Send to barista</button></div></div></div>`}
function history(){const lim=S.tab=='day'?new Date().setHours(0,0,0,0):now-7*D;
const L=S.orders.filter(o=>o.t>=lim),tot=L.reduce((a,o)=>a+o.items.reduce((b,i)=>b+i.q,0),0);
return `<h1>Order history</h1><p class="sub">${L.length} orders, ${tot} drinks ${S.tab=='day'?'today':'this week'}.</p>
<div class="tabs"><button class="${S.tab=='day'?'on':''}" onclick="S.tab='day';render()">Today</button><button class="${S.tab=='week'?'on':''}" onclick="S.tab='week';render()">This week</button></div>
<div class="card">${L.length?L.map(o=>`<div class="line" style="align-items:center"><span><b>#${o.id}</b> · ${o.items.map(i=>i.q+' × '+i.n).join(', ')}</span><span><span class="tag ${o.s}">${o.s=='new'?(S.role=='barista'?'New':'Sent'):o.s=='making'?'Preparing':'Ready'}</span> <span class="stat">${new Date(o.t).toLocaleString([],{weekday:'short',hour:'2-digit',minute:'2-digit'})}</span></span></div>`).join(''):'<div class="empty">No orders in this period.</div>'}</div>`}
function queue(){const L=S.orders.filter(o=>o.s!='done');
return `<h1>Incoming orders</h1><p class="sub">${L.length?L.length+' to prepare':'All caught up.'}</p><div class="orders">${L.map(o=>`<div class="card"><div style="display:flex;justify-content:space-between"><h2>#${o.id}</h2><span class="tag ${o.s}">${o.s=='new'?'New':'Preparing'}</span></div>${li(o.items)}
<div style="margin-top:14px">${o.s=='new'?`<button class="btn" onclick="setS(${o.id},'making')">Start preparing</button>`:`<button class="btn" onclick="setS(${o.id},'done')">Mark ready</button>`}</div></div>`).join('')}</div>`}
function render(){const r=document.getElementById('root');
if(!S.role){r.innerHTML=`<div class="login"><div class="logo">EDR</div><p class="sub">Sign in to continue</p><button class="btn" onclick="setRole('merchant')">Sign in as Mart</button><button class="btn ghost" onclick="setRole('barista')">Sign in as barista</button></div>`;return}
const m=S.role=='merchant',nav=(p,t)=>`<button class="nav ${S.page==p?'on':''}" onclick="go('${p}')">${t}</button>`;
r.innerHTML=`<div class="app"><aside class="side"><div class="logo">EDR</div><div class="role">${m?'Mart':'Barista'}</div>${m?nav('new','New order')+nav('history','Order history'):nav('queue','Incoming orders')+nav('history','Order history')}<div class="spacer"></div><button class="nav" onclick="S.role=null;render()">Sign out</button></aside><main class="main">${S.page=='new'?merchantNew():S.page=='history'?history():queue()}</main></div>`}
render();