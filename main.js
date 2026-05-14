const defaultCourses=[
  {id:1,tag:"INF-A",name:"4to Informática A",emoji:"💻",totalStars:0,ratingCount:0,c1:"#1a5fc4",c2:"#4080e0",bg:"#ddeafc",fg:"#0a3a80",desc:"Cortometraje en inglés de los estudiantes de 4to Informática A."},
  {id:2,tag:"INF-B",name:"4to Informática B",emoji:"🖥️",totalStars:0,ratingCount:0,c1:"#0d4ea0",c2:"#2b72cc",bg:"#cce0f8",fg:"#08347a",desc:"Cortometraje en inglés de los estudiantes de 4to Informática B."},
  {id:3,tag:"MER",  name:"4to Mercadeo",    emoji:"📈",totalStars:0,ratingCount:0,c1:"#b86f12",c2:"#d98f30",bg:"#faecd5",fg:"#7a4800",desc:"Cortometraje en inglés de los estudiantes de 4to Mercadeo."},
  {id:4,tag:"TRI",  name:"4to Tributaria",  emoji:"📋",totalStars:0,ratingCount:0,c1:"#1a9c5b",c2:"#29c478",bg:"#d5f5e8",fg:"#0d6040",desc:"Cortometraje en inglés de los estudiantes de 4to Tributaria."},
  {id:5,tag:"ENF-A",name:"4to Enfermería A",emoji:"🏥",totalStars:0,ratingCount:0,c1:"#c41e6e",c2:"#e8398a",bg:"#fddcef",fg:"#8c1050",desc:"Cortometraje en inglés de los estudiantes de 4to Enfermería A."},
  {id:6,tag:"ENF-B",name:"4to Enfermería B",emoji:"💊",totalStars:0,ratingCount:0,c1:"#8a1ac4",c2:"#ae45e8",bg:"#f0ddfb",fg:"#5c0d8c",desc:"Cortometraje en inglés de los estudiantes de 4to Enfermería B."}
];

let courses = JSON.parse(localStorage.getItem('cinevota_courses')) || defaultCourses;
let voters = JSON.parse(localStorage.getItem('cinevota_voters')) || [];

// Migrate old data if necessary (replace votes with totalStars/ratingCount)
courses.forEach(c => {
  if (c.totalStars === undefined) {
    c.totalStars = 0;
    c.ratingCount = 0;
  }
});

let currentVoter='', cdTimer=null;
let currentRatings = {}; // { courseId: value }
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

