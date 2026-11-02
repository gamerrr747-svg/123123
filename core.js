"use strict";
/* ================= utilities ================= */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const L=(en,kk,ru)=>({en,kk,ru});
const store={get(k){try{const v=localStorage.getItem('mlm:'+k);return v?JSON.parse(v):null}catch(e){return null}},set(k,v){try{localStorage.setItem('mlm:'+k,JSON.stringify(v))}catch(e){}}};
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const S={lang:store.get('lang')||'kk',route:{v:'home'},prog:store.get('prog')||{},xp:store.get('xp')||0,badges:store.get('badges')||[],self:store.get('self')||{},gb:store.get('gb')||null,
  lab:{},les:{},pq:null,teach:{tab:'heat',unit:'u1'},tutor:{msgs:[],busy:false,live:null,hl:0,hkey:null},ctx:{}};
function save(){store.set('prog',S.prog);store.set('xp',S.xp);store.set('badges',S.badges);store.set('self',S.self)}
function tx(o){if(o==null)return'';if(typeof o==='function')return tx(o());if(typeof o==='string'||typeof o==='number')return String(o);return o[S.lang]??o.en}
function rc(o){return typeof o==='string'?M(o):tx(o)}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function num(n,d=2){if(!isFinite(n))return n>0?'+∞':'−∞';if(Math.abs(n)<1e-9)n=0;let s=String(Math.round(n*10**d)/10**d);if(S.lang!=='en')s=s.replace('.',',');return s.replace('-','−')}
const raw=n=>String(Math.round(n*1e6)/1e6);
/* math mini-markup: √{..}  fr{a}{b}  ^2  ^(n)  -  *  */
function M(s){return'<span class="math">'+Mi(String(s))+'</span>'}
function grab(s,i){let d=0,j=i;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(!d)break}}return[s.slice(i+1,j),j+1]}
function Mi(s){let o='',i=0;while(i<s.length){
  if(s.startsWith('√{',i)){const[a,j]=grab(s,i+1);o+='√<span class="ov">'+Mi(a)+'</span>';i=j;continue}
  if(s.startsWith('fr{',i)){const[a,j]=grab(s,i+2);const[b,k]=grab(s,j);o+=`<span class="fr"><span>${Mi(a)}</span><span>${Mi(b)}</span></span>`;i=k;continue}
  let j=i;while(j<s.length&&!s.startsWith('√{',j)&&!s.startsWith('fr{',j))j++;o+=plain(s.slice(i,j));i=j}return o}
function plain(t){t=esc(t).replace(/\^\(([^)]*)\)/g,'<sup>$1</sup>').replace(/\^2/g,'²').replace(/\^3/g,'³').replace(/\^4/g,'⁴').replace(/\^(\d+|[a-z])/g,'<sup>$1</sup>');
  if(S.lang!=='en')t=t.replace(/(\d)\.(\d)/g,'$1,$2');
  t=t.replace(/-/g,'−').replace(/\*/g,'·').replace(/_\(([^)]*)\)/g,'<sub>$1</sub>').replace(/_([A-Za-z0-9]+)/g,'<sub>$1</sub>').replace(/x\u0304/g,'\u0001');
  return t.replace(/(^|[^A-Za-z&#;<\/])([a-zA-Z])(?![A-Za-z;>])/g,'$1<i>$2</i>').replace(/\u0001/g,'<i>x̄</i>')}
function rng(seed){let a=0;for(const ch of String(seed))a=(a*31+ch.charCodeAt(0))|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),pick=(r,a)=>a[Math.floor(r()*a.length)],nz=(r,a,b)=>{let v;do v=ri(r,a,b);while(v===0);return v};
function shuffle(arr,seed){const r=rng(seed),a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1}
function frs(p,q){if(q<0){p=-p;q=-q}const g=gcd(p,q);p/=g;q/=g;return q===1?String(p):(p<0?'-':'')+`fr{${Math.abs(p)}}{${q}}`}
function nstr(n){if(!isFinite(n))return n>0?'+∞':'-∞';for(let q=1;q<=12;q++){const p=Math.round(n*q);if(Math.abs(n*q-p)<1e-9)return frs(p,q)}return raw(n)}
function polyStr(c,v='x'){let s='';for(let i=c.length-1;i>=0;i--){const k=Math.round((c[i]||0)*1e6)/1e6;if(!k)continue;const ab=Math.abs(k);const sg=k<0?(s?' - ':'-'):(s?' + ':'');const vv=i===0?'':i===1?v:v+'^'+i;s+=sg+((ab===1&&i>0)?'':raw(ab))+vv}return s||'0'}
function ivStr(list){if(list==='R')return'(-∞; +∞)';if(!list.length)return'∅';return list.map(i=>i.a===i.b?'{'+nstr(i.a)+'}':(i.ca&&isFinite(i.a)?'[':'(')+nstr(i.a)+'; '+nstr(i.b)+(i.cb&&isFinite(i.b)?']':')')).join(' ∪ ')}
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2600)}
function confetti(){if(RM)return;const cv=$('#confetti'),ctx=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;const cs=getComputedStyle(document.documentElement);const cols=['--ka','--kb','--kc','--accent'].map(v=>cs.getPropertyValue(v).trim());
  const ps=Array.from({length:110},()=>({x:innerWidth/2,y:innerHeight/3,vx:(Math.random()-.5)*14,vy:Math.random()*-12-3,s:Math.random()*7+4,c:cols[Math.floor(Math.random()*4)],r:Math.random()*6}));let n=0;
  (function f(){ctx.clearRect(0,0,cv.width,cv.height);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.r+=.1;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore()});if(++n<120)requestAnimationFrame(f);else ctx.clearRect(0,0,cv.width,cv.height)})()}
let LEAVE=[];const onLeave=f=>LEAVE.push(f);function leave(){LEAVE.splice(0).forEach(f=>{try{f()}catch(e){}})}
function tween(from,to,dur,step){if(RM||dur<=0){step(to,1);return()=>{}}let raf,t0=performance.now();const f=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);step(from+(to-from)*e,p);if(p<1)raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);const c=()=>cancelAnimationFrame(raf);onLeave(c);return c}
function slider(id,lab,v,min,max,step,cls=''){return`<div class="sl ${cls}"><label for="${id}">${lab}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${v}"><output id="${id}o">${num(v)}</output></div>`}
function bindSl(id,fn,fmt=num){const i=$('#'+id);if(!i)return;i.oninput=()=>{const v=+i.value;$('#'+id+'o').textContent=fmt(v);fn(v)}}

/* ================= plotting ================= */
let gid=0;
function Plot(host,o={}){const id=++gid,W=640,H=o.H||400;const p={R:o.R||6,xc:o.xc||0,yc:o.yc||0};
  host.innerHTML=`<svg class="graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="graph"><defs><clipPath id="cl${id}"><rect width="${W}" height="${H}"/></clipPath></defs><g class="gg"></g><g clip-path="url(#cl${id})" class="lay"></g></svg>`;
  const gg=$('.gg',host),lay=$('.lay',host);let last={};
  const k=()=>W/(2*p.R),X=x=>W/2+(x-p.xc)*k(),Y=y=>H/2-(y-p.yc)*k();
  const xr=()=>[p.xc-p.R,p.xc+p.R],yr=()=>[p.yc-H/(2*k()),p.yc+H/(2*k())];
  function grid(){const[x0,x1]=xr(),[y0,y1]=yr();const st=[.5,1,2,5,10,20,50,100].find(s=>p.R/s<=7.5)||100;let s='';
    for(let x=Math.ceil(x0/st)*st;x<=x1;x+=st)if(Math.abs(x)>1e-9)s+=`<line class="gl" x1="${X(x)}" y1="0" x2="${X(x)}" y2="${H}"/>`;
    for(let y=Math.ceil(y0/st)*st;y<=y1;y+=st)if(Math.abs(y)>1e-9)s+=`<line class="gl" x1="0" y1="${Y(y)}" x2="${W}" y2="${Y(y)}"/>`;
    const ax=Math.min(Math.max(Y(0),0),H),ay=Math.min(Math.max(X(0),0),W);
    s+=`<line class="ax" x1="0" y1="${ax}" x2="${W}" y2="${ax}"/><line class="ax" x1="${ay}" y1="0" x2="${ay}" y2="${H}"/>`;
    for(let x=Math.ceil(x0/st)*st;x<=x1;x+=st)if(Math.abs(x)>1e-9&&X(x)>14&&X(x)<W-14)s+=`<text class="tl" x="${X(x)}" y="${Math.min(ax+16,H-4)}" text-anchor="middle">${num(x)}</text>`;
    for(let y=Math.ceil(y0/st)*st;y<=y1;y+=st)if(Math.abs(y)>1e-9&&Y(y)>12&&Y(y)<H-8)s+=`<text class="tl" x="${Math.max(ay-6,30)}" y="${Y(y)+4}" text-anchor="end">${num(y)}</text>`;
    s+=`<text class="axl" x="${W-10}" y="${Math.max(ax-8,14)}" text-anchor="end">${o.xl||'x'}</text><text class="axl" x="${Math.min(ay+9,W-20)}" y="16">${o.yl||'y'}</text>`;gg.innerHTML=s}
  function draw(sp=last){last=sp;let s='';const[x0,x1]=xr(),[y0,y1]=yr(),big=(y1-y0)*3;
    (sp.bands||[]).forEach(b=>{const a=Math.max(b.a,x0-1),c=Math.min(b.b,x1+1);if(c>a)s+=`<rect class="${b.cls||'band'}" x="${X(a)}" y="0" width="${X(c)-X(a)}" height="${H}"/>`});
    (sp.rects||[]).forEach(r=>s+=`<rect class="${r.cls||'bar'}" x="${X(r.x)}" y="${Y(r.y+r.h)}" width="${X(r.x+r.w)-X(r.x)}" height="${Math.max(0,Y(r.y)-Y(r.y+r.h))}"/>`);
    (sp.fns||[]).forEach(f=>{const a=Math.max(x0,f.dom?f.dom[0]:-1e9),b=Math.min(x1,f.dom?f.dom[1]:1e9);if(b<=a)return;const N=f.n||320;let d='',pen=false,prev=null;
      for(let i=0;i<=N;i++){const x=a+(b-a)*i/N;let y=f.f(x);if(!isFinite(y)||Math.abs(y)>1e6){pen=false;prev=null;continue}
        if(prev!==null&&Math.abs(y-prev)>(y1-y0)*2&&f.brk){pen=false}y=Math.max(y0-big,Math.min(y1+big,y));d+=(pen?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1);pen=true;prev=f.f(x)}
      s+=`<path class="${f.cls||'curve'}" d="${d}"/>`});
    (sp.segs||[]).forEach(g=>s+=`<line class="${g.cls||'dash'}" x1="${X(g.x1)}" y1="${Y(g.y1)}" x2="${X(g.x2)}" y2="${Y(g.y2)}"/>`);
    (sp.pts||[]).forEach(q=>{s+=`<circle class="${q.cls||'p1'}" cx="${X(q.x)}" cy="${Y(q.y)}" r="${q.r||6.5}"/>`;if(q.lab)s+=`<text class="pl" x="${X(q.x)+9}" y="${Y(q.y)-9}">${q.lab}</text>`});
    (sp.texts||[]).forEach(q=>s+=`<text class="lbl" x="${X(q.x)}" y="${Y(q.y)}" text-anchor="${q.anchor||'middle'}">${q.t}</text>`);
    lay.innerHTML=s}
  grid();return{draw,set(o2){Object.assign(p,o2);grid();draw()},p,X,Y,W,H}}
