(function(){
  const chapters=window.CHAPTERS||[];
  const total=chapters.reduce((n,c)=>n+c.questions.length,0);
  const key='accountancy-revision-room-v1';
  let state={};
  try{state=JSON.parse(localStorage.getItem(key))||{}}catch(e){}
  let open=new Set(), exam=false, search='';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const qid=(ci,qi)=>`${ci+1}-${qi+1}`;
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(e){}};
  const count=(ci,kind)=>chapters[ci].questions.filter((_,qi)=>state[qid(ci,qi)]===kind).length;
  const overall=kind=>Object.values(state).filter(s=>s===kind).length;
  function nav(){
    const groups=[['chapters-a',0,7],['chapters-company',7,8],['chapters-b',8,12]];
    groups.forEach(([id,a,b])=>$(id).innerHTML=chapters.slice(a,b).map((c,j)=>{const i=a+j;return `<a class="chapter-link" href="#chapter-${i+1}" data-route="chapter-${i+1}"><span class="chapter-no">${String(i+1).padStart(2,'0')}</span><span>${esc(c.short)}</span></a>`}).join(''));
    const confident=overall('known');
    $('progress-percent').textContent=Math.round(confident/total*100)+'%';
    $('progress-fill').style.width=confident/total*100+'%';
    $('progress-caption').textContent=`${confident} of ${total} marked confident`;
    $('review-count').textContent=overall('again');
  }
  function setActive(route){
    document.querySelectorAll('[data-route],#overview-link,#review-link').forEach(el=>el.classList.remove('active'));
    const el=route==='overview'?$('overview-link'):route==='review'?$('review-link'):document.querySelector(`[data-route="${route}"]`);
    if(el)el.classList.add('active');
    $('breadcrumb').textContent=route==='overview'?'Overview':route==='review'?'Needs another try':chapters[Number(route.split('-')[1])-1]?.short||'Overview';
    $('rail').classList.remove('open');$('scrim').classList.remove('open');$('menu').setAttribute('aria-expanded','false');
  }
  function overview(){
    const group=(name,a,b)=>`<div class="section-head"><h2>${esc(name)}</h2><span>${b-a} ${b-a===1?'chapter':'chapters'}</span></div><div class="chapter-grid">${chapters.slice(a,b).map((c,j)=>{const i=a+j;return `<a class="chapter-card" href="#chapter-${i+1}"><div class="tiny">CHAPTER ${String(i+1).padStart(2,'0')} · ${c.questions.length} LONG QUESTIONS</div><h3>${esc(c.title)}</h3><p>${esc(c.focus)}</p><div class="done">${count(i,'known')}/${c.questions.length} confident</div><div class="mini-track"><span style="width:${count(i,'known')/c.questions.length*100}%"></span></div></a>`}).join('')}</div>`;
    $('app').innerHTML=`<div class="page"><section class="hero"><div class="eyebrow">CLASS XII · ACCOUNTANCY</div><h1>Work the full problem.</h1><p class="deck">Three substantial questions per chapter, each with a step-by-step worked solution. Attempt them on paper before revealing the answer.</p><div class="hero-visual"><div class="tiny">THE STUDY LOOP</div><p>Read the prompt → solve on paper → compare each working → mark it for another try or move on.</p></div></section><div class="stats"><div class="stat"><strong>12</strong><span>chapters in scope</span></div><div class="stat"><strong>${total}</strong><span>comprehensive questions</span></div><div class="stat"><strong>${overall('known')}</strong><span>marked confident</span></div></div>${group('Partnership',0,7)}${group('Company accounts',7,8)}${group('Financial statement analysis',8,12)}</div>`;
  }
  function question(ci,qi){const q=chapters[ci].questions[qi],id=qid(ci,qi),status=state[id],shown=open.has(id)&&!exam;
    return `<article class="question-card" id="q-${id}"><div class="question-top"><span class="question-num">QUESTION ${String(qi+1).padStart(2,'0')}</span>${q.tags.map(t=>`<span class="pill">${esc(t)}</span>`).join('')}<span class="marks">${q.marks} MARKS · EXTENDED</span></div><h3>${esc(q.title)}</h3><p class="prompt">${esc(q.prompt)}</p><div class="answer-area"><button type="button" class="answer-toggle" data-toggle="${id}" aria-expanded="${shown}">${shown?'Hide worked solution':'Reveal worked solution'}</button>${shown?`<div class="answer"><div class="section-label">WORKED SOLUTION</div><div class="steps">${q.steps.map((s,i)=>`<div class="step"><span class="step-no">${i+1}</span><p>${esc(s)}</p></div>`).join('')}</div><div class="status-row"><span class="tiny">AFTER COMPARING</span><button class="status-btn known ${status==='known'?'selected':''}" data-status="known" data-id="${id}">Confident</button><button class="status-btn again ${status==='again'?'selected':''}" data-status="again" data-id="${id}">Try again</button></div></div>`:''}</div></article>`;
  }
  function chapter(ci){const c=chapters[ci];$('app').innerHTML=`<div class="page"><div class="chapter-heading"><div><div class="eyebrow">${esc(c.part)} · CHAPTER ${ci+1}</div><h1>${esc(c.title)}</h1><p class="deck">${esc(c.focus)}. Set out your workings and journal or account format where the question asks for them.</p></div><a href="#overview" class="back">All chapters ↗</a></div><div class="focus-strip"><div class="section-label">QUICK CHECKS BEFORE YOU START</div><ul>${c.formula.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></div><div class="toolbar"><span class="question-count">${c.questions.length} COMPREHENSIVE QUESTIONS</span><button type="button" id="exam-toggle" class="${exam?'active':''}">${exam?'Exit exam mode':'Exam mode'}</button><button type="button" id="show-all">Reveal all</button><button type="button" id="hide-all">Hide all</button></div><div id="question-list">${c.questions.map((_,qi)=>question(ci,qi)).join('')}</div></div>`;
    $('exam-toggle').onclick=()=>{exam=!exam;if(exam)open.clear();render()};
    $('show-all').onclick=()=>{exam=false;c.questions.forEach((_,qi)=>open.add(qid(ci,qi)));render()};
    $('hide-all').onclick=()=>{c.questions.forEach((_,qi)=>open.delete(qid(ci,qi)));render()};
  }
  function review(){const list=[];chapters.forEach((c,ci)=>c.questions.forEach((q,qi)=>{if(state[qid(ci,qi)]==='again')list.push([ci,qi,q])}));
    $('app').innerHTML=`<div class="page"><div class="eyebrow">TARGETED PRACTICE</div><h1>Needs another try.</h1><p class="deck">These are the questions you marked after checking the worked solution. Rework them without opening the solution first.</p><div style="height:30px"></div>${list.length?list.map(([ci,qi])=>`<div class="eyebrow" style="margin:30px 0 10px">${esc(chapters[ci].short)} · Chapter ${ci+1}</div>${question(ci,qi)}`).join(''):`<div class="review-empty">Nothing here yet. Mark a question “Try again” after reviewing its solution.</div>`}</div>`;
  }
  function render(){nav();let route=location.hash.slice(1)||'overview';const m=/^chapter-(\d+)$/.exec(route);if(m){const i=Number(m[1])-1;if(chapters[i]){chapter(i);setActive(route);return}}if(route==='review'){review();setActive(route);return}overview();setActive('overview')}
  document.addEventListener('click',e=>{
    const toggle=e.target.closest('[data-toggle]');if(toggle){const id=toggle.dataset.toggle;if(open.has(id))open.delete(id);else open.add(id);exam=false;const y=window.scrollY;render();window.scrollTo(0,y);return}
    const status=e.target.closest('[data-status]');if(status){state[status.dataset.id]=status.dataset.status;save();const y=window.scrollY;render();window.scrollTo(0,y);return}
  });
  $('menu').onclick=()=>{const v=!$('rail').classList.contains('open');$('rail').classList.toggle('open',v);$('scrim').classList.toggle('open',v);$('menu').setAttribute('aria-expanded',String(v))};
  $('scrim').onclick=()=>{$('rail').classList.remove('open');$('scrim').classList.remove('open');$('menu').setAttribute('aria-expanded','false')};
  window.addEventListener('hashchange',()=>{open.clear();exam=false;render();window.scrollTo(0,0)});
  render();
})();
