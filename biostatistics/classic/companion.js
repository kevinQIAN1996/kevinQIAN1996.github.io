'use strict';
(()=>{
 const ui=document.createElement('aside');ui.className='classic-companion-ui';ui.setAttribute('aria-label','博客看板娘');
 const bubble=document.createElement('div');bubble.className='classic-companion-bubble';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');
 const talk=document.createElement('button');talk.type='button';talk.textContent='聊两句';
 const hide=document.createElement('button');hide.type='button';hide.textContent='收起';hide.setAttribute('aria-label','收起看板娘');
 const credit=document.createElement('a');credit.className='classic-companion-credits';credit.href='/biostatistics/classic/CREDITS.txt';credit.textContent='Shizuku · Live2D';credit.title='看板娘资源与署名';
 ui.append(bubble,talk,hide,credit);document.body.append(ui);
 const toggle=document.createElement('button');toggle.type='button';toggle.className='classic-companion-toggle';toggle.textContent='看板娘 ♡';toggle.setAttribute('aria-label','展开博客看板娘');document.body.append(toggle);
 const key='hexo-classic-companion-hidden';let initialized=false,loading=false,hidden=matchMedia('(max-width:640px)').matches;
 try{const saved=localStorage.getItem(key);if(saved!==null)hidden=saved==='1'}catch{}
 function apply(){document.body.classList.toggle('classic-companion-hidden',hidden);ui.hidden=hidden;toggle.hidden=!hidden;toggle.setAttribute('aria-expanded',String(!hidden))}
 function speak(text){bubble.textContent=text;bubble.classList.add('show');clearTimeout(speak.timer);speak.timer=setTimeout(()=>bubble.classList.remove('show'),5500)}
 async function init(){if(initialized||loading||hidden)return;loading=true;
 try{if(!window.L2Dwidget)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/biostatistics/vendor/live2d-widget/lib/L2Dwidget.min.js';s.onload=resolve;s.onerror=reject;document.head.append(s)});if(hidden)return;initialized=true;const mobile=matchMedia('(max-width:640px)').matches;
  window.L2Dwidget.init({model:{jsonPath:'/biostatistics/vendor/shizuku/assets/shizuku.model.json',scale:1},display:{position:'right',width:mobile?150:170,height:mobile?285:323,hOffset:8,vOffset:44,superSample:2},mobile:{show:true,scale:1,motion:true},react:{opacity:1},dialog:{enable:false,hitokoto:false}});
 }catch{speak('看板娘暂时没能载入，可以稍后重试。')}finally{loading=false}
 }
 const lines=['欢迎回来～旧博客还在这里。','今天想翻翻 R 语言，还是看看以前的学习笔记？','慢慢读，不用赶路。','有时候，打开旧博客也是一种重逢。'];let line=0;
 talk.addEventListener('click',()=>speak(lines[(line++)%lines.length]));hide.addEventListener('click',()=>{hidden=true;apply();try{localStorage.setItem(key,'1')}catch{}});
 toggle.addEventListener('click',()=>{hidden=false;apply();init();speak('我回来啦，陪你一起翻翻旧笔记。');try{localStorage.setItem(key,'0')}catch{}});
 apply();if(!hidden){
  const afterReading=()=>setTimeout(()=>{if('requestIdleCallback'in window)requestIdleCallback(()=>init(),{timeout:2000});else init()},600);
  const ready=()=>{const post=document.querySelector('.post-body');if(!post||getComputedStyle(post).visibility==='visible')afterReading();else if('IntersectionObserver'in window){const tick=setInterval(()=>{if(getComputedStyle(post).visibility==='visible'){clearInterval(tick);afterReading()}},100);setTimeout(()=>clearInterval(tick),20000)}else afterReading()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
 }
})();
