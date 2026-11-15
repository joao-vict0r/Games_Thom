const MAP=[
"###################",
"#........#........#",
"#o##.###.#.###.##o#",
"#.................#",
"#.##.#.#####.#.##.#",
"#....#...#...#....#",
"####.### # ###.####",
"   #.#       #.#   ",
"####.# ##-## #.####",
"    .  #   #  .    ",
"####.# ##### #.####",
"   #.#       #.#   ",
"####.# ##### #.####",
"#........#........#",
"#.##.###.#.###.##.#",
"#o.#.....P.....#.o#",
"##.#.#.#####.#.#.##",
"#....#...#...#....#",
"#.######.#.######.#",
"#.................#",
"###################"];
const W=19,H=21,T=24,cv=document.getElementById('c'),g=cv.getContext('2d'),D=[[0,-1],[-1,0],[0,1],[1,0]];
const FL=['#a37bff','#5a96ff','#4cd98a','#ff5470','#ff7ac8'];
const $=id=>document.getElementById(id);
let ac,mute=false,alertT=0,fk=-1;
if(!g.roundRect)g.roundRect=function(x,y,w,h){this.rect(x,y,w,h)};
let G,P,M,left,score,lives,lvl,st,msg,tt,fear,combo,want,dyT=0,face=1,hk='',tm=0,last=0,hi=0;
try{hi=+localStorage.getItem('capiHi')||0}catch(e){}
const ok=(c,r)=>r>=0&&r<H&&MAP[r][(c+W)%W]!=='#'&&MAP[r][(c+W)%W]!=='-';
const ci=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()};

function au(){if(!ac)try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}if(ac&&ac.state==='suspended')ac.resume()}
function tgl(){mute=!mute;$('mu').textContent=mute?'🔇':'🔊'}
function snd(f0,f1,d,ty,vol,t0,vib){
  if(!ac||mute)return;
  const t=ac.currentTime+(t0||0),o=ac.createOscillator(),v=ac.createGain();
  o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);
  v.gain.setValueAtTime(vol,t);v.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(v);v.connect(ac.destination);o.start(t);o.stop(t+d);
  if(vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=vib;lg.gain.value=70;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+d)}
}
const grito=()=>{snd(1000,1500,.1,'triangle',.3);snd(1100,1800,.1,'triangle',.3,.13);snd(2000,300,.8,'sawtooth',.18,.28,26)};
const jingle=(a,vol)=>a.forEach((f,i)=>snd(f,f,.12,'square',vol,i*.08));
function lvlInit(){
  G=MAP.map(r=>[...r.replace('P',' ')]);
  left=0;G.forEach(r=>r.forEach(h=>{if(h==='.'||h==='o')left++}));
  place();
}
function place(){
  const k=Math.pow(.88,lvl-1),rl=[1.5,6,11,16],pc=[9,8,10,8];
  P={c:9,r:15,dx:0,dy:0,p:0,s:6.4};want=[0,0];fear=0;combo=0;tt=0;
  M=[0,1,2,3].map(i=>({i,t:i%2?'jacare':'onca',c:pc[i],r:9,dx:0,dy:0,p:0,a:0,s:5,st:'den',rel:rl[i]*k}));
}
function newGame(){score=0;lives=3;lvl=1;lvlInit();st='ready';msg='PRONTA?'}
function go(){au();if(st==='ready')st='play';else if(st==='over')newGame()}

const KM={ArrowUp:0,KeyW:0,ArrowLeft:1,KeyA:1,ArrowDown:2,KeyS:2,ArrowRight:3,KeyD:3};
addEventListener('keydown',e=>{
  if(e.code in KM){want=D[KM[e.code]];e.preventDefault();go()}
  else if(e.code==='Space'||e.code==='Enter'){e.preventDefault();go()}
  else if(e.code==='KeyM')tgl();
});
let sx=null,sy=0;
cv.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;go()});
cv.addEventListener('pointermove',e=>{
  if(sx===null)return;
  const a=e.clientX-sx,b=e.clientY-sy;
  if(Math.max(Math.abs(a),Math.abs(b))>20){want=Math.abs(a)>Math.abs(b)?D[a<0?1:3]:D[b<0?0:2];sx=e.clientX;sy=e.clientY}
});
addEventListener('pointerup',()=>{sx=null});
addEventListener('pointercancel',()=>{sx=null});

