'use strict';
(() => {
 const header=document.querySelector('.site-header');
 const sizeHeader=()=>document.documentElement.style.setProperty('--nav-height',Math.ceil(header.getBoundingClientRect().height)+'px');
 sizeHeader();if(window.ResizeObserver)new ResizeObserver(sizeHeader).observe(header);else addEventListener('resize',sizeHeader);
 const copyStatus=document.getElementById('profileCopyStatus');
 document.querySelectorAll('[data-copy-profile]').forEach(button=>button.addEventListener('click',async()=>{
  const value=button.dataset.copyProfile;
  try{await navigator.clipboard.writeText(value);copyStatus.textContent=`已复制“${value}”。打开小红书，粘贴到搜索框即可。`}
  catch{const input=document.getElementById('xiaohongshuId');if(value===input.value){input.focus();input.select()}copyStatus.textContent=`未能自动复制，请手动复制“${value}”，再到小红书搜索。`}
 }));
 const profileDialog=document.getElementById('profileDialog'),profilePreview=document.getElementById('profilePreview');
 if(profileDialog&&typeof profileDialog.showModal==='function'){
  profilePreview.addEventListener('click',event=>{event.preventDefault();profileDialog.showModal()});
  profileDialog.addEventListener('click',event=>{if(event.target!==profileDialog)return;const r=profileDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)profileDialog.close()});
  profileDialog.addEventListener('close',()=>profilePreview.focus({preventScroll:true}));
 }
 const search=document.getElementById('noteSearch');
 if(search){
  const rows=[...document.querySelectorAll('.note-row')],buttons=[...document.querySelectorAll('[data-filter]')];let selected='all';
  const normalize=s=>s.trim().toLocaleLowerCase().replace(/\s+/g,' ');
  function filter(update=true){const terms=normalize(search.value).split(' ').filter(Boolean);let visible=0;
   rows.forEach(row=>{const match=(selected==='all'||row.dataset.category===selected)&&terms.every(term=>normalize(row.dataset.search).includes(term));row.hidden=!match;if(match)visible++});
   buttons.forEach(btn=>{const active=btn.dataset.filter===selected;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))});
   document.getElementById('resultCount').textContent=`显示 ${visible} / ${rows.length} 篇笔记`;
   document.getElementById('emptyResults').hidden=visible!==0;
   if(update){const u=new URL(location.href);if(selected==='all')u.searchParams.delete('topic');else u.searchParams.set('topic',selected);if(search.value.trim())u.searchParams.set('q',search.value.trim());else u.searchParams.delete('q');history.replaceState(null,'',u.pathname+u.search+u.hash)}
  }
  function restore(){const u=new URL(location.href);selected=['r','visual','omics'].includes(u.searchParams.get('topic'))?u.searchParams.get('topic'):'all';search.value=u.searchParams.get('q')||'';filter(false)}
  buttons.forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.filter;filter()}));search.addEventListener('input',()=>filter());
  const reset=()=>{selected='all';search.value='';filter();search.focus({preventScroll:true})};
  document.getElementById('clearSearch').addEventListener('click',reset);document.getElementById('resetEmpty').addEventListener('click',reset);addEventListener('popstate',restore);restore();
 }
 const body=document.getElementById('articleBody');
 if(body){
  const toc=document.getElementById('articleTOC');const headings=[...body.querySelectorAll('h1,h2,h3')];
  headings.forEach((h,i)=>{if(!h.id)h.id='section-'+(i+1);const a=document.createElement('a');a.href='#'+encodeURIComponent(h.id);a.textContent=h.textContent;if(h.tagName==='H3')a.className='sub';toc.append(a)});
  if(!headings.length)toc.textContent='本篇按正文顺序阅读。';
  body.querySelectorAll('pre').forEach(pre=>{const btn=document.createElement('button');btn.className='copy-code';btn.type='button';btn.textContent='复制代码';btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.textContent);btn.textContent='已复制'}catch{const range=document.createRange();range.selectNodeContents(pre);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);btn.textContent='已选中，请手动复制'}setTimeout(()=>btn.textContent='复制代码',2500)});pre.after(btn)});
  body.querySelectorAll('table').forEach(table=>{const wrap=document.createElement('div');wrap.className='table-scroll';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','表格，可横向滚动');table.before(wrap);wrap.append(table)});
  body.querySelectorAll('img').forEach(img=>{img.loading='lazy';const originalSrc=img.src;const fail=()=>{if(img.nextElementSibling?.classList.contains('image-unavailable'))return;img.hidden=true;const note=document.createElement('div');note.className='image-unavailable';note.textContent='这张历史配图暂时无法载入，正文已保留。';const a=document.createElement('a');a.href=originalSrc;a.textContent='尝试在原图地址查看 ↗';a.target='_blank';a.rel='noopener';note.append(a);img.after(note)};img.addEventListener('error',fail);if(img.complete&&!img.naturalWidth)fail()});
  const progress=document.getElementById('readingProgress');let queued=false;
  const measure=()=>{const rect=body.getBoundingClientRect();const top=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'))||0;const distance=Math.max(1,body.scrollHeight-innerHeight+top);const ratio=Math.max(0,Math.min(1,(top-rect.top)/distance));progress.style.width=(ratio*100)+'%';queued=false};
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(measure)}},{passive:true});addEventListener('resize',measure);measure();
 }
})();
