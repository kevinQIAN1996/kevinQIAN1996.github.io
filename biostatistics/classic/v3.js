(()=>{
 'use strict';
 const cards=[...document.querySelectorAll('.v3-card')],holder=document.querySelector('#v3-cards');let category='';
 function filter(){
  const q=(document.querySelector('#v3-search')?.value||'').trim().toLowerCase();let count=0;
  cards.forEach(c=>{c.hidden=!!((category&&c.dataset.category!==category)||!c.dataset.search.includes(q));if(!c.hidden)count++});
  const empty=document.querySelector('#v3-empty'),status=document.querySelector('#v3-result-count'),selection=document.querySelector('#v3-selections');
  if(empty)empty.hidden=count>0;if(status)status.textContent=(category||q?'找到 ':'共 ')+count+' 篇笔记';if(selection)selection.hidden=!!(category||q);
 }
 document.querySelectorAll('.v3-filters button').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('.v3-filters button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});filter()}));
 document.querySelector('#v3-search')?.addEventListener('input',filter);
 document.querySelector('#v3-sort')?.addEventListener('change',e=>{cards.sort((a,b)=>e.target.value==='order'?Number(a.dataset.order)-Number(b.dataset.order):b.dataset.updated.localeCompare(a.dataset.updated));cards.forEach(c=>holder.append(c))});
 document.querySelectorAll('.post-body pre').forEach(pre=>{
  pre.tabIndex=0;pre.setAttribute('aria-label','代码，可横向滚动');const code=pre.querySelector('code'),text=code?.textContent||pre.textContent,b=document.createElement('button');b.type='button';b.className='v3-copy';b.textContent='复制';b.setAttribute('aria-label','复制这段代码');
  b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);b.textContent='已复制'}catch{b.textContent='请选中复制'}setTimeout(()=>b.textContent='复制',1800)});pre.prepend(b);
 });
 document.querySelectorAll('.post-body table').forEach(t=>{t.tabIndex=0;t.setAttribute('aria-label',t.querySelector('caption')?.textContent||'数据表，可横向滚动')});
 const reading=document.createElement('button');reading.type='button';reading.className='v3-readmode';
 function mode(enabled){document.body.classList.toggle('v3-reading',enabled);reading.textContent=enabled?'恢复背景':'阅读模式';reading.setAttribute('aria-pressed',String(enabled))}
 try{mode(localStorage.getItem('blog-reading-mode')==='true')}catch{mode(false)}
 reading.addEventListener('click',()=>{const value=!document.body.classList.contains('v3-reading');mode(value);try{localStorage.setItem('blog-reading-mode',String(value))}catch{}});document.body.append(reading);
})();
