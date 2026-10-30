'use strict';
// Static content remains usable if the catalog request fails or scripting is off.
// Revalidate counts against the course registry without sending visitor data.
(()=>{
 const updateCounts=async()=>{
  try{
   const response=await fetch('/Biocourse/catalog.json',{credentials:'omit',signal:AbortSignal.timeout(7000)});
   if(!response.ok)return;
   const catalog=await response.json();
   if(!Array.isArray(catalog)||!catalog.length||catalog.some(t=>!t.id||!Array.isArray(t.versions)))return;
   const counts={topics:catalog.length,versions:catalog.reduce((sum,t)=>sum+t.versions.length,0),books:new Set(catalog.map(t=>t.curriculum?.book).filter(Boolean)).size};
   for(const [key,value] of Object.entries(counts))if(value>0)document.querySelectorAll('[data-content="'+key+'"]').forEach(el=>{el.textContent=String(value)});
  }catch{/* The built-in counts are the last verified public catalog snapshot. */}
 };
 if(document.readyState==='complete')updateCounts();else addEventListener('load',updateCounts,{once:true});
})();