/* number line with rows */
function NumberLine(host,o){const W=640,rows=o.rows||1,RH=56,H=RH*rows+34;const min=o.min,max=o.max,X=x=>40+(Math.max(min,Math.min(max,x))-min)/(max-min)*(W-80);
  function draw(sp){let s='';for(let r=0;r<rows;r++){const y=RH*r+34;s+=`<line class="ax" x1="20" y1="${y}" x2="${W-14}" y2="${y}"/><path d="M${W-14} ${y} l-9 -5 v10z" fill="var(--muted)"/>`;if(sp.labels&&sp.labels[r])s+=`<text class="tl" x="4" y="${y-14}">${sp.labels[r]}</text>`}
    (sp.iv||[]).forEach(i=>{const y=RH*(i.row||0)+34,a=isFinite(i.a)?X(i.a):24,b=isFinite(i.b)?X(i.b):W-18;s+=`<rect x="${a}" y="${y-9}" width="${Math.max(2,b-a)}" height="18" rx="4" fill="var(${i.c||'--shade'})"/><line x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="var(${i.s||'--accent'})" stroke-width="4"/>`});
    (sp.signs||[]).forEach(g=>{const y=RH*(g.row||0)+34;s+=`<text x="${X(g.x)}" y="${y-16}" text-anchor="middle" font-weight="800" font-size="18" fill="var(${g.s==='+'?'--ok':'--bad'})">${g.s==='+'?'+':'−'}</text>`});
    (sp.pts||[]).forEach(q=>{const y=RH*(q.row||0)+34;s+=`<circle cx="${X(q.x)}" cy="${y}" r="6.5" fill="${q.open?'var(--surface)':'var(--accent)'}" stroke="var(--accent)" stroke-width="2.5"/><text class="tl" x="${X(q.x)}" y="${y+24}" text-anchor="middle">${q.lab!=null?q.lab:num(q.x)}</text>`});
    host.innerHTML=`<svg class="graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="number line">${s}</svg>`}
  return{draw}}

/* ================= polynomial / equation core ================= */
const P0=v=>Math.abs(v)<1e-9?0:Math.round(v*1e9)/1e9;
const pTrim=p=>{p=p.map(P0);while(p.length>1&&p[p.length-1]===0)p.pop();return p};
const pAdd=(p,q)=>{const r=[];for(let i=0;i<Math.max(p.length,q.length);i++)r[i]=(p[i]||0)+(q[i]||0);return pTrim(r)};
const pNeg=p=>p.map(v=>-v),pSub=(p,q)=>pAdd(p,pNeg(q));
const pMul=(p,q)=>{const r=new Array(p.length+q.length-1).fill(0);p.forEach((a,i)=>q.forEach((b,j)=>r[i+j]+=a*b));return pTrim(r)};
const pDeg=p=>{p=pTrim(p);return p.length===1&&p[0]===0?-1:p.length-1};
function parsePoly(str){const tok=[];let i=0;
  while(i<str.length){const ch=str[i];if(/[0-9.]/.test(ch)){let j=i;while(j<str.length&&/[0-9.]/.test(str[j]))j++;const v=Number(str.slice(i,j));if(isNaN(v))throw Error('syntax');tok.push({t:'n',v});i=j}
    else if(ch==='x'){tok.push({t:'x'});i++}else if('+-*/^()'.includes(ch)){tok.push({t:ch});i++}else throw Error('syntax')}
  let p=0;const peek=()=>tok[p],eat=t=>{if(tok[p]&&tok[p].t===t){p++;return true}return false};
  function expr(){let r=term();while(peek()&&(peek().t==='+'||peek().t==='-')){const op=tok[p++].t;const q=term();r=op==='+'?pAdd(r,q):pSub(r,q)}return r}
  function term(){let r=unary();while(peek()){const t=peek().t;if(t==='*'){p++;r=pMul(r,unary())}else if(t==='/'){p++;const q=unary();if(pDeg(q)>0)throw Error('nonpoly');if(pDeg(q)<0)throw Error('syntax');r=pTrim(r.map(v=>v/q[0]))}else if(t==='n'||t==='x'||t==='('){r=pMul(r,power())}else break}return r}
  function unary(){if(eat('-'))return pNeg(unary());if(eat('+'))return unary();return power()}
  function power(){let b=primary();if(eat('^')){const e=peek();if(!e||e.t!=='n'||!Number.isInteger(e.v)||e.v>9)throw Error('syntax');p++;let r=[1];for(let k=0;k<e.v;k++)r=pMul(r,b);b=r}return b}
  function primary(){const t=tok[p];if(!t)throw Error('syntax');if(t.t==='n'){p++;return[t.v]}if(t.t==='x'){p++;return[0,1]}if(t.t==='('){p++;const r=expr();if(!eat(')'))throw Error('syntax');return r}throw Error('syntax')}
  const r=expr();if(p!==tok.length)throw Error('syntax');return r}
function classify(a,b,c){if(a!==0)return{kind:'quad',comp:b!==0&&c!==0?'complete':b===0&&c===0?'zero':b===0?'c':'bx',monic:a===1};if(b!==0)return{kind:'linear'};return{kind:'const'}}
function analyze(src){const s=String(src).toLowerCase().replace(/[хx]/g,'x').replace(/×/g,'*').replace(/²/g,'^2').replace(/³/g,'^3').replace(/⁴/g,'^4').replace(/[−–—]/g,'-').replace(/[·∙]/g,'*').replace(/,/g,'.').replace(/\s+/g,'');
  const sd=s.split('=');if(sd.length!==2||!sd[0]||!sd[1])return{ok:false,err:'eq',src};
  try{const Lp=parsePoly(sd[0]),Rp=parsePoly(sd[1]);const p=pSub(Lp,Rp);const deg=pDeg(p);const a=deg<=2?(p[2]||0):null,b=deg<=2?(p[1]||0):null,c=deg<=2?(p[0]||0):null;
    const kind=deg>2?'higher':deg===2?'quad':deg===1?'linear':'const';return{ok:true,src,lhs:sd[0],rhs:sd[1],deg,a,b,c,p,kind,rhsZero:pDeg(Rp)<0,...(kind==='quad'?classify(a,b,c):{})}}
  catch(e){return{ok:false,err:e.message==='nonpoly'?'nonpoly':'syntax',src,kind:e.message==='nonpoly'?'nonpoly':null}}}
function polyHTML(a,b,c,o={}){const col=o.color!==false,ghost=!!o.ghost;let out='',first=true;
  const add=(v,cls,xs)=>{if(v===0&&!(ghost&&cls==='ka'))return;const neg=v<0,abs=Math.abs(v);let coef=(xs&&abs===1)?'':num(abs);let sign=first?(neg?'−':''):(neg?' − ':' + ');if(v===0){coef='0';sign=first?'':' + '}
    out+=`${sign}<span class="t ${col?cls:''} ${v===0?'ghost':''}" data-k="${cls}">${coef}${xs}</span>`;first=false};
  add(a,'ka','<i>x</i>²');add(b,'kb','<i>x</i>');add(c,'kc','');if(first)out='0';return`<span class="math">${out} = 0</span>`}

