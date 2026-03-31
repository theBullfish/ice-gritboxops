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
// ─── LEVEL SYSTEM ───────────────────────────────
// Wall types: 1-5 per level, 6=prisoner cell (Alcatraz special)
let currentLevel=0;
let MAP=[];let prisoners=[];let freedCount=0;
const LEVELS=[
  { name:'MSP AIRPORT',sub:'Terminal C - Minneapolis',
    ceil:['#0a0a0a','#141410','#1e1a14','#28221a'],floor:['#28221a','#221c14','#1a1610','#12100c'],
    lights:{color:'rgba(180,120,60,0.15)',count:3},
    wc:{1:{l:'#2a4a5a',d:'#1a3040'},2:{l:'#5a5a5a',d:'#3a3a3a'},3:{l:'#6a5a48',d:'#4a3a28'},4:{l:'#2a2a35',d:'#1a1a25'},5:{l:'#3a3a45',d:'#2a2a35'}},
    map:[
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
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  },
  { name:'AIRPLANE GRAVEYARD',sub:'Mojave Desert Boneyard',
    ceil:['#1a1008','#2a1c10','#3a2818','#4a3420'],floor:['#3a3020','#2a2418','#201a10','#181208'],
    lights:{color:'rgba(255,160,60,0.08)',count:0},
    wc:{1:{l:'#5a5040',d:'#3a3428'},2:{l:'#707060',d:'#505040'},3:{l:'#4a4438',d:'#2a2820'},4:{l:'#606058',d:'#404038'},5:{l:'#3a3830',d:'#2a2820'}},
    map:[
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
    3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,1,1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1,1,0,0,3,
    3,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,3,
    3,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,5,0,0,5,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,
    3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,3,
    3,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,3,
    3,0,0,1,1,0,0,0,0,0,5,0,0,5,0,0,0,0,0,1,1,0,0,3,
    3,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  },
  { name:'THE LOLITA EXPRESS',sub:'Private Jet - 40,000ft',
    ceil:['#1a1418','#221820','#2a1c28','#1a1218'],floor:['#2a2028','#221820','#1a1218','#120e14'],
    lights:{color:'rgba(200,150,255,0.1)',count:2},
    wc:{1:{l:'#4a3848',d:'#2a1828'},2:{l:'#6a5a58',d:'#4a3a38'},3:{l:'#5a4850',d:'#3a2830'},4:{l:'#3a2a35',d:'#2a1a25'},5:{l:'#4a3a40',d:'#2a2028'}},
    map:[
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
    3,0,0,3,0,0,3,0,0,3,0,0,0,0,3,0,0,3,0,0,3,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,
    3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,3,3,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,3,3,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,3,3,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,4,0,0,0,0,2,0,0,0,2,0,0,0,0,4,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,
    3,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  },
  { name:'EPSTEIN ISLAND',sub:'Little St. James - The Compound',
    ceil:['#081008','#0c180c','#102010','#0a140a'],floor:['#1a2818','#142014','#0e180e','#0a120a'],
    lights:{color:'rgba(100,200,80,0.06)',count:0},
    wc:{1:{l:'#4a6a4a',d:'#2a4a2a'},2:{l:'#6a6a5a',d:'#4a4a3a'},3:{l:'#5a5a48',d:'#3a3a28'},4:{l:'#3a4a3a',d:'#1a2a1a'},5:{l:'#4a5a48',d:'#2a3a28'}},
    map:[
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
    3,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,3,
    3,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,3,0,0,0,4,4,0,0,0,0,0,0,0,0,4,4,0,0,0,3,3,3,
    3,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,5,0,0,0,0,5,0,0,0,0,0,0,0,0,3,
    3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,
    3,0,0,0,0,0,0,0,0,5,0,0,0,0,5,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,3,
    3,3,3,0,0,0,4,4,0,0,0,0,0,0,0,0,4,4,0,0,0,3,3,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,3,
    3,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,3,
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  },
  { name:'IMMIGRANT ALCATRAZ',sub:'Free the Prisoners',
    ceil:['#0a0808','#141010','#1a1414','#201818'],floor:['#201818','#181212','#120e0e','#0a0808'],
    lights:{color:'rgba(255,80,40,0.1)',count:4},
    wc:{1:{l:'#5a4a4a',d:'#3a2a2a'},2:{l:'#6a5a5a',d:'#4a3a3a'},3:{l:'#504040',d:'#302020'},4:{l:'#3a3030',d:'#2a1a1a'},5:{l:'#4a4040',d:'#2a2020'},6:{l:'#3a5a3a',d:'#1a3a1a'}},
    map:[
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
    3,0,0,0,2,0,0,0,2,0,0,0,0,0,0,2,0,0,0,2,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,6,6,0,0,6,6,0,0,0,0,0,0,6,6,0,0,6,6,0,0,3,
    3,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,6,6,0,0,6,6,0,0,4,4,0,0,6,6,0,0,6,6,0,0,3,
    3,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,6,6,0,0,6,6,0,0,0,0,0,0,6,6,0,0,6,6,0,0,3,
    3,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
    3,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,6,6,0,0,6,6,0,0,0,0,0,0,6,6,0,0,6,6,0,0,3,
    3,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,0,0,0,2,0,0,0,2,0,0,0,0,0,0,2,0,0,0,2,0,0,0,3,
    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  }
];
function loadLevel(idx){
  currentLevel=idx%LEVELS.length;
  let lv=LEVELS[currentLevel];
  MAP=lv.map.slice();
  prisoners=[];freedCount=0;
  // Spawn prisoners in Alcatraz cells (wall type 6)
  if(currentLevel===4){
    for(let j=0;j<MAP_S;j++)for(let i=0;i<MAP_S;i++){
      // Put a prisoner next to each cell wall cluster
      if(MAP[j*MAP_S+i]===0){
        let adj=0;
        if(i>0&&MAP[j*MAP_S+i-1]===6)adj++;if(i<MAP_S-1&&MAP[j*MAP_S+i+1]===6)adj++;
        if(j>0&&MAP[(j-1)*MAP_S+i]===6)adj++;if(j<MAP_S-1&&MAP[(j+1)*MAP_S+i]===6)adj++;
        if(adj>=2)prisoners.push({x:i+0.5,y:j+0.5,freed:false});
      }
    }
  }
  showMsg(lv.name+'\n'+lv.sub);
  // Level transition overlay
  if(currentLevel>0){
    let msgEl=document.getElementById('message');
    msgEl.style.fontSize='22px';
    setTimeout(()=>{msgEl.style.fontSize='';},3000);
  }
}
function getLevelForWave(w){
  if(w<=3)return 0;      // MSP Airport
  if(w<=6)return 1;      // Airplane Graveyard
  if(w<=9)return 2;      // Lolita Express
  if(w<=12)return 3;     // Epstein Island
  return 4;              // Immigrant Alcatraz (13+)
}
function mapAt(x,y){return(x>=0&&x<MAP_S&&y>=0&&y<MAP_S)?MAP[y*MAP_S+x]:3;}
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
// Draw DOOM-style ceiling and floor - per-level
function drawBackground(){
  let horizon=H/2+pitch;
  let lv=LEVELS[currentLevel];
  // ceiling
  let grd=ctx.createLinearGradient(0,0,0,horizon);
  for(let i=0;i<lv.ceil.length;i++)grd.addColorStop(i/(lv.ceil.length-1),lv.ceil[i]);
  ctx.fillStyle=grd;ctx.fillRect(0,0,W,horizon);
  // lights
  if(lv.lights.count>0){
    ctx.fillStyle=lv.lights.color;
    for(let i=0;i<lv.lights.count;i++){ctx.fillRect(W*0.15+i*W*(0.7/lv.lights.count),2,W*0.06,Math.min(6,horizon*0.03));}
  }
  // floor
  let grd2=ctx.createLinearGradient(0,horizon,0,H);
  for(let i=0;i<lv.floor.length;i++)grd2.addColorStop(i/(lv.floor.length-1),lv.floor[i]);
  ctx.fillStyle=grd2;ctx.fillRect(0,horizon,W,H-horizon);
  ctx.fillStyle='rgba(180,140,80,0.04)';
  ctx.fillRect(0,horizon,W,1);
}
// Draw DOOM-style textured walls
function drawWalls(strips){
  for(let i=0;i<strips.length;i++){
    let s=strips[i];
    let lineH=Math.min(H*2,(H/s.dist)|0);
    let drawStart=(H-lineH)/2+pitch;
    let lv=LEVELS[currentLevel];
    let c=(lv.wc[s.hit])||lv.wc[3]||{l:'#555',d:'#333'};
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
    } else if(s.hit===6){
      // Prison cell bars - vertical bars with gaps
      if(i%4<2){
        ctx.fillStyle='rgba(80,80,80,0.4)';ctx.fillRect(i,drawStart,1,lineH);
      } else {
        ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(i,drawStart,1,lineH);
      }
      // Horizontal crossbar
      ctx.fillStyle='rgba(100,100,100,0.3)';
      ctx.fillRect(i,drawStart+lineH*0.3,1,Math.max(2,texStep*2));
      ctx.fillRect(i,drawStart+lineH*0.7,1,Math.max(2,texStep*2));
    }
    // Distance fog - fade to black
    if(s.dist>3){
      ctx.fillStyle='rgba(0,0,0,'+(Math.min(0.7,(s.dist-3)/10))+')';
      ctx.fillRect(i,drawStart,1,lineH);
    }
    ctx.globalAlpha=1;
  }
}
// Draw DOOM-style chunky pixel sprites
function drawEnemySprite(e,screenX,screenH,dist){
  let shade=Math.max(0.15,1-dist/8);
  let t=ENEMY_TYPES[e.type];
  let w=screenH*0.6*t.size,h=screenH*t.size;
  let x=screenX-w/2,y=H/2+pitch-h/2;
  ctx.globalAlpha=shade;
  // wobble if hit
  if(e.hits>=1)x+=Math.sin(Date.now()/100)*e.hits*3;
  // animation bob
  let bob=Math.sin(Date.now()/200+e.x*3)*h*0.015;
  let breathe=Math.sin(Date.now()/400+e.y*5)*h*0.01;

  if(e.type==='bovino'){
    // ──── BOVINO - DOOM BULL DEMON ────
    // Massive muscular body - barrel chest
    ctx.fillStyle='#5C3317';
    ctx.fillRect(x+w*0.15,y+h*0.28+bob,w*0.7,h*0.42); // main body
    ctx.fillStyle='#4a2810';
    ctx.fillRect(x+w*0.2,y+h*0.3+bob,w*0.6,h*0.38); // body shadow/depth
    // Thick muscular shoulders
    ctx.fillStyle='#6a3a1a';
    ctx.fillRect(x+w*0.08,y+h*0.25+bob,w*0.22,h*0.2); // left shoulder
    ctx.fillRect(x+w*0.7,y+h*0.25+bob,w*0.22,h*0.2);  // right shoulder
    // Massive bull head
    ctx.fillStyle='#5C3317';
    ctx.fillRect(x+w*0.25,y+h*0.08+bob,w*0.5,h*0.25); // head block
    ctx.fillStyle='#4a2810';
    ctx.fillRect(x+w*0.3,y+h*0.15+bob,w*0.4,h*0.15);  // snout
    // HORNS - curved, menacing
    ctx.fillStyle='#d4c8a0';
    ctx.fillRect(x+w*0.1,y+h*0.02+bob,w*0.12,h*0.06); // left horn base
    ctx.fillRect(x+w*0.05,y-h*0.02+bob,w*0.08,h*0.06); // left horn tip
    ctx.fillRect(x+w*0.78,y+h*0.02+bob,w*0.12,h*0.06); // right horn base
    ctx.fillRect(x+w*0.87,y-h*0.02+bob,w*0.08,h*0.06); // right horn tip
    // Nostrils - steaming
    ctx.fillStyle='#2a1508';
    ctx.fillRect(x+w*0.38,y+h*0.24+bob,w*0.08,h*0.04);
    ctx.fillRect(x+w*0.54,y+h*0.24+bob,w*0.08,h*0.04);
    // Snort steam
    if(Date.now()%2000<500){
      ctx.fillStyle='rgba(200,200,200,0.3)';
      ctx.fillRect(x+w*0.35,y+h*0.28+bob,w*0.05,h*0.03);
      ctx.fillRect(x+w*0.6,y+h*0.28+bob,w*0.05,h*0.03);
    }
    // Eyes - angry, glowing
    ctx.fillStyle=e.hits>=2?'#ff0000':'#ff6600';
    ctx.fillRect(x+w*0.32,y+h*0.12+bob,w*0.1,h*0.06);
    ctx.fillRect(x+w*0.58,y+h*0.12+bob,w*0.1,h*0.06);
    // Angry brow ridge
    ctx.fillStyle='#3a1a08';
    ctx.fillRect(x+w*0.28,y+h*0.1+bob,w*0.18,h*0.03);
    ctx.fillRect(x+w*0.54,y+h*0.1+bob,w*0.18,h*0.03);
    // Thick hooved legs
    ctx.fillStyle='#4a2810';
    ctx.fillRect(x+w*0.15,y+h*0.68+bob,w*0.18,h*0.22);
    ctx.fillRect(x+w*0.67,y+h*0.68+bob,w*0.18,h*0.22);
    // Hooves
    ctx.fillStyle='#2a1508';
    ctx.fillRect(x+w*0.13,y+h*0.88+bob,w*0.22,h*0.06);
    ctx.fillRect(x+w*0.65,y+h*0.88+bob,w*0.22,h*0.06);
    // Tail
    ctx.fillStyle='#5C3317';
    ctx.fillRect(x+w*0.85,y+h*0.35+bob,w*0.08,h*0.15);
    ctx.fillRect(x+w*0.88,y+h*0.32+bob,w*0.06,h*0.05);
    // Belly highlight
    ctx.fillStyle='rgba(140,90,50,0.3)';
    ctx.fillRect(x+w*0.3,y+h*0.45+bob,w*0.4,h*0.15);
    // Muscle definition lines
    ctx.fillStyle='rgba(0,0,0,0.15)';
    ctx.fillRect(x+w*0.35,y+h*0.3+bob,w*0.02,h*0.2);
    ctx.fillRect(x+w*0.63,y+h*0.3+bob,w*0.02,h*0.2);

  } else if(e.type==='birdleg'){
    // ──── BIRD-LEGGED HO - ABSURD DOOM DEMON ────
    // Thicc upper body on ridiculous skinny bird legs
    // Big poofy hair/feathers on top
    ctx.fillStyle='#cc2266';
    ctx.fillRect(x+w*0.2,y+h*0.0+bob,w*0.6,h*0.12);
    ctx.fillRect(x+w*0.15,y+h*0.02+bob,w*0.7,h*0.08);
    // Head
    ctx.fillStyle='#AA336A';
    ctx.fillRect(x+w*0.25,y+h*0.1+bob,w*0.5,h*0.15);
    // Face
    ctx.fillStyle='#d4a0b0';
    ctx.fillRect(x+w*0.3,y+h*0.12+bob,w*0.4,h*0.1);
    // Eyes - beady, menacing
    ctx.fillStyle=e.hits>=2?'#ff0000':'#ffff00';
    ctx.fillRect(x+w*0.35,y+h*0.13+bob,w*0.08,h*0.04);
    ctx.fillRect(x+w*0.57,y+h*0.13+bob,w*0.08,h*0.04);
    // Pupils
    ctx.fillStyle='#000';
    ctx.fillRect(x+w*0.37,y+h*0.14+bob,w*0.04,h*0.03);
    ctx.fillRect(x+w*0.59,y+h*0.14+bob,w*0.04,h*0.03);
    // Beak
    ctx.fillStyle='#ff8800';
    ctx.fillRect(x+w*0.42,y+h*0.17+bob,w*0.16,h*0.06);
    ctx.fillRect(x+w*0.44,y+h*0.22+bob,w*0.12,h*0.03);
    // Chunky torso with feathery texture
    ctx.fillStyle='#AA336A';
    ctx.fillRect(x+w*0.15,y+h*0.25+bob,w*0.7,h*0.3);
    // Feather texture
    ctx.fillStyle='#883058';
    for(let fy=0;fy<5;fy++){
      ctx.fillRect(x+w*0.18,y+h*(0.27+fy*0.055)+bob,w*0.64,h*0.02);
    }
    // Wings/arms out
    ctx.fillStyle='#992855';
    ctx.fillRect(x+w*0.0,y+h*0.28+bob,w*0.18,h*0.15);
    ctx.fillRect(x+w*0.82,y+h*0.28+bob,w*0.18,h*0.15);
    // Wing feather tips
    ctx.fillStyle='#FF69B4';
    ctx.fillRect(x-w*0.02,y+h*0.32+bob,w*0.06,h*0.08);
    ctx.fillRect(x+w*0.96,y+h*0.32+bob,w*0.06,h*0.08);
    // Short skirt/tutu area
    ctx.fillStyle='#dd4488';
    ctx.fillRect(x+w*0.1,y+h*0.52+bob,w*0.8,h*0.08);
    // BIRD LEGS - the signature look - absurdly skinny
    ctx.fillStyle='#ffaa44';
    // Left leg - bent backward like a bird
    ctx.fillRect(x+w*0.3,y+h*0.6+bob,w*0.06,h*0.15);  // upper
    ctx.fillRect(x+w*0.25,y+h*0.73+bob,w*0.06,h*0.12); // lower (angled)
    // Left foot - three-toed
    ctx.fillRect(x+w*0.18,y+h*0.84+bob,w*0.18,h*0.03);
    ctx.fillRect(x+w*0.2,y+h*0.83+bob,w*0.03,h*0.05);
    ctx.fillRect(x+w*0.28,y+h*0.83+bob,w*0.03,h*0.05);
    ctx.fillRect(x+w*0.35,y+h*0.83+bob,w*0.03,h*0.05);
    // Right leg
    ctx.fillRect(x+w*0.64,y+h*0.6+bob,w*0.06,h*0.15);
    ctx.fillRect(x+w*0.69,y+h*0.73+bob,w*0.06,h*0.12);
    // Right foot
    ctx.fillRect(x+w*0.62,y+h*0.84+bob,w*0.18,h*0.03);
    ctx.fillRect(x+w*0.62,y+h*0.83+bob,w*0.03,h*0.05);
    ctx.fillRect(x+w*0.69,y+h*0.83+bob,w*0.03,h*0.05);
    ctx.fillRect(x+w*0.76,y+h*0.83+bob,w*0.03,h*0.05);
    // Knee joints
    ctx.fillStyle='#dd8822';
    ctx.fillRect(x+w*0.27,y+h*0.73+bob,w*0.1,h*0.04);
    ctx.fillRect(x+w*0.63,y+h*0.73+bob,w*0.1,h*0.04);

  } else if(e.type==='ice'){
    // ──── ICE AGENT - DOOM SOLDIER STYLE ────
    // Tactical helmet
    ctx.fillStyle='#0a0a1e';
    ctx.fillRect(x+w*0.2,y+h*0.0+bob,w*0.6,h*0.08);  // helmet top
    ctx.fillStyle='#12122e';
    ctx.fillRect(x+w*0.22,y+h*0.06+bob,w*0.56,h*0.14); // helmet body
    // Visor
    ctx.fillStyle='#003366';
    ctx.fillRect(x+w*0.25,y+h*0.1+bob,w*0.5,h*0.06);
    // Visor glint
    ctx.fillStyle='rgba(100,180,255,0.4)';
    ctx.fillRect(x+w*0.27,y+h*0.11+bob,w*0.15,h*0.02);
    // Face/chin
    ctx.fillStyle='#c4956a';
    ctx.fillRect(x+w*0.28,y+h*0.16+bob,w*0.44,h*0.08);
    // Mouth - mean grimace
    ctx.fillStyle='#2a1510';
    ctx.fillRect(x+w*0.35,y+h*0.2+bob,w*0.3,h*0.02);
    // Tactical vest/body armor
    ctx.fillStyle='#1a1a2e';
    ctx.fillRect(x+w*0.12,y+h*0.24+bob+breathe,w*0.76,h*0.32);
    // Vest pouches
    ctx.fillStyle='#0e0e1e';
    ctx.fillRect(x+w*0.15,y+h*0.35+bob,w*0.15,h*0.1);
    ctx.fillRect(x+w*0.7,y+h*0.35+bob,w*0.15,h*0.1);
    // ICE patch on chest - big and visible
    ctx.fillStyle='#0044aa';
    ctx.fillRect(x+w*0.32,y+h*0.28+bob,w*0.36,h*0.12);
    ctx.fillStyle='#ffffff';
    ctx.font='bold '+(Math.max(8,h*0.08)|0)+'px monospace';
    ctx.fillText('ICE',x+w*0.35,y+h*0.38+bob);
    // Belt
    ctx.fillStyle='#0a0a15';
    ctx.fillRect(x+w*0.14,y+h*0.55+bob,w*0.72,h*0.04);
    // Belt buckle
    ctx.fillStyle='#888';
    ctx.fillRect(x+w*0.44,y+h*0.55+bob,w*0.12,h*0.04);
    // Tactical pants
    ctx.fillStyle='#1e1e30';
    ctx.fillRect(x+w*0.14,y+h*0.58+bob,w*0.3,h*0.3);
    ctx.fillRect(x+w*0.56,y+h*0.58+bob,w*0.3,h*0.3);
    // Knee pads
    ctx.fillStyle='#0a0a18';
    ctx.fillRect(x+w*0.18,y+h*0.72+bob,w*0.12,h*0.06);
    ctx.fillRect(x+w*0.7,y+h*0.72+bob,w*0.12,h*0.06);
    // Combat boots
    ctx.fillStyle='#0a0a0a';
    ctx.fillRect(x+w*0.12,y+h*0.87+bob,w*0.32,h*0.08);
    ctx.fillRect(x+w*0.56,y+h*0.87+bob,w*0.32,h*0.08);
    // Arms holding weapon
    ctx.fillStyle='#1a1a2e';
    ctx.fillRect(x+w*0.0,y+h*0.26+bob,w*0.15,h*0.2);  // left arm
    ctx.fillRect(x+w*0.85,y+h*0.26+bob,w*0.15,h*0.2); // right arm
    // Hands
    ctx.fillStyle='#c4956a';
    ctx.fillRect(x+w*0.0,y+h*0.44+bob,w*0.08,h*0.06);
    ctx.fillRect(x+w*0.92,y+h*0.44+bob,w*0.08,h*0.06);
    // Taser/weapon in hand
    ctx.fillStyle='#333';
    ctx.fillRect(x+w*0.88,y+h*0.38+bob,w*0.18,h*0.05);
    ctx.fillStyle='#ff0';
    ctx.fillRect(x+w*1.02,y+h*0.39+bob,w*0.06,h*0.03);

  } else {
    // ──── SHERIFF DEPUTY - DOOM SOLDIER VARIANT ────
    // Cowboy hat / campaign cover
    ctx.fillStyle='#6B4E1B';
    ctx.fillRect(x+w*0.1,y+h*0.04+bob,w*0.8,h*0.04);  // brim
    ctx.fillStyle='#8B6914';
    ctx.fillRect(x+w*0.25,y-h*0.02+bob,w*0.5,h*0.08);  // crown
    ctx.fillRect(x+w*0.3,y-h*0.06+bob,w*0.4,h*0.05);   // crown top
    // Head
    ctx.fillStyle='#c4956a';
    ctx.fillRect(x+w*0.25,y+h*0.08+bob,w*0.5,h*0.14);
    // Sunglasses
    ctx.fillStyle='#111';
    ctx.fillRect(x+w*0.28,y+h*0.1+bob,w*0.18,h*0.05);
    ctx.fillRect(x+w*0.54,y+h*0.1+bob,w*0.18,h*0.05);
    ctx.fillRect(x+w*0.46,y+h*0.11+bob,w*0.08,h*0.03); // bridge
    // Mustache
    ctx.fillStyle='#3a2a10';
    ctx.fillRect(x+w*0.35,y+h*0.17+bob,w*0.3,h*0.03);
    // Jaw set
    ctx.fillStyle='#2a1510';
    ctx.fillRect(x+w*0.38,y+h*0.19+bob,w*0.24,h*0.02);
    // Tan uniform shirt
    ctx.fillStyle='#CD853F';
    ctx.fillRect(x+w*0.12,y+h*0.22+bob+breathe,w*0.76,h*0.35);
    // Pocket flaps
    ctx.fillStyle='#b8752e';
    ctx.fillRect(x+w*0.2,y+h*0.3+bob,w*0.18,h*0.08);
    ctx.fillRect(x+w*0.62,y+h*0.3+bob,w*0.18,h*0.08);
    // Star badge - big, gold, proud
    ctx.fillStyle='#ffd700';
    let cx2=x+w*0.5,cy2=y+h*0.32+bob,sr=h*0.05;
    ctx.beginPath();
    for(let i=0;i<5;i++){
      let a2=-Math.PI/2+i*Math.PI*2/5;ctx.lineTo(cx2+Math.cos(a2)*sr,cy2+Math.sin(a2)*sr);
      a2+=Math.PI/5;ctx.lineTo(cx2+Math.cos(a2)*sr*0.4,cy2+Math.sin(a2)*sr*0.4);
    }ctx.closePath();ctx.fill();
    // Badge glint
    ctx.fillStyle='rgba(255,255,200,0.5)';
    ctx.fillRect(cx2-sr*0.2,cy2-sr*0.5,sr*0.3,sr*0.2);
    // Duty belt
    ctx.fillStyle='#2a2a1a';
    ctx.fillRect(x+w*0.14,y+h*0.55+bob,w*0.72,h*0.05);
    // Holster
    ctx.fillStyle='#1a1a10';
    ctx.fillRect(x+w*0.72,y+h*0.55+bob,w*0.12,h*0.12);
    // Gun in holster
    ctx.fillStyle='#333';
    ctx.fillRect(x+w*0.74,y+h*0.56+bob,w*0.08,h*0.06);
    // Dark pants
    ctx.fillStyle='#3a3a28';
    ctx.fillRect(x+w*0.14,y+h*0.59+bob,w*0.3,h*0.3);
    ctx.fillRect(x+w*0.56,y+h*0.59+bob,w*0.3,h*0.3);
    // Boot tops
    ctx.fillStyle='#2a1a0a';
    ctx.fillRect(x+w*0.12,y+h*0.82+bob,w*0.32,h*0.12);
    ctx.fillRect(x+w*0.56,y+h*0.82+bob,w*0.32,h*0.12);
    // Boot soles
    ctx.fillStyle='#0a0a0a';
    ctx.fillRect(x+w*0.12,y+h*0.92+bob,w*0.33,h*0.04);
    ctx.fillRect(x+w*0.56,y+h*0.92+bob,w*0.33,h*0.04);
    // Arms
    ctx.fillStyle='#CD853F';
    ctx.fillRect(x+w*0.0,y+h*0.24+bob,w*0.15,h*0.22);
    ctx.fillRect(x+w*0.85,y+h*0.24+bob,w*0.15,h*0.22);
    // Hands
    ctx.fillStyle='#c4956a';
    ctx.fillRect(x+w*0.0,y+h*0.44+bob,w*0.08,h*0.06);
    ctx.fillRect(x+w*0.92,y+h*0.44+bob,w*0.08,h*0.06);
  }

  // ──── SHARED EFFECTS ────
  // Red eyes when high (2+ hits) - override for humanoids
  if(e.hits>=2&&e.type!=='bovino'){
    let eyeY=e.type==='birdleg'?y+h*0.13+bob:e.type==='ice'?y+h*0.11+bob:y+h*0.1+bob;
    ctx.fillStyle='#ff0000';
    ctx.fillRect(x+w*0.33,eyeY,w*0.1,h*0.04);
    ctx.fillRect(x+w*0.57,eyeY,w*0.1,h*0.04);
  }
  // Green haze cloud when passive (sitting down baked)
  if(e.passive){
    ctx.fillStyle='rgba(0,180,0,0.2)';
    ctx.fillRect(x-w*0.1,y+h*0.1,w*1.2,h*0.6);
    ctx.fillStyle='rgba(50,255,50,0.15)';
    ctx.fillRect(x+w*0.1,y-h*0.05,w*0.3,h*0.2);
    ctx.fillRect(x+w*0.5,y+h*0.0,w*0.25,h*0.15);
    // Sitting sprite compress - squish them down
    ctx.fillStyle='rgba(0,100,0,0.25)';
    ctx.fillRect(x+w*0.1,y+h*0.7,w*0.8,h*0.25);
  }
  // Yell text
  if(e.yelling>0){
    ctx.fillStyle='#ff4444';ctx.font='bold '+(Math.max(10,h*0.12)|0)+'px monospace';
    ctx.strokeStyle='#000';ctx.lineWidth=2;
    ctx.strokeText(e.yellText,x+w*0.1,y-h*0.02);
    ctx.fillText(e.yellText,x+w*0.1,y-h*0.02);
  } else if(e.hits>=3){
    ctx.fillStyle='#44ff44';ctx.font=(Math.max(8,h*0.1)|0)+'px monospace';
    let qt=e.hits>=4?HIGH_QUOTES[(e.x*7+e.y*13|0)%HIGH_QUOTES.length]:'hehe...';
    ctx.strokeStyle='#000';ctx.lineWidth=1;
    ctx.strokeText(qt,x-w*0.1,y-h*0.05);
    ctx.fillText(qt,x-w*0.1,y-h*0.05);
  }
  ctx.globalAlpha=1;
}
// Draw DOOM-style weapon - THE GREEN CANNON (BFG equivalent)
function drawWeapon(throwAnim){
  let bob=running?Math.sin(Date.now()/80)*5:Math.sin(Date.now()/200)*2;
  let throwOff=throwAnim>0?-throwAnim*40:0;
  let pOff=pitch*0.3;
  let bx=W*0.42+bob, by=H*0.52+pOff;
  // Muzzle flash on fire
  if(throwAnim>0.5){
    ctx.fillStyle='rgba(0,255,0,0.4)';
    ctx.fillRect(bx+40,by-60+throwOff,60,40);
    ctx.fillStyle='rgba(100,255,100,0.6)';
    ctx.fillRect(bx+55,by-50+throwOff,30,20);
  }
  // Weapon body - big chunky cannon
  ctx.fillStyle='#2a2a2a';
  ctx.fillRect(bx+10,by+throwOff,120,45); // main barrel housing
  ctx.fillStyle='#1a1a1a';
  ctx.fillRect(bx+15,by+5+throwOff,110,35); // inner barrel
  // Barrel bore
  ctx.fillStyle='#0a0a0a';
  ctx.fillRect(bx+120,by+12+throwOff,15,20);
  // Green energy core (the weed chamber)
  ctx.fillStyle='#1a5c1a';
  ctx.fillRect(bx+30,by+8+throwOff,50,28);
  // Glowing green chamber
  let glow=0.4+Math.sin(Date.now()/200)*0.2;
  ctx.fillStyle='rgba(0,200,0,'+glow+')';
  ctx.fillRect(bx+35,by+12+throwOff,40,20);
  // Chamber details - leaf matter visible
  ctx.fillStyle='#2d8c2d';
  ctx.fillRect(bx+40,by+15+throwOff,8,6);
  ctx.fillRect(bx+52,by+18+throwOff,10,5);
  ctx.fillRect(bx+45,by+22+throwOff,7,5);
  // Barrel rings
  ctx.fillStyle='#3a3a3a';
  ctx.fillRect(bx+85,by+2+throwOff,5,40);
  ctx.fillRect(bx+100,by+2+throwOff,5,40);
  ctx.fillRect(bx+115,by+2+throwOff,5,40);
  // Top rail
  ctx.fillStyle='#333';
  ctx.fillRect(bx+20,by-3+throwOff,100,6);
  // Side grip details
  ctx.fillStyle='#222';
  ctx.fillRect(bx+10,by+40+throwOff,80,8);
  // Grip handle
  ctx.fillStyle='#3a2a1a';
  ctx.fillRect(bx+45,by+45+throwOff,30,50);
  ctx.fillStyle='#2a1a0a';
  ctx.fillRect(bx+48,by+48+throwOff,24,44);
  // Grip texture lines
  ctx.fillStyle='#4a3a2a';
  for(let gy=0;gy<6;gy++){ctx.fillRect(bx+48,by+52+gy*7+throwOff,24,2);}
  // Hand on grip
  ctx.fillStyle='#c4956a';
  ctx.fillRect(bx+42,by+52+throwOff,38,25);
  // Fingers wrapping
  ctx.fillStyle='#b8855a';
  ctx.fillRect(bx+42,by+56+throwOff,6,18);
  ctx.fillRect(bx+50,by+58+throwOff,6,16);
  ctx.fillRect(bx+58,by+56+throwOff,6,18);
  ctx.fillRect(bx+66,by+54+throwOff,6,16);
  // Wrist/arm
  ctx.fillStyle='#c4956a';
  ctx.fillRect(bx+35,by+75+throwOff,50,80);
  // Sleeve
  ctx.fillStyle='#444';
  ctx.fillRect(bx+30,by+100+throwOff,60,60);
  // Ammo counter on weapon (LED style)
  ctx.fillStyle='#001100';
  ctx.fillRect(bx+60,by+3+throwOff,22,12);
  ctx.fillStyle='#00ff00';
  ctx.font='bold 9px monospace';
  ctx.fillText(ammo<10?'0'+ammo:''+ammo,bx+63,by+12+throwOff);
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
  // Free prisoners on Alcatraz level when nearby enemies killed
  if(currentLevel===4){
    for(let pr of prisoners){
      if(pr.freed)continue;
      // Free if no active enemies within 4 units
      let nearActive=enemies.some(e=>!e.passive&&Math.hypot(e.x-pr.x,e.y-pr.y)<4);
      if(!nearActive&&enemies.some(e=>e.passive&&Math.hypot(e.x-pr.x,e.y-pr.y)<6)){
        pr.freed=true;freedCount++;score+=200;
        addScorePopup(W/2,H/2-60,'FREED +200','#44ff44');
        screenShake=4;
      }
    }
  }
  // clean defeated & check wave
  let active=enemies.filter(e=>!e.passive);
  if(active.length===0&&enemies.length>0){
    wave++;ammo+=10+wave*2;enemies=[];
    // Check level transition
    let newLvl=getLevelForWave(wave);
    if(newLvl!==currentLevel){
      loadLevel(newLvl);
      px=2.5;py=2.5;pa=0;pitch=0;
      // Level transition flash
      setTimeout(()=>{screenShake=12;addParticles(W/2,H/2,'#fff',30);},500);
    }
    setTimeout(()=>spawnWave(),2000);
  }
}
// DOOM face - draws a pixel-art face that reacts to health
function drawDoomFace(){
  let fc=document.getElementById('doomFace');
  if(!fc)return;
  let f=fc.getContext('2d');
  f.clearRect(0,0,40,48);
  // Face background - skin
  f.fillStyle='#c4956a';
  f.fillRect(6,6,28,36);
  // Hair
  f.fillStyle='#3a2a1a';
  f.fillRect(6,2,28,8);
  // Expression based on health
  if(hp>70){
    // Happy/confident
    f.fillStyle='#fff';f.fillRect(12,16,6,6);f.fillRect(22,16,6,6); // eyes
    f.fillStyle='#222';f.fillRect(14,18,3,3);f.fillRect(24,18,3,3); // pupils
    f.fillStyle='#a06040';f.fillRect(14,28,12,3); // mouth
    f.fillStyle='#fff';f.fillRect(16,28,8,2); // teeth grin
  } else if(hp>40){
    // Concerned
    f.fillStyle='#fff';f.fillRect(12,16,6,6);f.fillRect(22,16,6,6);
    f.fillStyle='#222';f.fillRect(13,18,3,3);f.fillRect(25,18,3,3); // looking around
    f.fillStyle='#a06040';f.fillRect(16,30,8,2); // tight mouth
    // Sweat drop
    f.fillStyle='rgba(100,180,255,0.6)';f.fillRect(32,14,3,5);
  } else if(hp>15){
    // Hurt/angry
    f.fillStyle='#ff8888';f.fillRect(12,16,6,6);f.fillRect(22,16,6,6); // bloodshot eyes
    f.fillStyle='#222';f.fillRect(14,17,3,4);f.fillRect(24,17,3,4);
    f.fillStyle='#600';f.fillRect(10,26,2,6); // blood
    f.fillStyle='#a06040';f.fillRect(14,30,12,3);
    f.fillStyle='#fff';f.fillRect(16,30,3,2);f.fillRect(22,30,3,2); // gritted teeth
    // Brow furrow
    f.fillStyle='#8a6540';f.fillRect(10,14,8,2);f.fillRect(22,14,8,2);
  } else {
    // Near death - DOOM guy bloody
    f.fillStyle='#ff4444';f.fillRect(12,16,6,6);f.fillRect(22,16,6,6);
    f.fillStyle='#000';f.fillRect(14,18,3,3);f.fillRect(24,18,3,3);
    f.fillStyle='#800';
    f.fillRect(8,20,4,12);f.fillRect(28,22,4,8); // blood streams
    f.fillRect(18,12,4,4); // forehead wound
    f.fillStyle='#a06040';f.fillRect(14,32,12,2); // grimace
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
  let ln=document.getElementById('levelName');
  if(ln)ln.innerText=LEVELS[currentLevel].name;
  drawDoomFace();
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
// Draw prisoners (Alcatraz level)
function drawPrisoners(){
  if(currentLevel!==4)return;
  for(let pr of prisoners){
    let dx=pr.x-px,dy=pr.y-py,dist=Math.sqrt(dx*dx+dy*dy);
    let angle=Math.atan2(dy,dx)-pa;
    while(angle<-Math.PI)angle+=Math.PI*2;
    while(angle>Math.PI)angle-=Math.PI*2;
    if(Math.abs(angle)>FOV||dist<0.3)continue;
    let screenX=W/2+Math.tan(angle)*(W/2)/Math.tan(HALF_FOV);
    let screenH=Math.min(H*2,(H/dist)|0);
    let shade=Math.max(0.15,1-dist/8);
    let w=screenH*0.4,h=screenH*0.8;
    let x=screenX-w/2,y=H/2+pitch-h/2;
    ctx.globalAlpha=shade;
    if(pr.freed){
      // Running away - green tint, smaller
      ctx.fillStyle='#4a6a4a';
      ctx.fillRect(x+w*0.3,y+h*0.1,w*0.4,h*0.2); // head
      ctx.fillRect(x+w*0.15,y+h*0.3,w*0.7,h*0.35); // body
      ctx.fillStyle='#5a8a5a';
      ctx.font=(Math.max(6,h*0.08)|0)+'px monospace';
      ctx.fillText('FREE!',x,y);
    } else {
      // Huddled in cell - orange jumpsuit
      ctx.fillStyle='#cc6600';
      ctx.fillRect(x+w*0.25,y+h*0.05,w*0.5,h*0.2); // head
      ctx.fillRect(x+w*0.1,y+h*0.25,w*0.8,h*0.4); // jumpsuit body
      ctx.fillStyle='#aa5500';
      ctx.fillRect(x+w*0.15,y+h*0.65,w*0.3,h*0.3); // legs
      ctx.fillRect(x+w*0.55,y+h*0.65,w*0.3,h*0.3);
      // Face
      ctx.fillStyle='#c4956a';
      ctx.fillRect(x+w*0.3,y+h*0.08,w*0.4,h*0.15);
      // Sad eyes
      ctx.fillStyle='#222';
      ctx.fillRect(x+w*0.35,y+h*0.12,w*0.08,h*0.04);
      ctx.fillRect(x+w*0.57,y+h*0.12,w*0.08,h*0.04);
      // "HELP" text
      ctx.fillStyle='#ff8844';
      ctx.font=(Math.max(6,h*0.08)|0)+'px monospace';
      ctx.fillText('HELP',x+w*0.1,y);
    }
    ctx.globalAlpha=1;
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
  drawPrisoners();
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
    enemies_json:JSON.stringify({level:currentLevel,enemies:enemies.map(e=>({type:e.type,x:e.x,y:e.y,hp:e.hp,hits:e.hits,passive:e.passive}))})};
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
  let parsed=JSON.parse(s.enemies_json);
  // Support both old format (array) and new format ({level,enemies})
  let savedLevel=0,eds=[];
  if(Array.isArray(parsed)){eds=parsed;}else{savedLevel=parsed.level||0;eds=parsed.enemies||[];}
  loadLevel(savedLevel);
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
    loadLevel(0);
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