function rev(e){e.c=(e.c+e.dx+W)%W;e.r+=e.dy;e.dx=-e.dx;e.dy=-e.dy;e.p=1-e.p}
function mv(e,dt,pick,cb){
  if(!e.dx&&!e.dy){[e.dx,e.dy]=pick(e);if(!e.dx&&!e.dy)return}
  e.p+=e.s*dt;
  while(e.p>=1){
    e.c=(e.c+e.dx+W)%W;e.r+=e.dy;e.p-=1;
    if(cb)cb(e);
    [e.dx,e.dy]=pick(e);
    if(!e.dx&&!e.dy){e.p=0;break}
  }
}
function pickP(e){
  if((want[0]||want[1])&&ok(e.c+want[0],e.r+want[1]))return want;
  return ok(e.c+e.dx,e.r+e.dy)?[e.dx,e.dy]:[0,0];
}
function tg(m){
  if(m.i===1)return[P.c+P.dx*4,P.r+P.dy*4];
  if(m.i===2&&Math.hypot(m.c-P.c,m.r-P.r)<6)return[1,19];
  return[P.c,P.r];
}
function pickM(m){
  if(m.st==='den')return[0,0];
  if(m.st==='exit'){
    if(m.r===9)return m.c<9?[1,0]:m.c>9?[-1,0]:[0,-1];
    if(m.r>7)return[0,-1];
    m.st='out';m.dx=0;m.dy=-1;
  }
  let o=D.filter(d=>ok(m.c+d[0],m.r+d[1])&&(d[0]!==-m.dx||d[1]!==-m.dy));
  if(!o.length)o=[[-m.dx,-m.dy]];
  if(m.st==='fright'||(m.i===3&&Math.random()<.3))return o[Math.random()*o.length|0];
  const t=tg(m);let b=o[0],bd=1e9;
  for(const d of o){const x=m.c+d[0]-t[0],y=m.r+d[1]-t[1],q=x*x+y*y;if(q<bd){bd=q;b=d}}
  return b;
}
function eat(){
  const h=G[P.r][P.c];
  if(h!=='.'&&h!=='o')return;
  G[P.r][P.c]=' ';left--;
  if(h==='.'){score+=10;snd(score%20?660:540,660,.05,'square',.03)}
  else{score+=50;fear=Math.max(3,8-lvl);combo=0;alertT=1.6;jingle([523,659,784,1047,1319],.1);snd(300,1500,.35,'sawtooth',.08);for(const m of M)if(m.st==='out'){m.st='fright';rev(m)}}
}
function upd(dt){
  tt+=dt;
  if(fear>0&&(fear-=dt)<=0)M.forEach(m=>{if(m.st==='fright')m.st='out'});
  if((P.dx&&want[0]===-P.dx)||(P.dy&&want[1]===-P.dy))rev(P);
  mv(P,dt,pickP,eat);
  if(P.dx)face=P.dx;
  const px=P.c+P.dx*P.p,py=P.r+P.dy*P.p;
  for(const m of M){
    if(m.st==='den'&&tt>=m.rel)m.st='exit';
    m.s=m.st==='fright'?3:m.st==='exit'?3.5:Math.min(5+lvl*.25,6.3);
    mv(m,dt,pickM);
    if(m.dx||m.dy)m.a=Math.atan2(m.dy,m.dx);
    if(m.st==='den')continue;
    if(Math.hypot(m.c+m.dx*m.p-px,m.r+m.dy*m.p-py)<.7){
      if(m.st==='fright'){score+=200*(1<<combo++);snd(300,1300,.22,'square',.12);Object.assign(m,{c:9,r:9,dx:0,dy:0,p:0,st:'den',rel:tt+2.5})}
      else{st='dying';dyT=0;alertT=0;grito();return}
    }
  }
  if(score>hi)hi=score;
  if(!left){lvl++;jingle([784,988,1175,1568],.12);lvlInit();st='ready';msg='NÍVEL '+lvl}
}