/* ================= interface strings ================= */
const U={
  sub:L('Grade 8 Algebra · IB MYP Year 4','8-сынып алгебра · IB MYP 4-жыл','Алгебра 8 · IB MYP, 4-й год'),
  home:L('Course map','Курс картасы','Карта курса'),crit:L('MYP criteria','MYP критерийлері','Критерии MYP'),teacher:L('Class journal','Сынып журналы','Классный журнал'),
  tabs:{lesson:L('Lesson','Сабақ','Урок'),lab:L('Lab','Зертхана','Лаборатория'),theory:L('Theory','Теория','Теория'),practice:L('Practice','Жаттығу','Практика'),bank:L('Problem bank','Есептер жинағы','Сборник задач'),myp:L('MYP','MYP','MYP')},
  stages:[L('Engage','Қызығушылық ояту','Вовлечение'),L('Explore','Зерттеу','Исследование'),L('Explain','Түсіндіру','Объяснение'),L('Practice','Жаттығу','Практика'),L('Assess','Бағалау','Оценивание')],
  prev:L('Previous','Алдыңғы','Назад'),next:L('Next','Келесі','Далее'),reveal:L('Reveal','Көрсету','Показать'),reset:L('Reset','Қайта бастау','Сбросить'),full:L('Fullscreen','Толық экран','Полный экран'),exitfull:L('Exit fullscreen','Толық экраннан шығу','Выйти'),
  notes:L('Teacher notes','Мұғалімге ескертпе','Заметки учителя'),check:L('Check','Тексеру','Проверить'),hint:L('Hint','Кеңес','Подсказка'),cont:L('Next question','Келесі сұрақ','Следующий вопрос'),
  correct:L('Correct!','Дұрыс!','Верно!'),wrong:L('Not yet.','Әзірге дұрыс емес.','Пока неверно.'),yes:L('Yes','Иә','Да'),no:L('No','Жоқ','Нет'),
  predict:L('Predict first','Алдымен болжаңыз','Сначала предскажите'),tutor:L('AI Tutor','ЖИ-тьютор','ИИ-репетитор'),
  topic:L('Topic','Тақырып','Тема'),unit:L('Unit','Бөлім','Раздел'),term:L('Term','Тоқсан','Четверть'),
  mastery:L('Mastery','Меңгеру','Освоение'),level:L('Level','Деңгей','Уровень'),
  live:L('Live AI tutor · answers come from Claude','Тірі ЖИ-тьютор · жауапты Claude береді','ИИ-репетитор онлайн · отвечает Claude'),
  offline:L('Live AI chat is unavailable here. Using built-in step-by-step hints.','Мұнда тірі ЖИ-чат қолжетімсіз. Кіріктірілген кезеңдік кеңестер қолданылады.','Живой ИИ-чат здесь недоступен. Используются встроенные пошаговые подсказки.'),
  checking:L('Built-in hints are ready. Live AI connects when you send a message.','Кіріктірілген кеңестер дайын. Хабарлама жібергенде тірі ЖИ қосылады.','Встроенные подсказки готовы. Живой ИИ подключится при отправке.'),
  ask:L('Ask a question…','Сұрақ қойыңыз…','Задайте вопрос…'),send:L('Send','Жіберу','Отправить'),
  roots:L('roots','түбірлер','корни'),vertex:L('vertex','төбе','вершина'),yint:L('y-intercept','Oy-пен қиылысу','пересечение с Oy'),
  quad:L('Quadratic equation','Квадрат теңдеу','Квадратное уравнение'),linear:L('Linear equation','Сызықтық теңдеу','Линейное уравнение'),constant:L('No variable left','Айнымалы қалмады','Переменной не осталось'),
  complete:L('Complete','Толық','Полное'),bx:L('Incomplete: ax² + bx = 0','Толымсыз: ax² + bx = 0','Неполное: ax² + bx = 0'),c:L('Incomplete: ax² + c = 0','Толымсыз: ax² + c = 0','Неполное: ax² + c = 0'),zero:L('Incomplete: ax² = 0','Толымсыз: ax² = 0','Неполное: ax² = 0'),
  monic:L('Monic (a = 1)','Келтірілген (a = 1)','Приведённое (a = 1)'),nonmonic:L('Non-monic (a ≠ 1)','Келтірілмеген (a ≠ 1)','Неприведённое (a ≠ 1)'),
  sep:L('Separate several answers with ;','Бірнеше жауапты ; арқылы бөліңіз','Несколько ответов разделяйте знаком ;'),
};
const NOTES=[L('Hook: let pairs commit to a prediction before you reveal. Collect 2–3 answers and keep them on the board.','Жұптар жауап ашылмас бұрын болжам жасасын. 2–3 жауапты тақтада қалдырыңыз.','Пусть пары сделают прогноз до показа ответа. Запишите 2–3 ответа на доске.'),
  L('A volunteer operates the lab on the board while the class describes what changes and what stays the same (ATL: thinking).','Ерікті оқушы тақтада зертхананы басқарады, сынып не өзгеретінін және не өзгермейтінін сипаттайды (ATL: ойлау).','Доброволец управляет лабораторией на доске, класс описывает, что меняется, а что нет (ATL: мышление).'),
  L('Students record each rule in their own words in their notebooks, then compare with a partner (criterion C: mathematical language).','Оқушылар әр ережені дәптерге өз сөздерімен жазып, жұбымен салыстырады (C критерийі: математикалық тіл).','Ученики записывают каждое правило своими словами и сверяют с партнёром (критерий C: математический язык).'),
  L('Reveal one step at a time; ask "why is this step allowed?" before each reveal (criterion C: lines of reasoning).','Қадамдарды бір-бірден ашыңыз; әр қадам алдында «бұл неге рұқсат?» деп сұраңыз (C критерийі: пайымдау).','Открывайте шаги по одному; перед каждым спрашивайте «почему так можно?» (критерий C: ход рассуждений).'),
  L('Show of fingers 1–4 for A–D. Students who miss two questions go to Practice, which adapts to their mistakes.','A–D үшін саусақпен 1–4 көрсетіледі. Екі сұрақтан қателескендер қателеріне бейімделетін Жаттығуға өтеді.','Показ пальцами 1–4 для A–D. Ошибившиеся в двух вопросах переходят в Практику, которая подстраивается под ошибки.')];

/* ================= registry ================= */
const TOPICS=[],TOPIC={};
function topic(def){TOPICS.push(def);TOPIC[def.id]=def}
function tprog(id){return S.prog[id]||(S.prog[id]={lvl:1,st:0,er:0,m:0,n:0,ok:0,best:null})}
function unitOf(T){return UNITS.find(u=>u.topics.includes(T.id))}
function labState(T){return S.lab[T.id]||(S.lab[T.id]=T.labInit?T.labInit():{})}

/* ================= router & chrome ================= */
function parseHash(){const h=location.hash.slice(1)||'home';const m=h.match(/^(t\d\d)(?:-(lab|theory|practice|bank|myp))?$/);
  if(m&&TOPIC[m[1]])return{v:'topic',t:m[1],tab:m[2]||'lesson'};if(/^u[1-5]$/.test(h))return{v:'unit',u:h};if(['home','teacher','criteria'].includes(h))return{v:h};return{v:'home'}}
function go(h){if(location.hash!=='#'+h)history.replaceState(null,'','#'+h);route();window.scrollTo({top:0})}
function route(){leave();S.route=parseHash();if(S.pq&&S.pq.tid!==S.route.t)S.pq=null;renderChrome();render()}
function rerender(){leave();renderChrome();render()}
function renderChrome(){document.documentElement.lang=S.lang;$('#brandSub').textContent=tx(U.sub);
  const cur=S.route.v==='topic'||S.route.v==='unit'?'home':S.route.v;
  $('#tabs').innerHTML=[['home',U.home],['criteria',U.crit],['teacher',U.teacher]].map(([k,l])=>`<button class="tab" data-go="${k}" ${cur===k?'aria-current="page"':''}>${tx(l)}</button>`).join('');
  $$('.lang button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===S.lang));$('#fabTxt').textContent=tx(U.tutor)}
function render(){const r=S.route;S.ctx={where:r.v};
  if(r.v==='home')vHome();else if(r.v==='unit')vUnit(r.u);else if(r.v==='criteria')vCriteria();else if(r.v==='teacher')vTeacher();else vTopic(TOPIC[r.t],r.tab);
  if(!$('#tutor').hidden)renderTutor(true)}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){e.preventDefault();go(g.dataset.go)}});

