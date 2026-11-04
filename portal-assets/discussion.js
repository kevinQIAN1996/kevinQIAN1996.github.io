/* Shared public discussions for the teaching portal and course wrappers. */
(()=>{
'use strict';
const API='https://biocourse-feedback-intake.bioqwj.chatgpt.site';
const assetRoot=new URL('.',document.currentScript.src);
const node=(tag,value='',className='')=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el};
const request=async(path,options={})=>{
 const response=await fetch(API+path,{credentials:'omit',...options,signal:AbortSignal.timeout(20000)});
 const result=await response.json();
 if(!response.ok)throw Error(result.error||'暂时无法连接讨论服务，请稍后重试。');
 return result;
};
let catalogPromise;
function catalog(){
 return catalogPromise||=fetch(new URL('discussion-catalog.json',assetRoot)).then(r=>{if(!r.ok)throw Error('章节目录暂未加载，请刷新后重试。');return r.json()});
}
class DiscussionBoard{
 constructor(host){this.host=host;this.inline=host.dataset.mode!=='forum';this.course=host.dataset.course||document.body.dataset.course||'site';this.version=host.dataset.version||document.body.dataset.version||'';this.cursor=null;this.generation=0;this.reply=null;this.roots=[];this.id='';this.signature='';this.mount();}
 async mount(){
  this.host.classList.add('discussion-board');
  this.host.innerHTML='<div class="discussion-head"><div><span class="discussion-eyebrow">CLASSROOM COMMONS / 课堂交流</span><h2>让每一个发现，都能回到课堂。</h2><p>免登录发表，大家都能看到。可指出知识疑问、显示问题，或分享实际用法。</p></div><a class="discussion-all" href="/forum/">全部章节讨论 ↗</a></div><div class="discussion-body"><div class="discussion-feed"><div class="discussion-filters"><label>对应章节<select class="filter-course" aria-label="筛选讨论章节"></select></label><label>讨论类型<select class="filter-type"><option value="">全部类型</option><option>使用建议</option><option>科学内容纠错</option><option>功能或显示问题</option><option>课堂使用心得</option></select></label><button class="refresh" type="button">刷新讨论</button></div><p class="feed-status" role="status"></p><div class="thread-list"></div><button class="load-more" type="button" hidden>继续加载较早讨论</button><p class="discussion-old"><a href="https://github.com/kevinQIAN1996/BioCourse-feedback/issues" target="_blank" rel="noopener">GitHub 归档与处理记录 ↗</a></p></div><form class="discussion-compose"><span class="discussion-eyebrow">PUBLIC NOTE / 公开留言</span><h3>留下一个具体的发现</h3><p class="reply-target" hidden></p><button class="cancel-reply" type="button" hidden>取消回复，另发讨论</button><label>对应章节<select name="course" required></select></label><label>课件版本<select name="version"><option value="">章节整体 / 未指定</option></select></label><label>讨论类型<select name="type"><option>使用建议</option><option>科学内容纠错</option><option>功能或显示问题</option><option>课堂使用心得</option></select></label><label>具体位置或环节（选填）<input name="detail" maxlength="100" placeholder="如：第二模块，质壁分离复原"></label><label>怎么称呼你（选填）<input name="nickname" maxlength="24" autocomplete="nickname" placeholder="匿名访客"></label><div class="discussion-trap" aria-hidden="true"><label>请留空<input name="website" tabindex="-1" autocomplete="off"></label></div><label>讨论内容<textarea name="content" required minlength="5" maxlength="2000" rows="5" placeholder="说明对应画面、你的判断依据，或希望怎样改进。"></textarea></label><p class="discussion-privacy">留言与昵称会公开，请勿填写学生姓名、电话等个人信息。昵称由访客自行填写。</p><p class="compose-status" role="status" aria-live="polite"></p><button class="submit-discussion" type="submit">免登录发表</button></form></div>';
  const find=s=>this.host.querySelector(s);
  this.find=find;this.form=find('form');this.courseSelect=this.form.elements.course;
  try{this.courses=await catalog();}catch(error){find('.feed-status').textContent=error.message;find('.submit-discussion').disabled=true;return;}
  const options=(select,all)=>{
   if(all){const option=node('option','全部章节');option.value='';select.append(option)}
   for(const entry of this.courses){const opt=node('option',(entry.chapter?entry.chapter+' · ':'')+entry.title);opt.value=entry.id;select.append(opt)}
  };
  options(find('.filter-course'),!this.inline);options(this.courseSelect,false);
  const params=new URLSearchParams(location.search);
  if(!this.inline)this.course=params.get('course')||'';
  if(this.inline&&!this.courses.some(c=>c.id===this.course))this.course='site';
  find('.filter-course').value=this.course;
  this.courseSelect.value=this.course||'site';
  if(this.inline){find('.filter-course').disabled=true;this.courseSelect.disabled=true;find('.discussion-head h2').textContent='关于这份课件，听听你的发现。';}
  this.updateVersions();
  this.courseSelect.addEventListener('change',()=>this.updateVersions());
  find('.filter-course').onchange=()=>{this.cancelReply();this.course=find('.filter-course').value;this.courseSelect.value=this.course||'site';this.updateVersions();this.load(true)};
  find('.filter-type').onchange=()=>this.load(true);
  find('.refresh').onclick=()=>this.load(true);
  find('.load-more').onclick=()=>this.load(false);
  find('.cancel-reply').onclick=()=>this.cancelReply();
  this.form.addEventListener('submit',e=>this.submit(e));
  await this.load(true);
  const thread=params.get('thread');
  if(thread){try{const data=await request('/api/forum?thread='+encodeURIComponent(thread));if(data.parent){this.find('.thread-list').replaceChildren();this.renderThread(data.parent,this.find('.thread-list'));const card=this.find('.discussion-thread');await this.expandReplies(data.parent,card);}}catch(error){find('.feed-status').textContent=error.message}}
 }
 updateVersions(){
  const select=this.form.elements.version;
  select.replaceChildren();const first=node('option','章节整体 / 未指定');first.value='';select.append(first);
  const entry=this.courses.find(c=>c.id===this.courseSelect.value);
  for(const version of entry?.versions||[]){const option=node('option',version);option.value=version;select.append(option)}
  if(this.version){if(![...select.options].some(v=>v.value===this.version)){const option=node('option',this.version);option.value=this.version;select.append(option)}select.value=this.version}
 }
 cancelReply(){
  this.reply=null;this.find('.reply-target').hidden=true;this.find('.cancel-reply').hidden=true;
  this.courseSelect.disabled=this.inline;this.form.elements.version.disabled=false;
  this.find('.submit-discussion').textContent='免登录发表';
 }
 beginReply(item){
  this.reply=item;this.courseSelect.value=item.course;this.updateVersions();
  this.form.elements.version.value=item.version||'';
  this.courseSelect.disabled=true;this.form.elements.version.disabled=true;
  const target=this.find('.reply-target');target.textContent='正在回复 '+item.nickname+' 的讨论';target.hidden=false;
  this.find('.cancel-reply').hidden=false;this.find('.submit-discussion').textContent='免登录发表回复';this.form.elements.content.focus();
 }
 renderThread(item,container){
  const card=node('article','','discussion-thread');card.id='discussion-'+item.id;
  const meta=node('div','','discussion-meta');meta.append(node('strong',item.nickname||'匿名访客'),node('time',new Date(item.createdAt).toLocaleString('zh-CN')));
  const context=node('p',[item.chapter,item.courseName,item.version,item.type].filter(Boolean).join(' / '),'discussion-context');
  card.append(meta,context);
  if(item.detail)card.append(node('p','具体位置　'+item.detail,'discussion-detail'));
  card.append(node('p',item.content,'discussion-content'));
  const actions=node('div','','discussion-actions'),reply=node('button','回复讨论'),expand=node('button','展开回复');
  reply.type=expand.type='button';reply.onclick=()=>this.beginReply(item);expand.onclick=()=>this.expandReplies(item,card);
  const permalink=node('a','独立链接');permalink.href='/forum/?thread='+encodeURIComponent(item.id)+'&course='+encodeURIComponent(item.course);
  actions.append(reply,expand,permalink);
  if(item.issueUrl&&/^https:\/\/github\.com\/kevinQIAN1996\/BioCourse-feedback\/issues\/\d+$/i.test(item.issueUrl)){const link=node('a','处理记录 ↗');link.href=item.issueUrl;link.target='_blank';link.rel='noopener';actions.append(link)}
  card.append(actions);container.append(card);return card;
 }
 async expandReplies(item,card){
  let replies=card.querySelector('.discussion-replies');
  if(!replies){replies=node('div','','discussion-replies');card.append(replies)}
  replies.replaceChildren(node('p','正在读取回复…'));
  try{
   let cursor='',count=0;
   const load=async()=>{
    const result=await request('/api/forum?thread='+encodeURIComponent(item.id)+(cursor?'&cursor='+encodeURIComponent(cursor):''));
    if(!cursor)replies.replaceChildren();
    for(const row of result.items){const reply=node('div','','discussion-reply');reply.append(node('strong',(row.nickname||'匿名访客')+' · '+new Date(row.createdAt).toLocaleString('zh-CN')),node('p',row.content));replies.append(reply);count++;}
    cursor=result.nextCursor||'';
    if(cursor){const more=node('button','加载较早回复');more.type='button';more.onclick=()=>{more.remove();load().catch(error=>replies.append(node('p',error.message)))};replies.append(more)}
    if(!count&&!cursor)replies.append(node('p','还没有回复，可以发表第一条。'));
   };await load();
  }catch(error){replies.replaceChildren(node('p',error.message))}
 }
 async load(reset){
  const status=this.find('.feed-status'),list=this.find('.thread-list'),gen=++this.generation;
  if(reset){this.cursor=null;this.roots=[];}
  status.textContent='正在读取公开讨论…';this.find('.load-more').disabled=true;
  try{
   const query=new URLSearchParams();
   if(this.course)query.set('course',this.course);
   if(this.find('.filter-type').value)query.set('type',this.find('.filter-type').value);
   if(this.cursor)query.set('cursor',this.cursor);
   const data=await request('/api/forum?'+query);
   if(gen!==this.generation)return;
   if(reset)list.replaceChildren();
   for(const item of data.items){if(!this.roots.some(x=>x.id===item.id)){this.roots.push(item);this.renderThread(item,list)}}
   this.cursor=data.nextCursor||null;
   status.textContent=this.roots.length?'已显示 '+this.roots.length+' 条讨论，回复可在各条下展开。':this.cursor?'本页暂无匹配内容，可继续加载较早讨论。':'这个章节还没有讨论，欢迎留下第一个发现。';
   this.find('.load-more').hidden=!this.cursor;
  }catch(error){if(gen===this.generation)status.textContent=error.message;}
  finally{if(gen===this.generation)this.find('.load-more').disabled=false}
 }
 async submit(event){
  event.preventDefault();const submit=this.find('.submit-discussion'),status=this.find('.compose-status');
  if(submit.disabled||!this.form.reportValidity())return;
  const entry=this.courses.find(c=>c.id===this.courseSelect.value);
  if(!entry){status.textContent='请先选择对应章节。';return}
  const data={course:entry.id,courseName:entry.title,chapter:entry.chapter||'',book:entry.book||'',version:this.form.elements.version.value,type:this.form.elements.type.value,nickname:this.form.elements.nickname.value.trim(),content:this.form.elements.content.value.trim(),detail:this.form.elements.detail.value.trim(),website:this.form.elements.website.value,parentId:this.reply?.id||'',source:location.origin+location.pathname};
  if(data.content.length<5){status.textContent='请至少填写 5 个字。';return}
  const signature=JSON.stringify(data);
  if(signature!==this.signature){this.id=crypto.randomUUID();this.signature=signature}
  submit.disabled=true;status.textContent='正在保存公开留言…';
  try{
   const result=await request('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id:this.id})});
   if(!result.ok||result.id!==this.id||!result.discussionId)throw Error('尚未确认保存结果，内容已保留，可重试。');
   this.form.elements.content.value='';status.textContent='已公开发表。回执 '+result.id;
   const parent=this.reply;this.id='';this.signature='';this.cancelReply();
   if(parent){const card=[...this.host.querySelectorAll('.discussion-thread')].find(c=>c.id==='discussion-'+parent.id);if(card)await this.expandReplies(parent,card)}
   else{if(!this.inline){this.course=entry.id;this.find('.filter-course').value=entry.id;this.find('.filter-type').value=''}await this.load(true)}
  }catch(error){status.textContent=error.message+' 内容已保留，可重试。'}
  finally{submit.disabled=false}
 }
}
document.querySelectorAll('[data-discussion]').forEach(host=>new DiscussionBoard(host));
})();