function bt(x,y,s,f){ci(x,y,3.6*s,FL[f]);ci(x-1.1,y-1.2,1.1*s,'rgba(255,255,255,.7)')}
function txt(s,y,z,c){g.fillStyle=c;g.font='900 '+z+'px Fredoka,"Trebuchet MS",system-ui,sans-serif';g.textAlign='center';g.fillText(s,228,y)}
function capi(){
  const X=(P.c+P.dx*P.p)*T+12,Y=(P.r+P.dy*P.p)*T+12,s=st==='dying'?Math.max(.02,1-dyT/1.2):1;
  const w=(P.dx||P.dy)&&st==='play'?Math.sin(tm*18)*1.5:0;
  g.save();g.translate(X,Y);g.scale(face*s,s);
  if(fear>0)ci(0,0,16,'rgba(255,196,40,.3)');
  g.fillStyle='#6b4326';g.fillRect(-7,6+w,4,4);g.fillRect(3,6-w,4,4);
  g.fillStyle='#b27b4b';g.beginPath();g.ellipse(0,0,11,9,0,0,7);g.fill();
  g.fillStyle='#8a5a34';g.fillRect(5,-5,8,9);
  ci(-2,-8,2.6,'#8a5a34');
  g.fillStyle='#2b1a10';g.fillRect(11,-3,2,3);
  ci(3,-4,1.7,'#000');
  g.restore();
}
function mon(m){
  const X=(m.c+m.dx*m.p)*T+12,Y=(m.r+m.dy*m.p)*T+12,fr=m.st==='fright';
  const fc=fr?((fear<2&&((fear*6)|0)%2)?'#fff':'#2a3cff'):null;
  g.save();g.translate(X,Y);
  if(m.t==='onca'){
    const c=fc||'#e6a21e';
    ci(-7,-8,3.2,c);ci(7,-8,3.2,c);ci(0,0,10,c);
    if(!fr)for(const[a,b]of[[-4,4],[4,5],[7,-1],[-7,0],[0,8]])ci(a,b,1.7,'#1a0f05');
    ci(-4,-3,3,'#fff');ci(4,-3,3,'#fff');
    ci(-4+m.dx*1.2,-3+m.dy*1.2,1.5,'#000');ci(4+m.dx*1.2,-3+m.dy*1.2,1.5,'#000');
    g.fillStyle='#e8788a';g.fillRect(-1.5,1,3,2);
  }else{
    const c=fc||'#3c9a3c';
    g.rotate(m.a);
    g.fillStyle=c;g.fillRect(5,-4,11,8);
    ci(0,0,9,c);
    g.fillStyle='#e8f5d0';
    for(let i=0;i<3;i++){g.fillRect(8+i*3,-4,1.5,2);g.fillRect(8+i*3,2,1.5,2)}
    ci(2,-6,2.6,'#ffd84a');ci(2,6,2.6,'#ffd84a');
    g.fillStyle='#000';g.fillRect(2.5,-7.5,1.5,3);g.fillRect(2.5,4.5,1.5,3);
  }
  g.restore();
}
function big(X,Y){
  const p=Math.sin(tm*6);
  g.save();g.translate(X,Y+p*1.2);
  ci(0,0,12+p,'rgba(255,196,40,.28)');
  g.fillStyle='#111';g.fillRect(-2.5,-11,5,3);
  g.fillStyle='rgba(220,230,255,.6)';g.beginPath();g.moveTo(-2,-8);g.lineTo(2,-8);g.lineTo(5,-3);g.lineTo(-5,-3);g.fill();
  g.fillStyle='#4a2200';g.fillRect(-5,-3,10,13);
  g.fillStyle='#f2b705';g.fillRect(-5,1,10,8);
  g.fillStyle='#fff';g.fillRect(-3.5,2.2,7,2.2);
  g.fillStyle='#1b2bb0';g.fillRect(-3.5,4.4,7,1);
  ci(0,7,1.5,'#b27b4b');
  g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-4,-2,1.2,5);
  g.globalAlpha=.5+.5*p;g.fillStyle='#fff';g.fillRect(6.5,-11,1,5);g.fillRect(4.5,-9,5,1);g.globalAlpha=1;
  g.restore();
}
function draw(){
  g.fillStyle='#04171c';g.fillRect(0,0,456,504);
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){
    const h=MAP[r][c],X=c*T,Y=r*T,d=G[r][c];
    if(h==='#'){g.beginPath();g.roundRect(X+1.5,Y+1.5,T-3,T-3,7);g.fillStyle='#0b3a36';g.fill();g.lineWidth=1.6;g.strokeStyle='#3fd99a';g.stroke();g.beginPath();g.roundRect(X+6,Y+6,T-12,T-12,3);g.fillStyle='#0f4d44';g.fill()}
    else if(h==='-'){g.fillStyle='#f0a02c';g.fillRect(X+1,Y+9,T-2,5)}
    else if(d==='.')bt(X+12,Y+12,1,(c+r*2)%5);
  }
  G.forEach((row,r)=>row.forEach((h,c)=>{if(h==='o')big(c*T+12,r*T+12)}));
  g.fillStyle='#4f8f82';g.font='700 8px Fredoka,"Trebuchet MS",sans-serif';g.textAlign='center';g.fillText('THOM',228,9*T+21);
  if(st!=='dying')for(const m of M)mon(m);
  capi();
  if(alertT>0){
    if(alertT>1.35){g.fillStyle='rgba(255,200,40,.22)';g.fillRect(0,0,456,504)}
    g.save();g.globalAlpha=Math.min(1,alertT*2);g.textAlign='center';g.lineJoin='round';
    g.font='900 '+(36+Math.sin(tm*20)*3)+'px Fredoka,"Trebuchet MS",system-ui,sans-serif';
    g.lineWidth=9;g.strokeStyle='#1b2bb0';g.strokeText('SUPER THOM!',228,262);
    g.fillStyle='#fff';g.fillText('SUPER THOM!',228,262);g.restore();
  }
  if(st==='ready'||st==='over'){
    g.fillStyle='#000a';g.fillRect(60,236,336,86);
    txt(st==='over'?'FIM DE JOGO':msg,276,30,'#fff');
    txt(st==='over'?'toque ou aperte Enter':'toque ou use as setas',304,15,'#7fe8c4');
  }
  const f=fear>0?Math.ceil(fear):0;
  if(f!==fk){fk=f;$('bar').className=f?'on':'';$('tip').textContent=f?'⚡ SUPER CAPILÉ THOM! Capture os bichos!':'Pegue todos os capilés!';$('cd').textContent=f||''}
  const k=score+'|'+lives+'|'+lvl+'|'+hi;
  if(k!==hk){hk=k;$('sc').textContent=score;$('lv').textContent=lvl;$('hs').textContent=hi;$('vd').textContent='🦫'.repeat(Math.max(lives,0))}
}
function loop(t){
  const dt=Math.min((t-last)/1000||0,.05);last=t;tm=t/1000;if(alertT>0)alertT-=dt;
  if(st==='play')upd(dt);
  else if(st==='dying'){
    dyT+=dt;
    if(dyT>1.3){
      if(--lives>0){place();st='ready';msg='PRONTA?'}
      else{st='over';try{localStorage.setItem('capiHi',hi)}catch(e){}}
    }
  }
  draw();requestAnimationFrame(loop);
}