/* ================= HOME ================= */
function vHome(){const done=TOPICS.filter(T=>tprog(T.id).m>=80).length;
  $('#view').innerHTML=`<div class="hero"><div class="stack" style="gap:10px"><span class="eyebrow">${tx(SCHOOL)}</span><span class="muted small" style="margin-top:-6px">${tx(U.sub)} · ${tx(L('GOSO + IB MYP','МЖМБС + IB MYP','ГОСО + IB MYP'))}</span>
    <h1>${tx(L('Algebra 8: the whole year, topic by topic','Алгебра 8: бүкіл жыл, тақырып бойынша','Алгебра 8: весь год по темам'))}</h1>
    <p class="muted">${tx(L('Each topic has its own lesson for the projector, an interactive lab, theory with trilingual vocabulary, adaptive practice and an MYP page: inquiry questions, ATL skills and a criterion task with a task-specific rubric. Topics are grouped into five MYP units that follow the four terms of the annual plan.','Әр тақырыптың өз сабағы (проекторға), интерактивті зертханасы, үш тілді сөздігі бар теориясы, бейімделген жаттығуы және MYP беті бар: зерттеу сұрақтары, ATL дағдылары және тапсырмаға арналған дескрипторлары бар критерийлік тапсырма. Тақырыптар жылдық жоспардың төрт тоқсанына сәйкес бес MYP бөліміне топтастырылған.','У каждой темы свой урок для проектора, интерактивная лаборатория, теория с трёхъязычным словарём, адаптивная практика и страница MYP: исследовательские вопросы, навыки ATL и задание по критерию с дескрипторами. Темы сгруппированы в пять разделов MYP по четвертям годового плана.'))}</p></div>
    <div class="card stack" style="gap:10px"><div class="row" style="justify-content:space-between"><b>${tx(L('Your progress on this device','Осы құрылғыдағы прогресс','Прогресс на этом устройстве'))}</b><span class="obj">XP ${S.xp}</span></div>
      <div class="bar"><i style="width:${done/TOPICS.length*100}%"></i></div><span class="muted small">${done}/${TOPICS.length} ${tx(L('topics mastered (≥ 80%)','тақырып меңгерілді (≥ 80%)','тем освоено (≥ 80%)'))}</span>
      <div class="row"><button class="btn sm" data-go="criteria">${tx(L('How MYP assessment works','MYP бағалауы қалай жүреді','Как устроено оценивание MYP'))}</button><button class="btn sm" data-go="teacher">${tx(L('Class journal','Сынып журналы','Классный журнал'))}</button></div></div></div>
  <div class="stack" style="gap:20px">${UNITS.map(u=>`<section class="unitband" style="--uc:var(--${u.id})"><div class="unithead"><div style="min-width:0;flex:1 1 380px"><div class="row" style="gap:6px;margin-bottom:6px"><span class="obj">${tx(U.term)} ${u.term}</span><span class="obj">${u.code}</span><span class="obj">${u.goso}</span></div>
      <h2>${tx(U.unit)} ${u.n}. ${tx(u.title)}</h2><p class="soi">${tx(u.soi)}</p></div>
      <div class="stack" style="gap:8px;align-items:flex-start"><div class="concepts"><span class="cc k">${tx(KC[u.kc])}</span>${u.rc.map(c=>`<span class="cc">${tx(RCN[c])}</span>`).join('')}<span class="cc">${tx(GC[u.gc].n)}</span></div><button class="btn sm" data-go="${u.id}">${tx(L('Unit planner','Бөлім жоспары','План раздела'))} →</button></div></div>
    <div class="topics">${u.topics.map(id=>{const T=TOPIC[id],p=tprog(id);return`<button class="tcard" data-go="${id}"><span class="num">${tx(U.topic)} ${T.n}</span><h3>${tx(T.title)}</h3><span class="muted small">${T.obj.map(o=>o[0]).join(' · ')}</span><div class="mb"><i style="width:${p.m}%"></i></div><span class="muted small">${tx(U.mastery)} ${Math.round(p.m)}%</span></button>`}).join('')}</div></section>`).join('')}</div>`}

/* ================= TOPIC ================= */
function vTopic(T,tab){const u=unitOf(T),i=TOPICS.indexOf(T),pv=TOPICS[i-1],nx=TOPICS[i+1];S.ctx={where:'topic',topic:T};
  $('#view').innerHTML=`<div style="--uc:var(--${u.id})"><div class="pagehead"><div class="stack" style="gap:6px;min-width:0">
    <div class="crumb"><button data-go="home">${tx(U.home)}</button>›<button data-go="${u.id}">${tx(U.unit)} ${u.n}. ${tx(u.title)}</button>›<span>${tx(U.topic)} ${T.n}</span></div>
    <h1>${T.n}. ${tx(T.title)}</h1><div class="row">${T.obj.map(o=>`<span class="obj">${o[0]} · ${tx(o[1])}</span>`).join('')}</div></div>
    <div class="row">${pv?`<button class="btn sm" data-go="${pv.id}">← ${pv.n}</button>`:''}${nx?`<button class="btn sm" data-go="${nx.id}">${nx.n} →</button>`:''}</div></div>
  <div class="ttabs" role="tablist">${['lesson','lab','theory','practice','bank','myp'].map(k=>`<button class="ttab" data-go="${T.id}${k==='lesson'?'':'-'+k}" ${tab===k?'aria-current="page"':''}>${tx(U.tabs[k])}</button>`).join('')}</div>
  <div id="tbody"></div></div>`;
  const el=$('#tbody');({lesson:tLesson,lab:tLab,theory:tTheory,practice:tPractice,bank:tBank,myp:tMyp})[tab](T,el)}
function tLab(T,el){el.innerHTML=`<div class="stack"><p class="muted" style="max-width:75ch">${tx(T.labIntro)}</p><div id="labHost"></div></div>`;T.lab($('#labHost'),labState(T))}
function tTheory(T,el){el.innerHTML=`<div class="grid2"><div class="stack"><h2>${tx(L('Key ideas','Негізгі идеялар','Главное'))}</h2>${T.rules.map((r,i)=>`<div class="rulecard"><span class="eyebrow">${i+1}</span><div>${rc(r)}</div></div>`).join('')}</div>
  <div class="stack"><h2>${tx(L('Worked examples','Шығарылған мысалдар','Разобранные примеры'))}</h2>${T.examples.map(ex=>`<div class="excard"><b>${rc(ex.q)}</b>${ex.steps.map((s,j)=>`<div class="step"><b>${j+1}</b><span>${rc(s)}</span></div>`).join('')}</div>`).join('')}
  <h2>${tx(L('Vocabulary · Сөздік · Словарь','Сөздік · Vocabulary · Словарь','Словарь · Vocabulary · Сөздік'))}</h2><div class="card flat scroll"><table class="data vocab"><thead><tr><th>KZ</th><th>EN</th><th>RU</th></tr></thead><tbody>${T.vocab.map(v=>`<tr><td>${v[1]}</td><td>${v[0]}</td><td>${v[2]}</td></tr>`).join('')}</tbody></table></div></div></div>`}

