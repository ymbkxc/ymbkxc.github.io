const state={papers:[],filtered:[],selected:null,chunks:new Map(),query:"",page:0,request:0};
const $=s=>document.querySelector(s);
const els={list:$("#paperList"),search:$("#search"),count:$("#paperCount"),result:$("#resultCount"),clear:$("#clearSearch"),empty:$("#emptyState"),view:$("#paperView"),status:$("#status")};
const norm=s=>(s||"").toLocaleLowerCase().normalize("NFKC");
const mathRender=el=>window.ICMLMath?.render(el);

async function boot(){
  try{state.papers=window.ICML_DATA?.index||await fetch("data/index.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error();return r.json()});state.filtered=state.papers;els.count.textContent=state.papers.length.toLocaleString("zh-CN");$('#translationProgress').textContent=`题目已译 ${state.papers.filter(p=>p.title_complete||p.complete).length} / ${state.papers.length} · 摘要已译 ${state.papers.filter(p=>p.complete).length} / ${state.papers.length}`;renderList();const id=location.hash.slice(1);await selectPaper(id||66328)}catch(e){els.result.textContent="数据载入失败，请刷新页面"}
}
function renderList(){
  els.result.textContent=`显示 ${state.filtered.length.toLocaleString("zh-CN")} 篇`;
  els.clear.hidden=!state.query;
  const pages=Math.max(1,Math.ceil(state.filtered.length/180));state.page=Math.min(state.page,pages-1);const shown=state.filtered.slice(state.page*180,(state.page+1)*180);
  els.list.innerHTML=shown.map((p,i)=>`<button class="paper-card${p.id===state.selected?" active":""}" role="option" aria-selected="${p.id===state.selected}" data-id="${p.id}"><span class="card-index">${String(i+1).padStart(4,"0")}</span><span class="card-title" lang="en">${escapeHtml(p.en)}</span><span class="card-title-zh" lang="zh-CN">${escapeHtml(p.zh||"中文待翻译")}</span><span class="card-topic">${escapeHtml(p.topic||"")}</span></button>`).join("");
  $('#pageLabel').textContent=`${state.page+1} / ${pages}`;$('#prevPage').disabled=state.page===0;$('#nextPage').disabled=state.page>=pages-1;
  mathRender(els.list);
}
async function selectPaper(id){
  const meta=state.papers.find(p=>String(p.id)===String(id));if(!meta)return;
  const savedListTop=els.list.scrollTop,previousPage=state.page;
  const request=++state.request;state.selected=meta.id;history.replaceState(null,'',`#${meta.id}`);const position=state.filtered.findIndex(p=>p.id===meta.id);if(position>=0)state.page=Math.floor(position/180);renderList();
  els.list.scrollTop=state.page===previousPage?savedListTop:0;
  const active=els.list.querySelector(`[data-id="${CSS.escape(String(meta.id))}"]`);
  if(active){const box=active.getBoundingClientRect(),listBox=els.list.getBoundingClientRect();if(box.top<listBox.top)els.list.scrollTop+=box.top-listBox.top;else if(box.bottom>listBox.bottom)els.list.scrollTop+=box.bottom-listBox.bottom;}
  let chunk=state.chunks.get(meta.chunk);if(!chunk){try{chunk=window.ICML_DATA?.chunks[meta.chunk]||await fetch(`data/chunks/${meta.chunk}.json`,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json()});state.chunks.set(meta.chunk,chunk)}catch(e){toast('摘要加载失败，请重新点击论文重试');return}}if(request!==state.request)return;
  const paper=chunk.find(p=>String(p.id)===String(meta.id));if(!paper)return;
  els.empty.hidden=true;els.view.hidden=false;$("#paperType").textContent=paper.type||"Paper";$("#paperTopic").textContent=paper.topic||"";$("#titleEn").textContent=paper.title_en;$("#titleZh").textContent=paper.title_zh||"中文待翻译";$("#icmlLink").href=paper.icml_url;const or=$("#openreviewLink");or.hidden=!paper.openreview_url;or.href=paper.openreview_url||"#";
  $("#authorList").innerHTML=(paper.authors||[]).map(a=>`<li><span class="author-name">${escapeHtml(a.name)}</span><span class="author-institution">${escapeHtml(a.institution||"机构未提供")}</span></li>`).join("");
  $("#sentencePairs").innerHTML=paper.sentences.map((s,i)=>`<div class="sentence-pair" data-pair="${i}"><button class="sentence en" lang="en" data-s="${i}">${escapeHtml(s.en)}</button><button class="sentence zh" lang="zh-CN" data-s="${i}">${escapeHtml(s.zh||"本句待翻译")}</button></div>`).join("");
  for(const el of [$("#titleEn"),$("#titleZh")])el.textContent=window.ICMLMath?.prepare(el.textContent)||el.textContent;
  mathRender(els.view);
  $("#reader").scrollTo({top:0,behavior:"instant"});document.title=`${paper.title_zh||paper.title_en} · ICML 2026`;
}
function activateSentence(index,origin){document.querySelectorAll(".sentence.active").forEach(n=>n.classList.remove("active"));const pair=document.querySelector(`[data-pair="${index}"]`);pair?.querySelectorAll(".sentence").forEach(n=>n.classList.add("active"));if(pair){const reader=$("#reader"),box=pair.getBoundingClientRect(),viewport=reader.getBoundingClientRect();reader.scrollTo({top:reader.scrollTop+box.top-viewport.top-48,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}
function filter(){state.query=norm(els.search.value.trim());state.filtered=!state.query?state.papers:state.papers.filter(p=>norm(`${p.en} ${p.zh} ${p.topic} ${p.author_search||''}`).includes(state.query));state.page=0;renderList()}
function escapeHtml(s){return (window.ICMLMath?.prepare(String(s??""))||String(s??"")).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
function toast(msg){els.status.textContent=msg;els.status.classList.add("show");setTimeout(()=>els.status.classList.remove("show"),1300)}
els.search.addEventListener("input",filter);els.clear.addEventListener("click",()=>{els.search.value="";filter();els.search.focus()});els.list.addEventListener("click",e=>{const card=e.target.closest("[data-id]");if(card)selectPaper(card.dataset.id)});$("#sentencePairs").addEventListener("click",e=>{const s=e.target.closest("[data-s]");if(s)activateSentence(s.dataset.s,s)});addEventListener("hashchange",()=>selectPaper(location.hash.slice(1)));boot();
els.list.addEventListener("keydown",e=>{if(!["ArrowUp","ArrowDown"].includes(e.key)||!state.filtered.length)return;const current=state.filtered.findIndex(p=>p.id===state.selected);const next=e.key==="ArrowDown"?Math.min(state.filtered.length-1,current+1):Math.max(0,current-1);if(next!==current){e.preventDefault();selectPaper(state.filtered[next].id)}});
for(const [id,delta] of [['prevPage',-1],['nextPage',1]])$('#'+id).addEventListener('click',()=>{state.page+=delta;renderList();els.list.scrollTop=0});