const fsButton=$('fs');
function isFullscreen(){return Boolean(document.fullscreenElement||document.webkitFullscreenElement)}
function updateFullscreenButton(){
  if(!fsButton)return;
  const active=isFullscreen();
  fsButton.textContent='⛶';
  fsButton.title=active?'Sair da tela inteira':'Tela inteira';
  fsButton.setAttribute('aria-label',active?'Sair da tela inteira':'Entrar em tela inteira');
  fsButton.setAttribute('aria-pressed',String(active));
}
async function toggleFullscreen(){
  const root=document.documentElement;
  try{
    if(isFullscreen()){
      if(document.exitFullscreen)await document.exitFullscreen();
      else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
      return;
    }
    if(root.requestFullscreen)await root.requestFullscreen({navigationUI:'hide'});
    else if(root.webkitRequestFullscreen)root.webkitRequestFullscreen();
    else{
      fsButton.disabled=true;
      fsButton.textContent='Tela inteira indisponível';
    }
  }catch(e){
    updateFullscreenButton();
  }
}
$('mu').onclick=e=>{tgl();e.currentTarget.blur()};
if(fsButton){
  fsButton.addEventListener('click',toggleFullscreen);
  document.addEventListener('fullscreenchange',updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange',updateFullscreenButton);
  updateFullscreenButton();
}
newGame();requestAnimationFrame(loop);