/* ---- lesson presentation ---- */
function les(T){return S.les[T.id]||(S.les[T.id]={st:0,rv:[0,0,0,0,0],pred:null,pick:{},notes:false,present:false})}
function stMax(T,st){return[T.hook.reveal.length,1,T.rules.length,T.examples.reduce((s,e)=>s+e.steps.length,0),T.quiz.length][st]}
function tLesson(T,el){const ls=les(T),st=ls.st,rv=ls.rv[st];
  el.innerHTML=`<section class="present ${ls.present?'presenting':''}"><div class="pbar">${U.stages.map((s,i)=>`<button class="pchip" data-st="${i}" ${i===st?'aria-current="step"':''}><b>${i+1}</b>${tx(s)}</button>`).join('')}<span style="flex:1"></span><span class="muted small" style="white-space:nowrap">${rv}/${stMax(T,st)}</span></div>
    <div class="stage" id="stage">${stageHTML(T,st,rv,ls)}</div>
    <div class="pctl"><button class="btn" id="pPrev" ${st===0?'disabled':''}>← ${tx(U.prev)}</button><button class="btn primary" id="pRev" ${rv>=stMax(T,st)?'disabled':''}>${tx(U.reveal)}</button><button class="btn" id="pReset">${tx(U.reset)}</button><span class="sp"></span>
      <button class="btn" id="pFull">${tx(ls.present?U.exitfull:U.full)}</button><button class="btn primary" id="pNext" ${st===4?'disabled':''}>${tx(U.next)} →</button></div>
    <details class="notes" ${ls.notes?'open':''}><summary>${tx(U.notes)}</summary><p style="margin-top:8px;max-width:80ch">${tx((T.notes&&T.notes[st])||NOTES[st])}</p></details></section>`;
  const re=()=>{leave();tLesson(T,el)};
  $$('[data-st]',el).forEach(b=>b.onclick=()=>{ls.st=+b.dataset.st;re()});
  $('#pPrev').onclick=()=>{ls.st--;re()};$('#pNext').onclick=()=>{ls.st++;re()};
  $('#pRev').onclick=()=>{if(ls.rv[st]<stMax(T,st)){ls.rv[st]++;re()}};
  $('#pReset').onclick=()=>{ls.rv[st]=0;if(st===0)ls.pred=null;if(st===4)ls.pick={};if(st===1){S.lab[T.id]=null}re()};
  $('#pFull').onclick=()=>{ls.present=!ls.present;try{if(ls.present)document.documentElement.requestFullscreen().catch(()=>{});else if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}re()};
  $('details.notes',el).ontoggle=e=>ls.notes=e.target.open;
  $$('[data-pred]',el).forEach(b=>b.onclick=()=>{ls.pred=+b.dataset.pred;re()});
  $$('[data-qz]',el).forEach(b=>b.onclick=()=>{ls.pick[+b.dataset.qz]=+b.dataset.o;re()});
  if(st===1)T.lab($('#lessonLab'),labState(T),{compact:true});
  const last=$$('#stage .rvn');if(last.length)last[last.length-1].classList.add('rv')}
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&S.route.v==='topic'){const ls=S.les[S.route.t];if(ls&&ls.present){ls.present=false;rerender()}}});
document.addEventListener('keydown',e=>{if(S.route.v!=='topic'||S.route.tab!=='lesson'||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const T=TOPIC[S.route.t],ls=les(T);
  if(e.key==='ArrowRight'&&ls.st<4){ls.st++;rerender()}else if(e.key==='ArrowLeft'&&ls.st>0){ls.st--;rerender()}else if(e.key===' '&&ls.rv[ls.st]<stMax(T,ls.st)){e.preventDefault();ls.rv[ls.st]++;rerender()}});
function stageHTML(T,st,rv,ls){const H=T.hook;
  if(st===0)return`<div class="grid2"><div class="stack"><span class="eyebrow">${tx(L('Real-life question','Өмірлік сұрақ','Жизненный вопрос'))}</span><h2>${tx(H.title)}</h2><p class="lead">${rc(H.text)}</p>
    <div class="card flat stack" style="background:var(--surface2)"><b>${tx(U.predict)}: ${rc(H.q)}</b><div class="choice">${H.opts.map((o,i)=>`<button class="copt ${rv>0&&i===H.a?'right':''} ${rv>0&&ls.pred===i&&i!==H.a?'wrong':''}" data-pred="${i}" aria-pressed="${ls.pred===i}"><span class="let">${'ABCD'[i]}</span><span>${rc(o)}</span></button>`).join('')}</div></div></div>
    <div class="stack">${H.visual?H.visual():''}${H.reveal.slice(0,rv).map((r,i)=>`<div class="${i===rv-1?'infobox':'card flat'} rvn lead">${rc(r)}</div>`).join('')}</div></div>`;
  if(st===1)return`<div class="stack"><span class="eyebrow">${tx(L('Experiment','Эксперимент','Эксперимент'))}</span><p class="lead">${tx(T.explore.q)}</p><div id="lessonLab"></div>${rv?`<div class="okbox rvn lead"><b>${tx(T.explore.find)}</b></div>`:''}</div>`;
  if(st===2)return`<div class="stack"><span class="eyebrow">${tx(L('Key ideas','Негізгі идеялар','Главное'))}</span>${T.rules.slice(0,rv).map(r=>`<div class="rulecard rvn lead">${rc(r)}</div>`).join('')||`<p class="lead muted">${tx(L('Press “Reveal” to show the rules one at a time.','Ережелерді бір-бірден көрсету үшін «Көрсету» батырмасын басыңыз.','Нажимайте «Показать», чтобы открывать правила по одному.'))}</p>`}</div>`;
  if(st===3){let n=0;return`<div class="grid3">${T.examples.map(ex=>`<div class="excard"><b style="font-size:1.1em">${rc(ex.q)}</b>${ex.steps.map((s,j)=>{n++;return n<=rv?`<div class="step rvn"><b>${j+1}</b><span>${rc(s)}</span></div>`:''}).join('')}</div>`).join('')}</div>`}
  return`<div class="stack" style="gap:18px">${T.quiz.map((q,qi)=>`<div class="stack" style="gap:10px"><h3 style="font-size:1.12em">${qi+1}. ${rc(q.q)}</h3><div class="choice">${q.o.map((o,i)=>`<button class="copt ${rv>qi&&i===q.a?'right':''} ${rv>qi&&ls.pick[qi]===i&&i!==q.a?'wrong':''}" data-qz="${qi}" data-o="${i}" aria-pressed="${ls.pick[qi]===i}"><span class="let">${'ABCD'[i]}</span><span>${rc(o)}</span></button>`).join('')}</div>${rv>qi?`<div class="okbox rvn"><span class="expl">${rc(q.e)}</span></div>`:''}</div>`).join('')}</div>`}

/* ---- practice engine ---- */
function parseNum(s){s=String(s).trim().replace(/[−–]/g,'-').replace(',','.').replace(/\s+/g,'');if(s===''||s==='-')return NaN;if(/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(s)){const[a,b]=s.split('/');return+a/+b}return Number(s)}
function parseList(s){return String(s).split(/[;]+/).map(x=>x.trim()).filter(Boolean).map(parseNum)}
function newQ(T,mode){const p=tprog(T.id);const seed=Date.now()+':'+Math.random();let lvl=p.lvl,gi=Math.floor(Math.random()*T.gens.length);
  if(mode&&mode.test){lvl=[1,1,2,2,3,3][mode.test.i];gi=mode.test.g[mode.test.i]}
  S.pq={tid:T.id,gi,lvl,seed,inp:[],sel:null,hints:0,checked:false,ok:null,test:mode&&mode.test||null}}
function buildQ(T,gi,lvl,seed){const q=T.gens[gi](lvl,rng(seed));if(q.k==='mc'&&!q.noShuffle){const order=shuffle(q.opts.map((_,i)=>i),seed);q.opts=order.map(i=>q.opts[i]);q.a=order.indexOf(q.a)}return q}
function curQ(T){const pq=S.pq;return buildQ(T,pq.gi,pq.lvl,pq.seed)}
function tPractice(T,el){const p=tprog(T.id);if(!S.pq||S.pq.tid!==T.id)newQ(T);
  el.innerHTML=`<div class="prac"><div class="stack" id="qArea"></div><aside class="stack">
    <div class="card stack"><div class="stat stack" style="gap:6px"><div class="row" style="justify-content:space-between"><b>${tx(U.mastery)}</b><b>${Math.round(p.m)}%</b></div><div class="bar"><i style="width:${p.m}%"></i></div>
      <div class="row" style="justify-content:space-between"><span class="muted small">${tx(U.level)}</span><span class="lvl">${[1,2,3].map(l=>`<i class="${l<=p.lvl?'on':''}"></i>`).join('')}</span></div>
      <span class="muted small">${tx(L('Answered','Жауап берілді','Ответов'))}: ${p.n} · ${tx(L('correct','дұрыс','верно'))}: ${p.ok}${p.best!=null?` · ${tx(L('best test','үздік тест','лучший тест'))}: ${p.best}%`:''}</span></div>
      <p class="muted small">${tx(L('Three correct answers without hints raise the level. Two mistakes in a row lower it and show a short recap. Speed is never counted.','Кеңессіз үш дұрыс жауап деңгейді көтереді. Қатарынан екі қате деңгейді төмендетіп, қысқа еске салу көрсетеді. Жылдамдық есептелмейді.','Три верных ответа без подсказок повышают уровень. Две ошибки подряд понижают его и показывают краткое напоминание. Скорость не учитывается.'))}</p></div>
    <div class="card stack">${S.pq.test?`<b>${tx(L('Topic test','Тақырыптық тест','Тест по теме'))}: ${S.pq.test.i+1}/6</b><button class="btn" id="qStopTest">${tx(L('Stop the test','Тестті тоқтату','Остановить тест'))}</button>`:`<button class="btn primary" id="qTest">${tx(L('Take the topic test (6 questions)','Тақырыптық тест (6 сұрақ)','Тест по теме (6 вопросов)'))}</button>`}
      <button class="btn" id="qReset">${tx(L('Reset this topic','Тақырыпты қайта бастау','Сбросить тему'))}</button><div id="qRc"></div></div></aside></div>`;
  renderQ(T);
  if($('#qTest'))$('#qTest').onclick=()=>{const g=Array.from({length:6},()=>Math.floor(Math.random()*T.gens.length));newQ(T,{test:{i:0,g,res:[]}});tPractice(T,el)};
  if($('#qStopTest'))$('#qStopTest').onclick=()=>{newQ(T);tPractice(T,el)};
  $('#qReset').onclick=()=>{$('#qRc').innerHTML=`<div class="note stack" style="gap:8px">${tx(L('Delete progress for this topic on this device?','Осы құрылғыдағы осы тақырып прогресін жою керек пе?','Удалить прогресс по теме на этом устройстве?'))}<div class="row"><button class="btn sm primary" id="rcY">${tx(U.yes)}</button><button class="btn sm" id="rcN">${tx(U.no)}</button></div></div>`;
    $('#rcY').onclick=()=>{delete S.prog[T.id];newQ(T);save();tPractice(T,el)};$('#rcN').onclick=()=>$('#qRc').innerHTML=''}}
function renderQ(T){const pq=S.pq,area=$('#qArea'),p=tprog(T.id);
  if(pq.done){const r=pq.test.res,sc=Math.round(r.filter(Boolean).length/r.length*100);area.innerHTML=`<div class="card stack"><span class="eyebrow">${tx(L('Topic test','Тақырыптық тест','Тест по теме'))}</span><h2>${sc}%</h2><p>${sc>=80?tx(L('Excellent — topic mastered.','Тамаша — тақырып меңгерілді.','Отлично — тема освоена.')):tx(L('Keep practising: the adaptive questions will target your mistakes.','Жаттығуды жалғастырыңыз: бейімделген сұрақтар қателеріңізге бағытталады.','Продолжайте практику: адаптивные вопросы нацелены на ваши ошибки.'))}</p><div><button class="btn primary" id="qBack">${tx(L('Back to practice','Жаттығуға оралу','Вернуться к практике'))}</button></div></div>`;
    $('#qBack').onclick=()=>{newQ(T);tPractice(T,$('#tbody'))};return}
  const q=curQ(T);S.ctx={where:'practice',topic:T,q,qtext:(tx(q.p)+' '+(q.eq||'')).replace(/<[^>]+>/g,'')};
  const recap=p.recap?`<div class="card stack" style="border-color:var(--accent)"><span class="eyebrow">${tx(L('Quick recap','Қысқа еске салу','Краткое напоминание'))}</span>${T.rules.slice(0,3).map(r=>`<div class="rulecard">${rc(r)}</div>`).join('')}<div><button class="btn primary" id="recapOk">${tx(L('Got it','Түсіндім','Понятно'))}</button></div></div>`:'';
  area.innerHTML=recap+`<article class="card stack" aria-live="polite"><div class="row" style="justify-content:space-between"><span class="obj">${q.o}</span><span class="lvl">${[1,2,3].map(l=>`<i class="${l<=pq.lvl?'on':''}"></i>`).join('')}</span></div>
    <h2 style="font-family:var(--f-body);font-weight:700;font-size:1.12rem">${rc(q.p)}</h2>${q.eq?`<div class="eqbig paper" style="border-radius:12px;padding:14px">${rc(q.eq)}</div>`:''}${q.vis?q.vis():''}
    <div id="ans"></div><div class="stack" style="gap:6px">${q.h.slice(0,pq.hints).map((h,i)=>`<div class="hint"><b>${tx(U.hint)} ${i+1}:</b> ${rc(h)}</div>`).join('')}</div>
    <div class="row"><button class="btn" id="hBtn" ${pq.checked||pq.hints>=q.h.length?'disabled':''}>${tx(U.hint)} ${pq.hints<q.h.length?`(${pq.hints+1}/${q.h.length})`:''}</button><span style="flex:1"></span>${pq.checked?`<button class="btn primary" id="nBtn">${tx(U.cont)} →</button>`:`<button class="btn primary" id="cBtn">${tx(U.check)}</button>`}</div>
    <div id="fb">${pq.checked?`<div class="${pq.ok?'okbox':'badbox'}"><b>${pq.ok?tx(U.correct)+(pq.hints?' +5 XP':' +10 XP'):tx(U.wrong)}</b><div class="expl stack" style="gap:6px">${rc(q.ex)}</div></div>`:''}</div></article>`;
  if($('#recapOk'))$('#recapOk').onclick=()=>{p.recap=false;save();renderQ(T)};
  const A=$('#ans'),dis=pq.checked?'disabled':'';
  if(q.k==='mc'){A.innerHTML=`<div class="opts" role="radiogroup">${q.opts.map((o,i)=>`<button class="opt ${pq.checked&&i===q.a?'right':''} ${pq.checked&&pq.sel===i&&i!==q.a?'wrong':''}" role="radio" aria-checked="${pq.sel===i}" data-i="${i}" ${dis}><span class="dot"></span><span>${rc(o)}</span></button>`).join('')}</div>`;
    $$('.opt',A).forEach(b=>b.onclick=()=>{pq.sel=+b.dataset.i;$$('.opt',A).forEach(x=>x.setAttribute('aria-checked',x===b))})}
  else{const fields=q.k==='multi'?q.fields:[[q.lab||(q.k==='nums'?'x':(tx(L('Answer','Жауап','Ответ')))),q.ans]];
    A.innerHTML=`<div class="inputs">${fields.map((f,i)=>`<label>${rc(f[0])}<input id="in${i}" inputmode="${q.k==='nums'?'text':'decimal'}" autocomplete="off" value="${esc(pq.inp[i]||'')}" ${dis} class="${pq.checked?(pq.fok&&pq.fok[i]?'right':'wrong'):''}"></label>`).join('')}</div><p class="muted small">${q.k==='nums'?tx(U.sep)+'. ':''}${tx(L('Fractions like 3/4 and decimals are accepted.','3/4 сияқты бөлшектер мен ондық бөлшектер қабылданады.','Принимаются дроби вида 3/4 и десятичные.'))}${q.unit?' '+tx(q.unit):''}</p>`;
    fields.forEach((f,i)=>{const inp=$('#in'+i);inp.oninput=()=>pq.inp[i]=inp.value;inp.onkeydown=e=>{if(e.key==='Enter'&&$('#cBtn'))$('#cBtn').click()}})}
  $('#hBtn').onclick=()=>{pq.hints++;renderQ(T)};
  if($('#cBtn'))$('#cBtn').onclick=()=>checkQ(T,q);
  if($('#nBtn'))$('#nBtn').onclick=()=>{if(pq.test){pq.test.i++;if(pq.test.i>=6){finishTest(T);return}const t=pq.test;newQ(T,{test:t})}else newQ(T);tPractice(T,$('#tbody'))}}
function checkQ(T,q){const pq=S.pq,p=tprog(T.id);let ok=false;const tol=q.tol||1e-6;
  if(q.k==='mc'){if(pq.sel==null){toast(tx(L('Choose an answer first.','Алдымен жауап таңдаңыз.','Сначала выберите ответ.')));return}ok=pq.sel===q.a}
  else if(q.k==='nums'){const v=parseList(pq.inp[0]||'');if(!v.length||v.some(isNaN)){toast(tx(L('Enter numbers separated by ;','Сандарды ; арқылы енгізіңіз','Введите числа через ;')));return}
    const a=[...q.ans].sort((x,y)=>x-y),b=[...v].sort((x,y)=>x-y);ok=a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<tol);pq.fok=[ok]}
  else{const fields=q.k==='multi'?q.fields:[[0,q.ans]];const v=fields.map((_,i)=>parseNum(pq.inp[i]||''));if(v.some(isNaN)){toast(tx(L('Enter a number in every box.','Әр ұяшыққа сан енгізіңіз.','Введите число в каждое поле.')));return}
    pq.fok=fields.map((f,i)=>Math.abs(v[i]-f[1])<tol);ok=pq.fok.every(Boolean)}
  pq.checked=true;pq.ok=ok;const indep=ok&&!pq.hints;p.n++;if(ok)p.ok++;S.xp+=ok?(pq.hints?5:10):0;
  if(!pq.test){p.m=Math.max(0,Math.min(100,p.m+(ok?(indep?12:6)+3*(pq.lvl-1):-8)));
    if(indep){p.st++;p.er=0;if(p.st>=3&&p.lvl<3){p.lvl++;p.st=0;toast(tx(L('Level up! Harder questions next.','Деңгей көтерілді!','Уровень повышен!')))}}
    else if(!ok){p.er++;p.st=0;if(p.er>=2){if(p.lvl>1)p.lvl--;p.er=0;p.recap=true}}else p.st=0}
  else pq.test.res.push(ok);
  if(p.m>=80)award(T.id);save();renderQ(T)}
