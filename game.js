// I.C.E. - ice.gritboxops.com - A Chill Dystopian Shooter
// ─── SUPABASE CONFIG ─────────────────────────────
// Set these to your Supabase project URL and anon key
const SUPABASE_URL = 'https://jnyzlqlxcdsnsfhaecxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpueXpscWx4Y2RzbnNmaGFlY3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDMxMDksImV4cCI6MjA4OTU3OTEwOX0.TDap2EkiLetLX3wB8UUzc-XFycJ8OkmwSFFYCNi63Z8';
const SB_HEADERS = {'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=representation'};
// ─────────────────────────────────────────────────
const W=640,H=480,MAP_S=24,FOV=Math.PI/3,HALF_FOV=FOV/2;
const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
canvas.width=Math.min(W,window.innerWidth);canvas.height=Math.min(H,window.innerHeight);
// MSP Airport map: 1=glass wall, 2=concrete pillar, 3=terminal wall, 4=check-in counter, 5=gate desk
const MAP=[
3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
3,0,0,4,4,4,4,0,0,0,0,0,0,0,0,0,4,4,4,4,0,0,0,3,
3,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,3,
3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
1,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,
1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,1,
1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,
3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
3,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,3,
3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
3,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,3,
3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
1,1,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1,1,
1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,1,
1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];
function mapAt(x,y){return(x>=0&&x<MAP_S&&y>=0&&y<MAP_S)?MAP[y*MAP_S+x]:3;}
// Wall colors - DOOM style dark airport
const WC={
  1:{l:'#2a4a5a',d:'#1a3040'}, // glass walls - dark blue-green
  2:{l:'#5a5a5a',d:'#3a3a3a'}, // concrete pillars - dark grey
  3:{l:'#6a5a48',d:'#4a3a28'}, // terminal walls - dark brown
  4:{l:'#2a2a35',d:'#1a1a25'}, // check-in counters - near black
  5:{l:'#3a3a45',d:'#2a2a35'}  // gate desks - dark blue-grey
};
// ─── EFFECTS ─────────────────────────────────────
let screenShake=0;let particles=[];let scorePopups=[];
function addParticles(x,y,color,count){
  for(let i=0;i<count;i++){
    particles.push({x,y,vx:(Math.random()-0.5)*3,vy:(Math.random()-0.5)*3,
      life:20+Math.random()*20,color,size:2+Math.random()*3});
  }
}
function addScorePopup(x,y,text,color){
  scorePopups.push({x,y,text,color:color||'#ff0',life:60,vy:-1.5});
}
function drawEffects(){
  // particles
  for(let i=particles.length-1;i>=0;i--){
    let p=particles[i];p.x+=p.vx;p.y+=p.vy;p.life--;
    if(p.life<=0){particles.splice(i,1);continue;}
    ctx.globalAlpha=p.life/40;
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x,p.y,p.size,p.size);
  }
  // score popups
  for(let i=scorePopups.length-1;i>=0;i--){
    let s=scorePopups[i];s.y+=s.vy;s.life--;
    if(s.life<=0){scorePopups.splice(i,1);continue;}
    ctx.globalAlpha=s.life/60;
    ctx.fillStyle=s.color;ctx.font='bold 16px monospace';
    ctx.fillText(s.text,s.x,s.y);
  }
  ctx.globalAlpha=1;
}
function drawScanlines(){
  ctx.fillStyle='rgba(0,0,0,0.12)';
  for(let y=0;y<H;y+=2)ctx.fillRect(0,y,W,1);
  // heavy vignette - DOOM CRT feel
  let vg=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(0.7,'rgba(0,0,0,0.15)');vg.addColorStop(1,'rgba(0,0,0,0.6)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}
function drawMinimap(){
  let ms=3,ox=W-MAP_S*ms-8,oy=8;
  ctx.globalAlpha=0.6;
  ctx.fillStyle='#000';ctx.fillRect(ox-1,oy-1,MAP_S*ms+2,MAP_S*ms+2);
  for(let y=0;y<MAP_S;y++)for(let x=0;x<MAP_S;x++){
    let m=mapAt(x,y);
    if(m===0)ctx.fillStyle='#111';
    else if(m===1)ctx.fillStyle='#1a3040';
    else if(m===4||m===5)ctx.fillStyle='#1a1a25';
    else ctx.fillStyle='#3a2a1a';
    ctx.fillRect(ox+x*ms,oy+y*ms,ms,ms);
  }
  // player dot
  ctx.fillStyle='#0f0';
  ctx.fillRect(ox+(px*ms)|0,oy+(py*ms)|0,2,2);
  // player direction
  ctx.strokeStyle='#0f0';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ox+px*ms,oy+py*ms);
  ctx.lineTo(ox+px*ms+Math.cos(pa)*6,oy+py*ms+Math.sin(pa)*6);ctx.stroke();
  // enemy dots
  for(let e of enemies){
    ctx.fillStyle=e.passive?'#440':'#f00';
    ctx.fillRect(ox+(e.x*ms)|0,oy+(e.y*ms)|0,2,2);
  }
  ctx.globalAlpha=1;
}
// Player state
let px=2.5,py=2.5,pa=0,pitch=0,hp=100,ammo=42,score=0,wave=1,running=false,paused=false;
let keys={};let musicOn=true;
// Enemies
let enemies=[];let projectiles=[];let msgTimer=0;let msgText='';
const HIGH_QUOTES=["hehe...","duuude...","got any snacks?","wait what was I doing?","is that a taco?","I love everyone","*giggles*","bro...the colors..."];
const ENEMY_TYPES={
  ice:{name:'ICE Agent',color:'#1a1a2e',accent:'#0044aa',badge:'ICE',yell:'I.C.E.!',hp:4,speed:1.2,size:1},
  sheriff:{name:'Sheriff Deputy',color:'#8B6914',accent:'#CD853F',badge:'STAR',yell:'FREEZE!',hp:4,speed:1.0,size:1},
  bovino:{name:'BOVINO',color:'#5C3317',accent:'#8B4513',badge:'BULL',yell:'MOOOO!',hp:20,speed:1.8,size:2},
  birdleg:{name:'Bird-Legged Ho',color:'#AA336A',accent:'#FF69B4',badge:'BIRD',yell:'SQUAWK!',hp:20,speed:2.2,size:1.5}
};
function spawnEnemy(type,x,y){
  let t=ENEMY_TYPES[type];
  enemies.push({type,x,y,hp:t.hp,maxHp:t.hp,hits:0,angle:Math.random()*Math.PI*2,
    speed:t.speed,size:t.size,attackTimer:0,wobble:0,passive:false,yelling:0,yellText:''});
}
function spawnWave(){
  let count=2+wave*2;let spots=[];
  for(let i=0;i<MAP_S;i++)for(let j=0;j<MAP_S;j++){
    if(MAP[j*MAP_S+i]===0){let dx=i+0.5-px,dy=j+0.5-py;if(dx*dx+dy*dy>25)spots.push([i+0.5,j+0.5]);}
  }
  for(let i=spots.length-1;i>0;i--){let j=Math.random()*i|0;[spots[i],spots[j]]=[spots[j],spots[i]];}
  let si=0;
  for(let i=0;i<count&&si<spots.length;i++){
    spawnEnemy('ice',spots[si][0],spots[si][1]);si++;
    if(si<spots.length){spawnEnemy('sheriff',spots[si][0],spots[si][1]);si++;}
  }
  if(wave%3===0&&si<spots.length-1){
    spawnEnemy('bovino',spots[si][0],spots[si][1]);si++;
    spawnEnemy('birdleg',spots[si][0],spots[si][1]);si++;
    showMsg('BOSS WAVE!\nBOVINO & BIRD-LEGGED HO APPEAR!');
  } else showMsg('WAVE '+wave);
}
function showMsg(t){msgText=t;msgTimer=180;document.getElementById('message').style.display='block';document.getElementById('message').innerText=t;}
// Raycaster
function castRays(){
  let strips=[];
  for(let i=0;i<W;i++){
    let ra=pa-HALF_FOV+FOV*(i/W);
    let sin_a=Math.sin(ra),cos_a=Math.cos(ra);
    let dist=0,hit=0,side=0;
    // DDA
    let mapX=px|0,mapY=py|0;
    let dDistX=Math.abs(1/cos_a)||1e10,dDistY=Math.abs(1/sin_a)||1e10;
    let stepX,stepY,sideDistX,sideDistY;
    if(cos_a<0){stepX=-1;sideDistX=(px-mapX)*dDistX;}
    else{stepX=1;sideDistX=(mapX+1-px)*dDistX;}
    if(sin_a<0){stepY=-1;sideDistY=(py-mapY)*dDistY;}
    else{stepY=1;sideDistY=(mapY+1-py)*dDistY;}
    for(let d=0;d<20;d++){
      if(sideDistX<sideDistY){sideDistX+=dDistX;mapX+=stepX;side=0;}
      else{sideDistY+=dDistY;mapY+=stepY;side=1;}
      let m=mapAt(mapX,mapY);
      if(m>0){hit=m;dist=side===0?(mapX-px+(1-stepX)/2)/cos_a:(mapY-py+(1-stepY)/2)/sin_a;break;}
    }
    dist*=Math.cos(ra-pa); // fisheye fix
    strips.push({dist:Math.max(dist,0.1),hit,side});
  }
  return strips;
}
// Draw DOOM-style ceiling and floor
function drawBackground(){
  let horizon=H/2+pitch;
  // ceiling - dark, oppressive
  let grd=ctx.createLinearGradient(0,0,0,horizon);
  grd.addColorStop(0,'#0a0a0a');grd.addColorStop(0.4,'#141410');grd.addColorStop(0.8,'#1e1a14');grd.addColorStop(1,'#28221a');
  ctx.fillStyle=grd;ctx.fillRect(0,0,W,horizon);
  // dim emergency lights on ceiling
  ctx.fillStyle='rgba(180,120,60,0.15)';
  for(let i=0;i<3;i++){ctx.fillRect(W*0.15+i*W*0.3,2,W*0.06,Math.min(6,horizon*0.03));}
  // floor - dark concrete/tile
  let grd2=ctx.createLinearGradient(0,horizon,0,H);
  grd2.addColorStop(0,'#28221a');grd2.addColorStop(0.2,'#221c14');grd2.addColorStop(0.6,'#1a1610');grd2.addColorStop(1,'#12100c');
  ctx.fillStyle=grd2;ctx.fillRect(0,horizon,W,H-horizon);
  // subtle floor edge line
  ctx.fillStyle='rgba(180,140,80,0.06)';
  ctx.fillRect(0,horizon,W,1);
}
// Draw DOOM-style textured walls
function drawWalls(strips){
  for(let i=0;i<strips.length;i++){
    let s=strips[i];
    let lineH=Math.min(H*2,(H/s.dist)|0);
    let drawStart=(H-lineH)/2+pitch;
    let c=WC[s.hit]||WC[3];
    // DOOM-style distance shading - aggressive falloff into darkness
    let shade=Math.max(0.08,1-s.dist/8);
    // Base wall color
    ctx.fillStyle=s.side?c.d:c.l;
    ctx.globalAlpha=shade;
    ctx.fillRect(i,drawStart,1,lineH);
    // Procedural texture overlay - DOOM-style brick/panel patterns
    let texStep=lineH/64; // normalize texture to 64 texels tall
    if(s.hit===1){
      // Glass security walls - dark with wire mesh pattern
      ctx.fillStyle='rgba(40,80,100,0.3)';
      for(let ty=0;ty<64;ty+=8){let yy=drawStart+ty*texStep;ctx.fillRect(i,yy,1,Math.max(1,texStep));}
      // wire cross pattern
      if((i%6)<1){ctx.fillStyle='rgba(100,160,180,0.15)';ctx.fillRect(i,drawStart,1,lineH);}
      // top/bottom frame
      ctx.fillStyle='rgba(60,100,120,0.25)';
      ctx.fillRect(i,drawStart,1,Math.max(2,texStep*2));
      ctx.fillRect(i,drawStart+lineH-Math.max(2,texStep*2),1,Math.max(2,texStep*2));
    } else if(s.hit===2){
      // Concrete pillars - heavy industrial look, mortar lines
      // Horizontal mortar every 8 texels
      ctx.fillStyle='rgba(0,0,0,0.2)';
      for(let ty=0;ty<64;ty+=8){let yy=drawStart+ty*texStep;ctx.fillRect(i,yy,1,Math.max(1,texStep*0.5));}
      // Vertical mortar offset per row (brick pattern)
      let brickRow=((drawStart|0)+i*7)%16;
      if(brickRow<1){ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(i,drawStart,1,lineH);}
      // Grime at base
      ctx.fillStyle='rgba(20,15,10,0.2)';
      ctx.fillRect(i,drawStart+lineH*0.8,1,lineH*0.2);
    } else if(s.hit===3){
      // Terminal walls - DOOM-style tech panels with rivets
      // Panel border lines every 16 texels
      ctx.fillStyle='rgba(0,0,0,0.25)';
      for(let ty=0;ty<64;ty+=16){let yy=drawStart+ty*texStep;ctx.fillRect(i,yy,1,Math.max(1,texStep*0.8));}
      // Vertical panel divisions
      if(i%24<1){ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(i,drawStart,1,lineH);}
      // Panel highlight (top edge catch light)
      if(i%24===1){ctx.fillStyle='rgba(140,110,70,0.12)';ctx.fillRect(i,drawStart,1,lineH);}
      // Random grime splotches
      if((i*31+drawStart*7)%47<3){ctx.fillStyle='rgba(10,8,5,0.15)';ctx.fillRect(i,drawStart+lineH*0.5,1,lineH*0.3);}
    } else if(s.hit===4){
      // Check-in counters - dark metal with riveted seams
      ctx.fillStyle='rgba(60,80,100,0.15)';
      for(let ty=0;ty<64;ty+=4){let yy=drawStart+ty*texStep;ctx.fillRect(i,yy,1,Math.max(1,texStep*0.3));}
      // Top edge highlight
      ctx.fillStyle='rgba(80,100,120,0.2)';
      ctx.fillRect(i,drawStart,1,Math.max(2,texStep));
      // Rivet dots
      if(i%8===0){ctx.fillStyle='rgba(100,120,140,0.2)';
        for(let ty=4;ty<60;ty+=12){ctx.fillRect(i,drawStart+ty*texStep,1,Math.max(1,texStep*0.8));}}
    } else if(s.hit===5){
      // Gate desks - computer terminal look
      // Screen-like glow area in center
      if(i%20>4&&i%20<16){
        ctx.fillStyle='rgba(0,40,20,0.15)';ctx.fillRect(i,drawStart+lineH*0.2,1,lineH*0.4);
        // scan line on "screen"
        let scanY=drawStart+lineH*0.2+((Date.now()/50+i)%((lineH*0.4)|1));
        ctx.fillStyle='rgba(0,80,40,0.1)';ctx.fillRect(i,scanY,1,2);
      }
      // Frame
      ctx.fillStyle='rgba(0,0,0,0.2)';
      ctx.fillRect(i,drawStart,1,Math.max(1,texStep));
      ctx.fillRect(i,drawStart+lineH-Math.max(1,texStep),1,Math.max(1,texStep));
    }
    // Distance fog - fade to black
    if(s.dist>3){
      ctx.fillStyle='rgba(0,0,0,'+(Math.min(0.7,(s.dist-3)/10))+')';
      ctx.fillRect(i,drawStart,1,lineH);
    }
    ctx.globalAlpha=1;
  }
}
// Draw sprite for enemy type
function drawEnemySprite(e,screenX,screenH,dist){
  let shade=Math.max(0.15,1-dist/8);
  let t=ENEMY_TYPES[e.type];
  let w=screenH*0.6*t.size,h=screenH*t.size;
  let x=screenX-w/2,y=H/2+pitch-h/2;
  ctx.globalAlpha=shade;
  // wobble if hit
  if(e.hits>=1)x+=Math.sin(Date.now()/100)*e.hits*3;
  // body
  ctx.fillStyle=t.color;
  if(e.type==='bovino'){
    ctx.fillRect(x,y+h*0.3,w,h*0.5);// body
    ctx.fillStyle=t.accent;
    ctx.fillRect(x+w*0.2,y+h*0.1,w*0.15,h*0.25);// left horn
    ctx.fillRect(x+w*0.65,y+h*0.1,w*0.15,h*0.25);// right horn
    ctx.fillStyle='#fff';ctx.fillRect(x+w*0.3,y+h*0.3,w*0.4,h*0.2);//face
    // legs
    ctx.fillStyle=t.color;
    ctx.fillRect(x+w*0.15,y+h*0.8,w*0.15,h*0.2);
    ctx.fillRect(x+w*0.7,y+h*0.8,w*0.15,h*0.2);
  } else if(e.type==='birdleg'){
    ctx.fillRect(x+w*0.2,y,w*0.6,h*0.5);// torso
    ctx.fillStyle=t.accent;
    ctx.fillRect(x+w*0.3,y+h*0.05,w*0.4,h*0.15);// head
    // skinny bird legs
    ctx.strokeStyle=t.accent;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x+w*0.35,y+h*0.5);ctx.lineTo(x+w*0.25,y+h*0.75);
    ctx.lineTo(x+w*0.15,y+h*0.85);ctx.lineTo(x+w*0.3,y+h*0.85);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+w*0.65,y+h*0.5);ctx.lineTo(x+w*0.75,y+h*0.75);
    ctx.lineTo(x+w*0.85,y+h*0.85);ctx.lineTo(x+w*0.7,y+h*0.85);ctx.stroke();
  } else {
    // ICE or Sheriff - humanoid
    ctx.fillRect(x+w*0.25,y,w*0.5,h*0.25);// head
    ctx.fillRect(x+w*0.1,y+h*0.25,w*0.8,h*0.4);// torso
    ctx.fillRect(x+w*0.1,y+h*0.65,w*0.3,h*0.35);// left leg
    ctx.fillRect(x+w*0.6,y+h*0.65,w*0.3,h*0.35);// right leg
    // helmet/hat
    ctx.fillStyle=t.accent;
    ctx.fillRect(x+w*0.2,y-h*0.05,w*0.6,h*0.1);
    // badge
    if(e.type==='ice'){
      ctx.fillStyle='#fff';ctx.font=(h*0.08|0)+'px monospace';
      ctx.fillText('ICE',x+w*0.25,y+h*0.45);
    } else {
      // star badge for sheriff
      ctx.fillStyle='#ffd700';
      let cx2=x+w*0.5,cy2=y+h*0.35,sr=h*0.06;
      ctx.beginPath();for(let i=0;i<5;i++){
        let a2=-Math.PI/2+i*Math.PI*2/5;ctx.lineTo(cx2+Math.cos(a2)*sr,cy2+Math.sin(a2)*sr);
        a2+=Math.PI/5;ctx.lineTo(cx2+Math.cos(a2)*sr*0.4,cy2+Math.sin(a2)*sr*0.4);
      }ctx.closePath();ctx.fill();
    }
  }
  // red eyes if hit 2+
  if(e.hits>=2){
    ctx.fillStyle='#f00';
    let ey=e.type==='bovino'?y+h*0.33:e.type==='birdleg'?y+h*0.08:y+h*0.08;
    let ex1=x+w*0.35,ex2=x+w*0.55;
    ctx.fillRect(ex1,ey,w*0.08,w*0.08);ctx.fillRect(ex2,ey,w*0.08,w*0.08);
  }
  // sitting if passive
  if(e.passive){
    ctx.fillStyle='rgba(0,255,0,0.3)';ctx.fillRect(x,y+h*0.6,w,h*0.4);
  }
  // text above head
  if(e.yelling>0){
    ctx.fillStyle='#ff0';ctx.font='bold '+(h*0.12|0)+'px monospace';
    ctx.fillText(e.yellText,x,y-5);
  } else if(e.hits>=3){
    ctx.fillStyle='#0f0';ctx.font=(h*0.1|0)+'px monospace';
    let qt=e.hits>=4?HIGH_QUOTES[(e.x*7+e.y*13|0)%HIGH_QUOTES.length]:'hehe...';
    ctx.fillText(qt,x-10,y-5);
  }
  ctx.globalAlpha=1;
}
// Draw arm/weapon
function drawWeapon(throwAnim){
  let bob=running?Math.sin(Date.now()/80)*5:Math.sin(Date.now()/200)*2;
  let throwOff=throwAnim>0?-throwAnim*30:0;
  let pOff=pitch*0.3;
  // arm
  ctx.fillStyle='#c4956a';
  ctx.fillRect(W*0.55+bob,H*0.6+throwOff+pOff,80,150);
  // hand
  ctx.fillRect(W*0.55+bob-10,H*0.6+throwOff-10+pOff,100,30);
  // green leaf in hand
  if(throwAnim<=0){
    ctx.fillStyle='#2d8c2d';
    let lx=W*0.58+bob,ly=H*0.58+throwOff+pOff;
    ctx.beginPath();
    ctx.ellipse(lx,ly,15,8,Math.PI/4,0,Math.PI*2);ctx.fill();
    ctx.ellipse(lx+5,ly-5,12,6,-Math.PI/4,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#1a5c1a';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(lx-10,ly+5);ctx.lineTo(lx+15,ly-10);ctx.stroke();
  }
}
// Projectiles
function fireProjectile(){
  if(ammo<=0)return;ammo--;
  projectiles.push({x:px,y:py,dx:Math.cos(pa)*0.15,dy:Math.sin(pa)*0.15,life:60});
  throwAnim=1;
}
let throwAnim=0;
function updateProjectiles(){
  for(let i=projectiles.length-1;i>=0;i--){
    let p=projectiles[i];p.x+=p.dx;p.y+=p.dy;p.life--;
    if(p.life<=0||mapAt(p.x|0,p.y|0)>0){projectiles.splice(i,1);continue;}
    for(let j=enemies.length-1;j>=0;j--){
      let e=enemies[j];if(e.passive)continue;
      let dx=p.x-e.x,dy=p.y-e.y;
      if(dx*dx+dy*dy<0.3*e.size){
        e.hits++;e.hp--;
        e.yelling=60;e.yellText=e.hits>=3?'*cough*':'Ugh!';
        if(e.hits>=1)e.speed=ENEMY_TYPES[e.type].speed*Math.max(0.1,1-e.hits*0.25);
        if(e.hits>=3)e.speed=0.1;
        if(e.hits>=4||e.hp<=0){e.passive=true;e.speed=0;kills++;let pts=e.type==='bovino'||e.type==='birdleg'?500:100;score+=pts;
          addScorePopup(W/2,H/2-40,'+'+pts,pts>=500?'#f0f':'#ff0');
          addParticles(W/2,H/2,e.type==='bovino'?'#8B4513':e.type==='birdleg'?'#FF69B4':'#0f0',15);
          screenShake=8;
        } else {addParticles(W/2,H/2,'#0f0',5);screenShake=3;}
        projectiles.splice(i,1);break;
      }
    }
  }
}
// Enemy AI
function updateEnemies(dt){
  for(let e of enemies){
    if(e.yelling>0)e.yelling--;
    if(e.passive)continue;
    let dx=px-e.x,dy=py-e.y,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<0.01)continue;
    let ang=Math.atan2(dy,dx);
    if(e.hits<3){
      let spd=e.speed*dt;
      let wobble=e.hits>=1?Math.sin(Date.now()/200)*0.5:0;
      let nx=e.x+Math.cos(ang+wobble)*spd;
      let ny=e.y+Math.sin(ang+wobble)*spd;
      if(mapAt(nx|0,ny|0)===0){e.x=nx;e.y=ny;}
      // attack
      if(dist<1.5&&e.hits<3){
        e.attackTimer+=dt;
        if(e.attackTimer>1){
          e.attackTimer=0;hp-=5+(e.type==='bovino'?10:e.type==='birdleg'?8:0);
          e.yelling=40;e.yellText=ENEMY_TYPES[e.type].yell;
          screenShake=6;
          addParticles(W/2,H/2,'#f00',8);
          document.getElementById('damage').style.background='rgba(255,0,0,0.4)';
          setTimeout(()=>document.getElementById('damage').style.background='rgba(255,0,0,0)',200);
        }
      }
    }
  }
  // clean defeated & check wave
  let active=enemies.filter(e=>!e.passive);
  if(active.length===0&&enemies.length>0){
    wave++;ammo+=10+wave*2;enemies=[];
    setTimeout(()=>spawnWave(),2000);
  }
}
// HUD update
function updateHUD(){
  document.getElementById('ammo').innerText=ammo;
  document.getElementById('health').innerText=Math.max(0,hp);
  document.getElementById('score').innerText=score;
  document.getElementById('wave').innerText=wave;
  document.getElementById('kills').innerText=kills;
  let vibes=hp>80?'CHILL':hp>50?'UNEASY':hp>25?'STRESSED':'PANICKING';
  document.getElementById('vibes').innerText=vibes;
}
// Draw projectiles as green dots
function drawProjectiles(strips){
  for(let p of projectiles){
    let dx=p.x-px,dy=p.y-py;
    let dist=dx*Math.cos(pa)+dy*Math.sin(pa);
    if(dist<0.1)continue;
    let sx=(-dx*Math.sin(pa)+dy*Math.cos(pa))/dist;
    let screenX=W/2+sx*W;
    let screenY=H/2+pitch;
    let sz=Math.max(2,20/dist);
    ctx.fillStyle='#2d8c2d';
    ctx.beginPath();ctx.arc(screenX,screenY,sz,0,Math.PI*2);ctx.fill();
  }
}
// Sort & draw enemies
function drawEnemies(strips){
  let sorted=enemies.map(e=>{
    let dx=e.x-px,dy=e.y-py;
    return{e,dist:Math.sqrt(dx*dx+dy*dy)};
  }).sort((a,b)=>b.dist-a.dist);
  for(let{e,dist}of sorted){
    let dx=e.x-px,dy=e.y-py;
    let angle=Math.atan2(dy,dx)-pa;
    while(angle<-Math.PI)angle+=Math.PI*2;
    while(angle>Math.PI)angle-=Math.PI*2;
    if(Math.abs(angle)>FOV)continue;
    let screenX=W/2+Math.tan(angle)*(W/2)/Math.tan(HALF_FOV);
    let screenH=Math.min(H*2,(H/dist)|0);
    drawEnemySprite(e,screenX,screenH,dist);
  }
}
// Audio - Breakdown Yoga via Spotify IFrame API
function startMusic(){
  let wrap=document.getElementById('spotifyWrap');
  if(wrap&&musicOn)wrap.style.display='block';
  if(window.spotifyController&&musicOn){
    window.spotifyController.play();
  }
}
function stopMusic(){
  let wrap=document.getElementById('spotifyWrap');
  if(wrap)wrap.style.display='none';
  if(window.spotifyController){
    window.spotifyController.togglePlay();
  }
}
// ─── MOBILE TOUCH CONTROLS ───────────────────────
let isMobile='ontouchstart' in window;
let touchMoveX=0,touchMoveY=0,touchLookDX=0,touchLookDY=0;
let stickTouchId=null,lookTouchId=null;
function initMobile(){
  if(!isMobile)return;
  document.getElementById('mobileControls').style.display='block';
  // Draw left stick base
  let ls=document.getElementById('leftStick');
  let lc=ls.getContext('2d');
  function drawStick(dx,dy){
    lc.clearRect(0,0,150,150);
    lc.strokeStyle='rgba(0,255,0,0.3)';lc.lineWidth=2;
    lc.beginPath();lc.arc(75,75,60,0,Math.PI*2);lc.stroke();
    lc.fillStyle='rgba(0,255,0,0.4)';
    lc.beginPath();lc.arc(75+dx*40,75+dy*40,22,0,Math.PI*2);lc.fill();
  }
  drawStick(0,0);
  // Draw fire button
  let rb=document.getElementById('rightBtn');
  let rc=rb.getContext('2d');
  rc.strokeStyle='rgba(0,255,0,0.5)';rc.lineWidth=2;
  rc.beginPath();rc.arc(45,45,38,0,Math.PI*2);rc.stroke();
  rc.fillStyle='rgba(0,255,0,0.15)';
  rc.beginPath();rc.arc(45,45,38,0,Math.PI*2);rc.fill();
  rc.fillStyle='#0f0';rc.font='11px monospace';rc.textAlign='center';
  rc.fillText('THROW',45,48);
  // Left stick touch
  ls.addEventListener('touchstart',e=>{e.preventDefault();stickTouchId=e.changedTouches[0].identifier;},{passive:false});
  ls.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(let t of e.changedTouches){
      if(t.identifier===stickTouchId){
        let r=ls.getBoundingClientRect();
        let dx=(t.clientX-r.left-75)/60, dy=(t.clientY-r.top-75)/60;
        dx=Math.max(-1,Math.min(1,dx));dy=Math.max(-1,Math.min(1,dy));
        touchMoveX=dx;touchMoveY=dy;
        drawStick(dx,dy);
      }
    }
  },{passive:false});
  ls.addEventListener('touchend',e=>{
    for(let t of e.changedTouches){
      if(t.identifier===stickTouchId){stickTouchId=null;touchMoveX=0;touchMoveY=0;drawStick(0,0);}
    }
  });
  // Look zone - swipe to look
  let lookZone=document.getElementById('lookZone');
  let lastLookX=0,lastLookY=0;
  lookZone.addEventListener('touchstart',e=>{
    e.preventDefault();lookTouchId=e.changedTouches[0].identifier;
    lastLookX=e.changedTouches[0].clientX;lastLookY=e.changedTouches[0].clientY;
  },{passive:false});
  lookZone.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(let t of e.changedTouches){
      if(t.identifier===lookTouchId){
        touchLookDX=(t.clientX-lastLookX)*0.005;
        touchLookDY=(t.clientY-lastLookY)*0.8;
        lastLookX=t.clientX;lastLookY=t.clientY;
      }
    }
  },{passive:false});
  lookZone.addEventListener('touchend',e=>{
    for(let t of e.changedTouches){if(t.identifier===lookTouchId){lookTouchId=null;touchLookDX=0;touchLookDY=0;}}
  });
  // Fire button
  rb.addEventListener('touchstart',e=>{e.preventDefault();if(running)fireProjectile();},{passive:false});
}
// Input
document.addEventListener('keydown',e=>{
  keys[e.key.toLowerCase()]=true;
  if(e.key==='Escape')paused=!paused;
  if(e.key==='F5'&&running){e.preventDefault();saveGame('auto');}
  if(e.key==='F9'&&running){e.preventDefault();if(loadGame('auto'))showMsg('GAME LOADED');}
});
document.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
canvas.addEventListener('click',()=>{
  if(!running)return;
  canvas.requestPointerLock();fireProjectile();
});
document.addEventListener('mousemove',e=>{
  if(document.pointerLockElement===canvas){pa+=e.movementX*0.003;pitch=Math.max(-H/3,Math.min(H/3,pitch-e.movementY*0.8));}
});
// Game loop
let lastTime=0;
function gameLoop(ts){
  if(!running){requestAnimationFrame(gameLoop);return;}
  let dt=Math.min((ts-lastTime)/1000,0.05);lastTime=ts;
  if(throwAnim>0)throwAnim=Math.max(0,throwAnim-dt*5);
  if(msgTimer>0){msgTimer--;if(msgTimer<=0)document.getElementById('message').style.display='none';}
  if(!paused){
    // movement (keyboard + touch)
    let spd=3*dt*(keys['shift']?1.8:1);
    let nx=px,ny=py;
    if(keys['w']||touchMoveY<-0.2){nx+=Math.cos(pa)*spd;ny+=Math.sin(pa)*spd;}
    if(keys['s']||touchMoveY>0.2){nx-=Math.cos(pa)*spd;ny-=Math.sin(pa)*spd;}
    if(keys['a']||touchMoveX<-0.2){nx+=Math.cos(pa-Math.PI/2)*spd;ny+=Math.sin(pa-Math.PI/2)*spd;}
    if(keys['d']||touchMoveX>0.2){nx+=Math.cos(pa+Math.PI/2)*spd;ny+=Math.sin(pa+Math.PI/2)*spd;}
    // touch look
    if(touchLookDX){pa+=touchLookDX;touchLookDX=0;}
    if(touchLookDY){pitch=Math.max(-H/3,Math.min(H/3,pitch-touchLookDY));touchLookDY=0;}
    if(mapAt(nx|0,py|0)===0)px=nx;
    if(mapAt(px|0,ny|0)===0)py=ny;
    updateProjectiles();
    updateEnemies(dt);
  }
  // render - screen shake
  ctx.save();
  if(screenShake>0){let sx=(Math.random()-0.5)*screenShake,sy=(Math.random()-0.5)*screenShake;ctx.translate(sx,sy);screenShake*=0.85;if(screenShake<0.5)screenShake=0;}
  drawBackground();
  let strips=castRays();
  drawWalls(strips);
  drawEnemies(strips);
  drawProjectiles(strips);
  drawWeapon(throwAnim);
  drawEffects();
  drawMinimap();
  drawScanlines();
  ctx.restore();
  updateHUD();
  if(hp<=0){
    running=false;
    saveToLeaderboard(playerName,score,wave,kills).then(rank=>{
      showMsg('YOU GOT DEPORTED\nScore: '+score+' | Rank #'+rank);
    });
    setTimeout(()=>{document.getElementById('menu').style.display='flex';document.getElementById('hud').style.display='none';
    document.getElementById('crosshair').style.display='none';},3000);}
  if(paused){ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#0f0';ctx.font='36px monospace';ctx.fillText('PAUSED',W/2-60,H/2);}
  requestAnimationFrame(gameLoop);
}
// ─── LEADERBOARD & SAVES (Supabase) ─────────────
let kills=0;let playerName='';
async function sbFetch(path,opts={}){
  let r=await fetch(SUPABASE_URL+'/rest/v1/'+path,{headers:SB_HEADERS,...opts});
  return r.ok?r.json():null;
}
async function getLeaderboard(){
  let data=await sbFetch('doom_scores?select=player_name,score,wave,kills,death_cause,created_at&order=score.desc&limit=50');
  return data||[];
}
async function saveToLeaderboard(name,sc,w,k){
  let res=await sbFetch('doom_scores',{method:'POST',body:JSON.stringify({player_name:name,score:sc,wave:w,kills:k,death_cause:'deported'})});
  let data=await sbFetch('doom_scores?select=id&score=gt.'+sc);
  return data?(data.length+1):1;
}
async function saveGame(slot){
  if(!playerName)return;
  let body={player_name:playerName,slot,score,wave,hp,ammo,kills,px,py,pa,
    enemies_json:JSON.stringify(enemies.map(e=>({type:e.type,x:e.x,y:e.y,hp:e.hp,hits:e.hits,passive:e.passive})))};
  // upsert by player_name+slot
  await fetch(SUPABASE_URL+'/rest/v1/doom_saves',{method:'POST',
    headers:{...SB_HEADERS,'Prefer':'resolution=merge-duplicates,return=representation'},
    body:JSON.stringify(body)});
  showMsg('GAME SAVED - SLOT '+slot);
}
async function loadGame(slot){
  let data=await sbFetch('doom_saves?player_name=eq.'+encodeURIComponent(playerName)+'&slot=eq.'+encodeURIComponent(slot)+'&limit=1');
  if(!data||data.length===0){showMsg('NO SAVE IN SLOT '+slot);return false;}
  let s=data[0];
  score=s.score;wave=s.wave;hp=s.hp;ammo=s.ammo;kills=s.kills;px=s.px;py=s.py;pa=s.pa;
  enemies=[];
  let eds=JSON.parse(s.enemies_json);
  for(let ed of eds){
    let t=ENEMY_TYPES[ed.type];
    enemies.push({type:ed.type,x:ed.x,y:ed.y,hp:ed.hp,maxHp:t.hp,hits:ed.hits,
      angle:Math.random()*Math.PI*2,speed:t.speed*Math.max(0.1,1-ed.hits*0.25),
      size:t.size,attackTimer:0,wobble:0,passive:ed.passive,yelling:0,yellText:''});
  }
  return true;
}
async function showLeaderboardScreen(){
  let lb=await getLeaderboard();
  let el=document.getElementById('leaderboardScreen');
  let html='<h2 style="color:#0f0;margin-bottom:10px;">TOP 50 - I.C.E.</h2>';
  html+='<div style="color:#484;font-size:11px;margin-bottom:8px;">ice.gritboxops.com</div>';
  html+='<table style="color:#0f0;font-size:12px;border-collapse:collapse;width:100%;max-width:500px;">';
  html+='<tr style="color:#4a4;"><th>#</th><th>NAME</th><th>SCORE</th><th>WAVE</th><th>KILLS</th><th>DATE</th></tr>';
  if(lb.length===0)html+='<tr><td colspan="6" style="padding:20px;color:#555;">No scores yet. Be the first!</td></tr>';
  for(let i=0;i<lb.length;i++){
    let e=lb[i],c=i<3?'#ff0':i<10?'#0f0':'#484';
    let d=e.created_at?e.created_at.slice(0,10):'';
    html+='<tr style="color:'+c+'"><td>'+(i+1)+'</td><td>'+e.player_name+'</td><td>'+e.score+'</td><td>'+e.wave+'</td><td>'+(e.kills||0)+'</td><td>'+d+'</td></tr>';
  }
  html+='</table><div class="menuItem" onclick="Game.hideLeaderboard()" style="margin-top:20px;color:#aaa;cursor:pointer;">BACK</div>';
  el.innerHTML=html;el.style.display='flex';
}
// Game object (referenced by HTML)
const Game={
  start(){
    let nameIn=document.getElementById('nameInput');
    playerName=nameIn?nameIn.value.trim()||'ANON':'ANON';
    px=2.5;py=2.5;pa=0;pitch=0;hp=100;ammo=42;score=0;wave=1;kills=0;
    enemies=[];projectiles=[];running=true;paused=false;
    document.getElementById('menu').style.display='none';
    document.getElementById('hud').style.display='block';
    document.getElementById('crosshair').style.display='block';
    if(!isMobile)canvas.requestPointerLock();
    initMobile();
    if(musicOn)startMusic();
    spawnWave();lastTime=performance.now();
    requestAnimationFrame(gameLoop);
  },
  async continueGame(){
    let nameIn=document.getElementById('nameInput');
    playerName=nameIn?nameIn.value.trim()||'ANON':'ANON';
    showMsg('LOADING...');
    if(await loadGame('auto')){
      running=true;paused=false;
      document.getElementById('menu').style.display='none';
      document.getElementById('hud').style.display='block';
      document.getElementById('crosshair').style.display='block';
      if(!isMobile)canvas.requestPointerLock();
      initMobile();
      if(musicOn)startMusic();
      lastTime=performance.now();
      requestAnimationFrame(gameLoop);
    }
  },
  async showLeaderboard(){await showLeaderboardScreen();document.getElementById('menu').style.display='none';},
  hideLeaderboard(){document.getElementById('leaderboardScreen').style.display='none';document.getElementById('menu').style.display='flex';},
  toggleMusic(){
    musicOn=!musicOn;
    document.querySelectorAll('.menuItem')[3].innerText='MUSIC: '+(musicOn?'ON':'OFF');
    if(musicOn&&running)startMusic();else stopMusic();
  },
  toggleMute(){
    let btn=document.getElementById('muteBtn');
    if(window.spotifyController){
      window.spotifyController.togglePlay();
      btn.innerText=btn.innerText==='🔊'?'🔇':'🔊';
    }
  },
  setVolume(val){
    let wrap=document.getElementById('spotifyWrap');
    if(wrap)wrap.style.opacity=Math.max(0.3,val/100);
  }
};
requestAnimationFrame(gameLoop);
