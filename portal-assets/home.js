'use strict';
// Static content remains usable if the catalog request fails or scripting is off.
// Revalidate counts against the course registry without sending visitor data.
(()=>{
 const updateCounts=async()=>{
  try{
   const response=await fetch('/Biocourse/catalog.json?release=4.7',{credentials:'omit',signal:AbortSignal.timeout(7000)});
   if(!response.ok)return;
   const catalog=await response.json();
   if(!Array.isArray(catalog)||!catalog.length||catalog.some(t=>!t.id||!Array.isArray(t.versions)))return;
   const counts={topics:catalog.length,versions:catalog.reduce((sum,t)=>sum+t.versions.length,0),books:new Set(catalog.map(t=>t.curriculum?.book).filter(Boolean)).size};
   for(const [key,value] of Object.entries(counts))if(value>0)document.querySelectorAll('[data-content="'+key+'"]').forEach(el=>{el.textContent=String(value)});
   // Keep featured lesson covers and links on the same latest edition as BioCourse.
   for(const card of document.querySelectorAll('.lesson-card')){const topic=catalog.find(c=>card.classList.contains('lesson-'+c.id));if(!topic)continue;const v=topic.versions.find(v=>v.id===topic.latestVersionId)||topic.versions[0];if(!v?.route||!v.preview)continue;card.querySelectorAll('a[href^="/Biocourse/courses/"]').forEach(a=>a.href='/Biocourse/'+v.route);const image=card.querySelector('img');if(image){image.src='/Biocourse/'+v.preview.thumbnail;image.srcset='/Biocourse/'+v.preview.thumbnail+' 640w, /Biocourse/'+v.preview.image+' 1280w';image.alt=v.preview.alt}const label=card.querySelector('.cover-label');if(label)label.textContent='默认最新 · '+v.edition+' v'+v.label;}
  }catch{/* The built-in counts are the last verified public catalog snapshot. */}
 };
 if(document.readyState==='complete')updateCounts();else addEventListener('load',updateCounts,{once:true});
})();