function finishTest(T){const p=tprog(T.id),r=S.pq.test.res,sc=Math.round(r.filter(Boolean).length/r.length*100);p.best=Math.max(p.best||0,sc);if(sc>=80){p.m=Math.max(p.m,80);award(T.id)}save();S.pq.done=true;tPractice(T,$('#tbody'))}
function award(id){if(S.badges.includes(id))return;S.badges.push(id);save();toast(tx(L('Topic mastered: ','Тақырып меңгерілді: ','Тема освоена: '))+tx(TOPIC[id].title));confetti()}



/* save a file: Claude viewer capability, else a normal browser download (e.g. on GitHub Pages) */
async function saveFile(filename,data,mime){
  if(window.claude&&window.claude.use){try{const d=await window.claude.use('downloads');if(d){await d.save({filename,data});return true}}catch(e){if(e&&e.code==='declined')return true}return false}
  try{const url=URL.createObjectURL(new Blob([data],{type:mime||'text/plain'}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);return true}catch(e){return false}}
/* ---- problem bank (worksheets with answer key) ---- */
function ansHTML(q){if(q.k==='mc')return'<b>'+'ABCD'[q.a]+')</b> '+rc(q.opts[q.a]);if(q.k==='num')return M(nstr(q.ans));if(q.k==='nums')return M(q.ans.map(nstr).join(';  '));return q.fields.map(f=>M(strip(rc(f[0])).replace(/\s+/g,'')+' = '+nstr(f[1]))).join(', ')}
function bankItems(T,b){const out=[],seen=new Set();const order=shuffle(T.gens.map((_,i)=>i),T.id+b.v);for(let i=0;i<b.n;i++){const gi=order[i%order.length];const lvl=b.lvl||[1,1,2,2,3][Math.floor(i/b.n*5)];let q,key,tries=0;
  do{q=buildQ(T,gi,lvl,T.id+'|'+b.v+'|'+i+'|'+tries);key=strip(rc(q.p))+strip(q.eq?rc(q.eq):'')+(q.vis?strip(q.vis()):'');tries++}while(seen.has(key)&&tries<8);seen.add(key);out.push({q,lvl})}return out}
function qBody(q){return`<div>${rc(q.p)}</div>${q.eq?`<div class="bq-eq">${rc(q.eq)}</div>`:''}${q.vis?q.vis():''}${q.k==='mc'?`<div class="bq-opts">${q.opts.map((o,j)=>`<span><b>${'ABCD'[j]})</b> ${rc(o)}</span>`).join('')}</div>`:''}`}
function tBank(T,el){const b=S.bankSt=(S.bankSt&&S.bankSt.t===T.id)?S.bankSt:{t:T.id,n:20,lvl:0,v:'A',ans:false};const items=bankItems(T,b);
  el.innerHTML=`<div class="card stack" style="margin-bottom:16px"><div class="row" style="justify-content:space-between"><div class="row">
    <label class="row small" style="gap:6px"><b>${tx(L('Variant','Нұсқа','Вариант'))}</b><select class="field" id="bkV">${['A','B','C','D','E','F'].map(v=>`<option ${b.v===v?'selected':''}>${v}</option>`).join('')}</select></label>
    <label class="row small" style="gap:6px"><b>${tx(L('Problems','Есептер','Задач'))}</b><select class="field" id="bkN">${[10,15,20,30,40].map(v=>`<option ${b.n===v?'selected':''}>${v}</option>`).join('')}</select></label>
    <label class="row small" style="gap:6px"><b>${tx(U.level)}</b><select class="field" id="bkL"><option value="0">${tx(L('Mixed (easy → hard)','Аралас (жеңілден қиынға)','Смешанный (от лёгких к трудным)'))}</option>${[1,2,3].map(v=>`<option value="${v}" ${b.lvl===v?'selected':''}>${v}</option>`).join('')}</select></label>
    <label class="toggle"><input type="checkbox" id="bkA" ${b.ans?'checked':''}>${tx(L('Show answers','Жауаптарды көрсету','Показать ответы'))}</label></div>
    <button class="btn primary" id="bkDl">${tx(L('Download worksheet (HTML)','Жұмыс парағын жүктеу (HTML)','Скачать лист заданий (HTML)'))}</button></div>
    <p class="muted small">${tx(L('Each variant is fixed: the same letter always gives the same problems, so you can give different variants to neighbours. The downloaded file opens in any browser and prints with an answer key on the last page.','Әр нұсқа тұрақты: бір әріп әрқашан бірдей есептер береді, сондықтан көрші оқушыларға әртүрлі нұсқа беруге болады. Жүктелген файл кез келген браузерде ашылады, басып шығарғанда соңғы бетте жауаптар кілті болады.','Каждый вариант фиксирован: одна буква всегда даёт те же задачи, поэтому соседям можно дать разные варианты. Файл открывается в любом браузере и печатается с ключом ответов на последней странице.'))}</p><div id="bkOut"></div></div>
  <ol class="stack bank" style="gap:12px;padding-left:1.6em">${items.map(({q,lvl})=>`<li class="card flat stack" style="gap:8px"><div class="row" style="justify-content:space-between"><span class="obj">${q.o}</span><span class="lvl">${[1,2,3].map(l=>`<i class="${l<=lvl?'on':''}"></i>`).join('')}</span></div>${qBody(q)}${b.ans?`<div class="okbox"><span style="color:var(--ink)">${ansHTML(q)}</span></div>`:''}</li>`).join('')}</ol>`;
  const re=()=>tBank(T,el);$('#bkV').onchange=e=>{b.v=e.target.value;re()};$('#bkN').onchange=e=>{b.n=+e.target.value;re()};$('#bkL').onchange=e=>{b.lvl=+e.target.value;re()};$('#bkA').onchange=e=>{b.ans=e.target.checked;re()};
  $('#bkDl').onclick=()=>downloadWorksheet(T,b,items)}
async function downloadWorksheet(T,b,items){const title=`${tx(U.topic)} ${T.n}. ${tx(T.title)}`;
  const css=`body{font-family:'Times New Roman',serif;font-size:13pt;margin:18mm;color:#000}h1{font-size:15pt;margin:0 0 4px}.meta{display:flex;gap:24px;margin:10px 0 16px;flex-wrap:wrap}.meta span{border-bottom:1px solid #000;min-width:180px;display:inline-block}ol{padding-left:22px}li{margin-bottom:14px;page-break-inside:avoid}.math{white-space:nowrap}.math i{font-style:italic}.ov{border-top:1px solid #000;padding:0 1px}.fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;font-size:.86em;margin:0 2px}.fr>span:first-child{border-bottom:1px solid #000}.bq-eq{margin:6px 0 4px 10px;font-size:1.1em}.bq-opts{display:flex;gap:22px;flex-wrap:wrap;margin-top:4px}table{border-collapse:collapse;margin:6px 0}td,th{border:1px solid #000;padding:3px 8px}.key{page-break-before:always}.small{font-size:10pt;color:#333}`;
  const body=`<div class="small">${tx(SCHOOL)}</div><h1>${tx(L('Algebra 8','Алгебра 8','Алгебра 8'))} · ${esc(strip(title))} · ${tx(L('Variant','Нұсқа','Вариант'))} ${b.v}</h1>
   <div class="meta"><div>${tx(L('Name','Аты-жөні','ФИО'))}: <span></span></div><div>${tx(L('Class','Сынып','Класс'))}: <span style="min-width:60px"></span></div><div>${tx(L('Date','Күні','Дата'))}: <span style="min-width:90px"></span></div></div>
   <ol>${items.map(({q})=>`<li>${qBody(q)}</li>`).join('')}</ol>
   <div class="key"><h1>${tx(L('Answer key','Жауаптар кілті','Ключ ответов'))} · ${tx(L('Variant','Нұсқа','Вариант'))} ${b.v}</h1><ol>${items.map(({q})=>`<li>${ansHTML(q)}</li>`).join('')}</ol></div>`;
  const html=`<!doctype html><html lang="${S.lang}"><head><meta charset="utf-8"><title>${esc(strip(title))} ${b.v}</title><style>${css}</style></head><body>${body}</body></html>`;
  if(await saveFile(`algebra8-T${String(T.n).padStart(2,'0')}-${b.v}.html`,html,'text/html'))return;
  $('#bkOut').innerHTML=`<p class="note">${tx(L('Downloads are not available in this view. Turn on “Show answers” and copy the problems from the page instead.','Бұл көріністе жүктеу қолжетімсіз. «Жауаптарды көрсету» қосып, есептерді беттен көшіріңіз.','Скачивание здесь недоступно. Включите «Показать ответы» и скопируйте задачи со страницы.'))}</p>`}

/* ---- topic MYP page ---- */
function rubricTable(rows,crit){return`<div class="scroll"><table class="data rub"><thead><tr><th>${tx(L('Level','Деңгей','Уровень'))}</th><th>${tx(L('Task-specific descriptor','Тапсырмаға арналған дескриптор','Дескриптор для задания'))} · ${tx(L('criterion','критерий','критерий'))} ${crit}</th></tr></thead><tbody>
  <tr><td>0</td><td>${tx(L('The work does not reach any of the descriptors below.','Жұмыс төмендегі дескрипторлардың ешқайсысына жетпейді.','Работа не достигает ни одного из дескрипторов ниже.'))}</td></tr>${['1–2','3–4','5–6','7–8'].map((l,i)=>`<tr><td>${l}</td><td>${tx(rows[i])}</td></tr>`).join('')}</tbody></table></div>`}
function tMyp(T,el){const u=unitOf(T),k=T.task,key=T.id;const sa=S.self[key];
  el.innerHTML=`<div class="stack" style="gap:18px"><div class="card stack"><div class="row" style="justify-content:space-between"><span class="eyebrow">${tx(U.unit)} ${u.n} · ${tx(u.title)}</span><button class="btn sm" data-go="${u.id}">${tx(L('Unit planner','Бөлім жоспары','План раздела'))} →</button></div>
      <p class="soi">${tx(u.soi)}</p><div class="concepts"><span class="cc k">${tx(L('Key concept','Негізгі ұғым','Ключевое понятие'))}: ${tx(KC[u.kc])}</span>${T.rc.map(c=>`<span class="cc">${tx(RCN[c])}</span>`).join('')}<span class="cc">${tx(GC[u.gc].n)}</span></div></div>
    <div class="card stack"><h2>${tx(L('Inquiry questions for this topic','Осы тақырыптың зерттеу сұрақтары','Исследовательские вопросы темы'))}</h2><div class="iq">
      <div><span class="eyebrow">${tx(L('Factual','Фактілік','Фактический'))}</span><p>${rc(T.inq.f)}</p></div><div><span class="eyebrow">${tx(L('Conceptual','Тұжырымдамалық','Концептуальный'))}</span><p>${rc(T.inq.c)}</p></div><div><span class="eyebrow">${tx(L('Debatable','Пікірталас','Дискуссионный'))}</span><p>${rc(T.inq.d)}</p></div></div></div>
    <div class="mypgrid"><div class="card stack"><span class="eyebrow">ATL</span><p>${tx(T.atl)}</p></div><div class="card stack"><span class="eyebrow">${tx(L('IB learner profile','IB оқушы профилі','Профиль студента IB'))}</span><p><b>${tx(LP[T.lp].n)}</b> — ${tx(T.lpWhy)}</p></div>
      <div class="card stack"><span class="eyebrow">${tx(L('Assessed in this topic','Осы тақырыпта бағаланады','Оценивается в теме'))}</span><div class="row"><span class="crit">${k.crit}</span><b>${tx(CRIT[k.crit].n)}</b></div><p class="muted small">${tx(L('Formative task. The summative tasks are in the unit planner.','Қалыптастырушы тапсырма. Жиынтық тапсырмалар бөлім жоспарында.','Формативное задание. Суммативные задания — в плане раздела.'))}</p></div></div>
    <div class="card stack"><div class="row"><span class="crit">${k.crit}</span><h2>${tx(k.title)}</h2></div><p>${rc(k.brief)}</p><ol class="stack" style="gap:6px">${k.steps.map(s=>`<li>${rc(s)}</li>`).join('')}</ol>${rubricTable(k.rubric,k.crit)}
      <div class="stack" style="gap:8px"><b>${tx(L('Self-assessment: which level does your work reach?','Өзін-өзі бағалау: жұмысыңыз қай деңгейге жетеді?','Самооценка: какого уровня достигает ваша работа?'))}</b><div class="selfas">${[0,1,2,3,4,5,6,7,8].map(l=>`<button data-sa="${l}" aria-pressed="${sa===l}">${l}</button>`).join('')}</div>
      <p class="muted small">${tx(L('Saved on this device. Compare it with the level your teacher gives.','Осы құрылғыда сақталады. Мұғалім қойған деңгеймен салыстырыңыз.','Сохраняется на этом устройстве. Сравните с уровнем, который поставит учитель.'))}</p></div></div>
    <div class="card stack"><h2>${tx(L('Reflection','Рефлексия','Рефлексия'))}</h2><ul class="stack" style="gap:6px"><li>${tx(L('What did I already know about this topic, and what is new?','Бұл тақырып туралы не білдім, не жаңа болды?','Что я уже знал(а) по теме, а что новое?'))}</li><li>${tx(L('Which strategy worked best for me, and why?','Маған қай стратегия тиімді болды және неге?','Какая стратегия сработала лучше всего и почему?'))}</li><li>${rc(T.inq.c)}</li></ul></div></div>`;
  $$('[data-sa]',el).forEach(b=>b.onclick=()=>{S.self[key]=+b.dataset.sa;save();$$('[data-sa]',el).forEach(x=>x.setAttribute('aria-pressed',x===b))})}

/* ================= AI TUTOR ================= */
let sampleFn=null;
(async()=>{try{if(window.claude&&window.claude.use)sampleFn=await window.claude.use('sample')}catch(e){sampleFn=null}if(!sampleFn)S.tutor.live=false;if(!$('#tutor').hidden)renderTutor(true)})();
function renderTutor(keep){const t=S.tutor,el=$('#tutor');const T=S.ctx.topic;
  const st=t.live===true?['live',U.live]:t.live===false?['',U.offline]:['',U.checking];
  const chips=[['hint',L('Hint for my task','Тапсырмама кеңес','Подсказка к заданию')],['rule',L('Explain the main rule','Негізгі ережені түсіндір','Объясни главное правило')],['why',L('Why does it work?','Неге солай?','Почему так?')]];
  el.innerHTML=`<header><h3>${tx(U.tutor)}${T?` · ${T.n}`:''}</h3><button class="iconbtn" id="tClose" aria-label="close">✕</button></header><div class="tstatus ${st[0]}">${tx(st[1])}</div>
    <div class="tmsgs" id="tMsgs"><div class="msg bot">${esc(tx(L('Hi! Open a topic and ask me anything about it. I give hints step by step and let you find the answer yourself.','Сәлем! Тақырыпты ашып, ол туралы сұрақ қойыңыз. Мен кеңесті қадамдап беремін, жауапты өзіңіз табасыз.','Привет! Откройте тему и задайте вопрос. Я даю подсказки по шагам, а ответ вы находите сами.')))}</div>${t.msgs.map(m=>`<div class="msg ${m.r}">${esc(m.text)}</div>`).join('')}</div>
    <div class="tchips">${chips.map(([k,l])=>`<button class="chip" data-tc="${k}">${tx(l)}</button>`).join('')}</div>
    <form class="tform" id="tForm"><input id="tIn" placeholder="${esc(tx(U.ask))}" autocomplete="off" aria-label="${esc(tx(U.ask))}"><button class="btn primary" ${t.busy?'disabled':''}>${tx(U.send)}</button></form>`;
  $('#tClose').onclick=()=>{el.hidden=true;$('#fab').hidden=false};
  $$('[data-tc]',el).forEach(b=>b.onclick=()=>tutorAsk(b.textContent,b.dataset.tc));
  $('#tForm').onsubmit=e=>{e.preventDefault();const v=$('#tIn').value.trim();if(v)tutorAsk(v,null)};
  const box=$('#tMsgs');box.scrollTop=box.scrollHeight;if(!keep)$('#tIn').focus()}
$('#fab').onclick=()=>{$('#tutor').hidden=false;$('#fab').hidden=true;renderTutor()};
const strip=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/\s+/g,' ').trim()};
function localAnswer(text,chip){const t=S.tutor,T=S.ctx.topic,q=S.ctx.q;
  if(q&&(chip==='hint'||chip==='why'||/hint|кеңес|подсказ|help|көмек|помог/i.test(text))){const key=S.pq&&S.pq.seed;if(t.hkey!==key){t.hkey=key;t.hl=0}else t.hl++;
    if(t.hl<q.h.length)return(t.hl===0?tx(L('Let us think together. ','Бірге ойланайық. ','Подумаем вместе. ')):'')+strip(rc(q.h[t.hl]))+(t.hl<q.h.length-1?' '+tx(L('(Ask again for a stronger hint.)','(Күштірек кеңес үшін қайта сұраңыз.)','(Спросите ещё раз — подсказка будет сильнее.)')):'');
    return tx(L('Here is the full explanation: ','Толық түсіндірме: ','Полное объяснение: '))+strip(rc(q.ex))}
  if(T&&T.id==='t05'){const m=String(text).match(/[0-9x()\s+\-−*/^.,²хХ]+=[0-9x()\s+\-−*/^.,²хХ]+/i);if(m){const r=analyze(m[0]);if(r.ok)return tx(L(`Move everything to the left and simplify: ${strip(polyHTML(r.a??0,r.b??0,r.c??0))}. Now look at a: is it 0? Then check b and c.`,`Бәрін сол жаққа көшіріп, ықшамдаңыз: ${strip(polyHTML(r.a??0,r.b??0,r.c??0))}. Енді a-ға қараңыз: ол 0 ме? Содан соң b мен c-ны тексеріңіз.`,`Перенесите всё влево и упростите: ${strip(polyHTML(r.a??0,r.b??0,r.c??0))}. Посмотрите на a: оно равно 0? Затем проверьте b и c.`))}}
  if(T){const i=(t.ri=(t.ri||0)+1)%T.rules.length;return strip(rc(T.rules[chip==='rule'?0:i]))+' '+tx(L('Can you give your own example of this?','Осыған өз мысалыңызды келтіре аласыз ба?','Сможете привести свой пример?'))}
  return tx(L('Open a topic (Course map → a topic card) and ask again — I will use that topic and your current task.','Тақырыпты ашып (Курс картасы → тақырып), қайта сұраңыз — мен сол тақырып пен ағымдағы тапсырманы қолданамын.','Откройте тему (Карта курса → карточка темы) и спросите снова — я учту тему и текущее задание.'))}
