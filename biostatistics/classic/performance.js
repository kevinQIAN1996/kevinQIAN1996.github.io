'use strict';
(()=>{
 // Optional services start after the page is readable. They never gate the article UI.
 const cfg=window.BLOG_OPTIONAL||{},area=document.querySelector('#valine-comments');
 if(area){
  area.replaceChildren();const note=document.createElement('p');note.textContent='评论按需加载，历史留言仍使用原评论服务。';
  const load=document.createElement('button');load.type='button';load.textContent='加载历史评论 / 留言';
  const fallback=document.createElement('a');fallback.href='https://github.com/kevinQIAN1996/kevinQIAN1996.github.io/issues/new?title='+encodeURIComponent('博客反馈：'+document.title)+'&body='+encodeURIComponent('文章：'+location.href+'\n\n我的建议：\n');fallback.target='_blank';fallback.rel='noopener';fallback.textContent='通过 GitHub 反馈 ↗';
  const state=document.createElement('p');state.setAttribute('role','status');const host=document.createElement('div');host.id='valine-lazy-host';
  area.append(note,load,document.createTextNode('　'),fallback,state,host);
  load.addEventListener('click',async()=>{
   load.disabled=true;state.textContent='正在连接原评论服务…';host.replaceChildren();
   try{
    const base=(cfg.serverURLs||'https://avoscloud.com').replace(/\/$/,'');
    const r=await fetch(base+'/1.1/classes/Comment?limit=0&count=1',{headers:{'X-LC-Id':cfg.appId,'X-LC-Key':cfg.appKey},signal:AbortSignal.timeout(8000)});const d=await r.json();
    if(!r.ok){if(d.code===504)throw Error('旧评论应用已归档，需博主在 LeanCloud 控制台恢复。历史评论未被本次更新删除。');throw Error('旧评论服务暂不可用，请稍后重试或使用 GitHub 反馈。')}
    if(!window.Valine)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/biostatistics/vendor/valine/dist/Valine.min.js';s.onload=resolve;s.onerror=reject;document.head.append(s)});
    new Valine({...cfg,el:'#valine-lazy-host',path:cfg.path,comment_count:false});state.textContent='评论服务已连接。';load.hidden=true;
   }catch(e){state.textContent=e.name==='TimeoutError'?'评论连接超时，可稍后重试或使用 GitHub 反馈。':e.message;load.textContent='重试评论服务';load.disabled=false}
  });
 }
 const counts=document.querySelector('.busuanzi-count');if(counts){const note=document.createElement('span');note.textContent='访问统计加载中…';note.setAttribute('role','status');counts.append(note);
  const begin=()=>{const s=document.createElement('script');s.src='https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';s.async=true;document.head.append(s);let ticks=0;const check=setInterval(()=>{const value=document.querySelector('#busuanzi_value_site_pv')?.textContent.trim();if(value){note.remove();clearInterval(check)}else if(++ticks>=16){note.textContent='访问统计暂不可用';clearInterval(check)}},500)};
  // Start after load, but a slow unrelated image must not postpone statistics forever.
  let done=false;const later=()=>{if(done)return;done=true;setTimeout(begin,1000)};window.addEventListener('load',later,{once:true});setTimeout(later,3000);
 }
})();
