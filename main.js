const defaultCourses=[
  {id:1,tag:"INF-A",name:"4to Informática A",emoji:"💻",votes:0,c1:"#1a5fc4",c2:"#4080e0",bg:"#ddeafc",fg:"#0a3a80",desc:"Cortometraje en inglés de los estudiantes de 4to Informática A."},
  {id:2,tag:"INF-B",name:"4to Informática B",emoji:"🖥️",votes:0,c1:"#0d4ea0",c2:"#2b72cc",bg:"#cce0f8",fg:"#08347a",desc:"Cortometraje en inglés de los estudiantes de 4to Informática B."},
  {id:3,tag:"MER",  name:"4to Mercadeo",    emoji:"📈",votes:0,c1:"#b86f12",c2:"#d98f30",bg:"#faecd5",fg:"#7a4800",desc:"Cortometraje en inglés de los estudiantes de 4to Mercadeo."},
  {id:4,tag:"TRI",  name:"4to Tributaria",  emoji:"📋",votes:0,c1:"#1a9c5b",c2:"#29c478",bg:"#d5f5e8",fg:"#0d6040",desc:"Cortometraje en inglés de los estudiantes de 4to Tributaria."},
  {id:5,tag:"ENF-A",name:"4to Enfermería A",emoji:"🏥",votes:0,c1:"#c41e6e",c2:"#e8398a",bg:"#fddcef",fg:"#8c1050",desc:"Cortometraje en inglés de los estudiantes de 4to Enfermería A."},
  {id:6,tag:"ENF-B",name:"4to Enfermería B",emoji:"💊",votes:0,c1:"#8a1ac4",c2:"#ae45e8",bg:"#f0ddfb",fg:"#5c0d8c",desc:"Cortometraje en inglés de los estudiantes de 4to Enfermería B."}
];

let courses = JSON.parse(localStorage.getItem('cinevota_courses')) || defaultCourses;
let voters = JSON.parse(localStorage.getItem('cinevota_voters')) || [];

let pendingId=null,cdTimer=null;
const CIRC=163.4;

function saveState() {
  localStorage.setItem('cinevota_courses', JSON.stringify(courses));
  localStorage.setItem('cinevota_voters', JSON.stringify(voters));
}

function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

function makePhoto(c){
  const pts=[{x:50,y:0,r:15,rb:13,op:.7},{x:103,y:-7,r:17,rb:15,op:.95},{x:158,y:-2,r:19,rb:17,op:1},{x:213,y:-4,r:16,rb:14,op:.9},{x:260,y:5,r:13,rb:11,op:.6}];
  const bl=140;
  const ppl=pts.map(p=>{
    const hy=bl+p.y-p.rb*2.2-p.r;const by=bl+p.y-p.rb;
    return `<circle cx="${p.x}" cy="${hy}" r="${p.r}" fill="${c.c1}" opacity="${p.op}"/>
    <ellipse cx="${p.x}" cy="${by}" rx="${p.rb}" ry="${p.rb*1.1}" fill="${c.c2}" opacity="${p.op*.82}"/>`;
  }).join('');
  return `<svg viewBox="0 0 300 182" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <rect width="300" height="182" fill="${c.bg}"/>
    <circle cx="268" cy="24" r="52" fill="${c.c1}" opacity=".06"/>
    <circle cx="14" cy="170" r="44" fill="${c.c2}" opacity=".07"/>
    <rect x="0" y="140" width="300" height="42" fill="${c.c1}" opacity=".08"/>
    <line x1="0" y1="140" x2="300" y2="140" stroke="${c.c1}" stroke-width="1.5" opacity=".2"/>
    ${ppl}
    <rect x="0" y="158" width="300" height="24" fill="${c.c1}" opacity=".13"/>
    <text x="150" y="175" text-anchor="middle" font-family="Outfit,sans-serif" font-size="11" font-weight="600" fill="${c.fg}" opacity=".85">Integrantes del curso ${c.emoji}</text>
  </svg>`;
}

function renderCards(){
  const grid = document.getElementById('cards-grid');
  if(!grid) return;
  grid.innerHTML=courses.map(c=>`
    <div class="vote-card" id="card-${c.id}" onclick="openModal(${c.id})">
      <div class="card-photo"><div class="card-tag">${c.tag}</div>${makePhoto(c)}</div>
      <div class="card-body">
        <div class="card-name">${c.emoji} ${c.name}</div>
        <div class="card-desc">${c.desc}</div>
        <button class="vote-btn">🗳️ &nbsp;Votar por este</button>
      </div>
    </div>`).join('');
}

function openModal(id){
  pendingId=id;
  const c=courses.find(x=>x.id===id);
  document.getElementById('m-course').textContent=`"${c.name}"`;
  document.getElementById('overlay').classList.add('open');
}

function closeModal(){document.getElementById('overlay').classList.remove('open');pendingId=null;}

function confirmVote(){
  if(!pendingId)return;
  const c=courses.find(x=>x.id===pendingId);
  c.votes++;
  
  voters.push({
    courseId: c.id,
    date: new Date().toISOString()
  });

  saveState();
  closeModal();
  
  document.getElementById('t-course').textContent=`${c.emoji}  ${c.name}`;
  show('screen-thanks');
  launchConfetti();
  startCountdown(5); // 5 seconds wait before next vote is ready
}

function startCountdown(secs){
  clearInterval(cdTimer);
  let rem=secs;
  const numEl=document.getElementById('cd-num');
  const ring=document.getElementById('ring');
  function tick(){
    if(numEl)numEl.textContent=rem;
    if(ring)ring.style.strokeDashoffset=CIRC*(1-rem/secs);
    if(rem<=0){clearInterval(cdTimer);resetForNext();}
    rem--;
  }
  tick();cdTimer=setInterval(tick,1000);
}

function resetForNext(){
  clearInterval(cdTimer);
  pendingId=null;
  show('screen-vote');
}

function launchConfetti(){
  const cols=['#C41E3A','#E8394F','#FFD700','#FF8C00','#fff','#ff6b6b','#ffd6dc'];
  for(let i=0;i<90;i++)setTimeout(()=>{
    const el=document.createElement('div');el.className='conf';
    const s=Math.random()*9+5;
    el.style.cssText=`left:${Math.random()*100}vw;width:${s}px;height:${s}px;background:${cols[Math.floor(Math.random()*cols.length)]};border-radius:${Math.random()>.5?'50%':'3px'};animation-duration:${Math.random()*2.5+1.8}s;--dx:${(Math.random()-.5)*120}px;`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),5000);
  },i*30);
}

// Inicialización
if(document.getElementById('cards-grid')) {
  renderCards();
}