async function tutorAsk(text,chip){const t=S.tutor;if(t.busy)return;t.msgs.push({r:'me',text});const fb=localAnswer(text,chip);
  if(sampleFn&&t.live!==false){t.busy=true;const m={r:'bot',text:'…'};t.msgs.push(m);renderTutor(true);const T=S.ctx.topic,q=S.ctx.q;
    const lang={en:'English',kk:'Kazakh (Қазақ тілі)',ru:'Russian'}[S.lang];
    const hist=t.msgs.filter(x=>x!==m).slice(-8).map(x=>(x.r==='me'?'Student: ':'Tutor: ')+x.text).join('\n');
    const prompt=`You are a friendly Grade 8 algebra tutor at a Kazakhstan lyceum that follows the national curriculum and the IB MYP (Year 4).
Reply ONLY in ${lang}. Simple words, at most 4 short sentences, plain-text math (x², √, ≠, ≤). Be Socratic: ask one guiding question; each hint slightly stronger than the last; reveal a final answer only after the student has tried or asked for hints at least twice. Stay on the topic.
Topic: ${T?tx(T.title)+' ('+T.obj.map(o=>o[0]).join(', ')+')':'none chosen'}. Key rules: ${T?T.rules.map(r=>strip(rc(r))).join(' | '):''}
${q?`Current task: ${S.ctx.qtext}\nApp's verified hints (in order): ${q.h.map(h=>strip(rc(h))).join(' | ')}\nApp's verified solution (do not contradict, do not reveal early): ${strip(rc(q.ex))}`:''}
Conversation:\n${hist}\nWrite the tutor's next reply.`;
    try{const res=await sampleFn(prompt,{modelTier:'quick',cache:false,onText:({text})=>{m.text=text;const b=$$('#tMsgs .msg.bot');if(b.length)b[b.length-1].textContent=text}});m.text=res.text||fb;t.live=true}
    catch(e){m.text=(e&&e.text)||fb;if(t.live!==true)t.live=false}t.busy=false;renderTutor(true)}
  else{t.msgs.push({r:'bot',text:fb});renderTutor(true)}}

/* ================= boot ================= */
function boot(){
  $$('.lang button').forEach(b=>b.onclick=()=>{S.lang=b.dataset.lang;store.set('lang',S.lang);rerender()});
  $('#brand').onclick=()=>go('home');
  const th=store.get('theme');if(th)document.documentElement.dataset.theme=th;
  $('#themeBtn').onclick=()=>{const r=document.documentElement;const dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=dark?'light':'dark';store.set('theme',r.dataset.theme);rerender()};
  window.addEventListener('hashchange',route);route()}