function goToVote(){
  const inp=document.getElementById('inp-name');
  const err=document.getElementById('n-err');
  const name=inp.value.trim();
  if(!name){err.classList.add('show');inp.style.borderColor='var(--red)';inp.focus();return;}
  err.classList.remove('show');inp.style.borderColor='';
  currentVoter=name;
  currentRatings = {}; // Reset local ratings for new voter
  document.getElementById('chip-name').textContent=name;
  renderCards();renderResults();show('screen-vote');
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
  document.getElementById('cards-grid').innerHTML=courses.map(c=>{
    const avg = c.ratingCount > 0 ? (c.totalStars / c.ratingCount).toFixed(1) : "0.0";
    return `
    <div class="vote-card" id="card-${c.id}">
      <div class="card-photo"><div class="card-tag">${c.tag}</div>${makePhoto(c)}</div>
      <div class="card-body">
        <div class="card-name">${c.emoji} ${c.name}</div>
        <div class="card-desc">${c.desc}</div>
        <div class="card-meta">
          <div class="card-vlbl">Promedio global: <span id="cv-${c.id}">${avg} ⭐</span></div>
        </div>
        <div class="card-mbar"><div class="card-mfill" id="mf-${c.id}"></div></div>
        
        <div class="card-stars">
          <div class="card-stars-lbl">Califica este corto</div>
          <div class="star-rating" id="stars-${c.id}">
            <i class="fa-solid fa-star star-icon" onclick="rateCourse(${c.id}, 1)"></i>
            <i class="fa-solid fa-star star-icon" onclick="rateCourse(${c.id}, 2)"></i>
            <i class="fa-solid fa-star star-icon" onclick="rateCourse(${c.id}, 3)"></i>
            <i class="fa-solid fa-star star-icon" onclick="rateCourse(${c.id}, 4)"></i>
            <i class="fa-solid fa-star star-icon" onclick="rateCourse(${c.id}, 5)"></i>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

window.rateCourse = function(cId, val) {
  currentRatings[cId] = val;
  const container = document.getElementById(`stars-${cId}`);
  if(!container) return;
  const stars = container.querySelectorAll('.star-icon');
  stars.forEach((s, index) => {
    if(index < val) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });
};

function renderResults(){
  const tot = document.getElementById('total-count');
  if(tot) tot.textContent = voters.length;

  const sorted=[...courses].sort((a,b)=> {
    const avgA = a.ratingCount > 0 ? a.totalStars / a.ratingCount : 0;
    const avgB = b.ratingCount > 0 ? b.totalStars / b.ratingCount : 0;
    return avgB - avgA;
  });

  const rl=document.getElementById('results-list');
  if(rl) rl.innerHTML=sorted.map((c,i)=>{
    const avg = c.ratingCount > 0 ? (c.totalStars / c.ratingCount) : 0;
    const pct = (avg / 5) * 100;
    const top = i===0 && c.ratingCount > 0;
    return `<div class="res-item${top?' first':''}">
      <div class="res-hdr">
        <div class="res-rank">${top?'👑':i+1}</div>
        <div class="res-name" title="${c.name}">${c.name}</div>
        <div class="res-pct">${avg.toFixed(1)} ⭐</div>
        <div class="res-vsm">(${c.ratingCount} votos)</div>
      </div>
      <div class="res-bg"><div class="res-bar" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  courses.forEach(c=>{
    const avg = c.ratingCount > 0 ? (c.totalStars / c.ratingCount) : 0;
    const pct = (avg / 5) * 100;
    const mf=document.getElementById(`mf-${c.id}`);
    if(mf) mf.style.width=pct+'%';
  });

  const vl=document.getElementById('voters-list');
  if(vl) vl.innerHTML=voters.length
    ? voters.slice(-10).reverse().map(v=>`<span class="voter-pill">✓ ${v.name}</span>`).join('')
    :'<span style="font-size:.77rem;color:var(--g500)">Aún nadie ha evaluado</span>';
    
  const vb=document.getElementById('vbadge');
  const vbn=document.getElementById('vbadge-n');
  if(vb&&vbn&&voters.length>0){vb.classList.add('show');vbn.textContent=voters.length;}
}

function openSubmitModal(){
  if(Object.keys(currentRatings).length === 0) {
    alert("⚠️ Por favor califica al menos un cortometraje dándole clic a las estrellas antes de enviar.");
    return;
  }
  document.getElementById('m-voter').textContent=currentVoter;
  document.getElementById('overlay').classList.add('open');
}

function closeModal(){document.getElementById('overlay').classList.remove('open');}

function confirmVote(){
  if(Object.keys(currentRatings).length === 0) {
    closeModal();
    return;
  }

  // Update courses totals
  Object.keys(currentRatings).forEach(cId => {
    const course = courses.find(x => x.id === parseInt(cId));
    if(course) {
      course.totalStars += currentRatings[cId];
      course.ratingCount += 1;
    }
  });

  // Log voter action
  voters.push({
    name: currentVoter,
    date: new Date().toISOString(),
    ratings: currentRatings // Object with courseId : starValue
  });

  saveState();
  closeModal();
  renderResults();
  
  document.getElementById('t-name').textContent=currentVoter;
  show('screen-thanks');
  launchConfetti();startCountdown(7);
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
  const inp=document.getElementById('inp-name');
  if(inp) { inp.value=''; inp.style.borderColor=''; }
  const err=document.getElementById('n-err');
  if(err) err.classList.remove('show');
  currentVoter='';
  currentRatings={};
  renderResults();show('screen-name');
  if(inp) setTimeout(()=>inp.focus(),400);
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
  renderResults();
  const inpName = document.getElementById('inp-name');
  if(inpName) {
    inpName.addEventListener('input',function(){
      if(this.value.trim()){this.style.borderColor='';document.getElementById('n-err').classList.remove('show');}
    });
  }
}
