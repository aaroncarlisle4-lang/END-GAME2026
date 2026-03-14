/**
 * Radiopaedia Image Stack Grabber — Bookmarklet v3
 *
 * Now captures attribution (Case courtesy of...) from the viewer JSON.
 *
 * SETUP: Create a new bookmark with this as the URL (below).
 *
 * PASTE FORMAT (clipboard):
 *   CT Abdomen Pelvis
 *   ATTR:Case courtesy of Vikas Shah, Radiopaedia.org, rID: 100304
 *   https://prod-images-static.radiopaedia.org/images/58738608/38_big_gallery.jpeg
 *   ...
 *
 * javascript:void((async()=>{try{const CDN='https://prod-images-static.radiopaedia.org/images';let ids=new Set();document.querySelectorAll('script').forEach(s=>{const m=s.textContent.matchAll(/studies\/(\d+)\/annotated_viewer_json/g);for(const x of m)ids.add(x[1])});const h=document.documentElement.innerHTML;for(const x of h.matchAll(/studies\/(\d+)\/annotated_viewer_json/g))ids.add(x[1]);for(const x of h.matchAll(/\/cases\/\d+\/studies\/(\d+)/g))ids.add(x[1]);if(!ids.size){alert('No studies found. Make sure you are on a Radiopaedia case page.');return}let allUrls=[];let label='';let attr='';for(const id of ids){const r=await fetch('/studies/'+id+'/annotated_viewer_json?lang=us');if(!r.ok)continue;const j=await r.json();const s=j.study;label=label||s?.caption||'Study';if(!attr&&s?.contributor_login){const caseId=s?.case_id||'';attr='Case courtesy of '+s.contributor_login+', Radiopaedia.org'+(caseId?', rID: '+caseId:'')}for(const sr of s?.series||[]){const enc=sr.encodings?.thumbnailed_files;if(!enc||!Array.isArray(enc))continue;const frames=sr.frames||[];for(let i=0;i<frames.length;i++){const f=frames[i];const e=enc[i]||enc[0];const fn=e?.big_gallery||e?.gallery||e?.original||e?.medium;if(fn&&f.id)allUrls.push(CDN+'/'+f.id+'/'+fn)}}}if(!allUrls.length){const imgs=[...document.querySelectorAll('img')].filter(i=>i.src.includes('prod-images-static.radiopaedia.org/images/')).map(i=>i.src);if(imgs.length){allUrls=imgs;label=document.title.replace(' | Radiopaedia.org','')}}if(!allUrls.length){alert('No images found');return}const lines=[label];if(attr)lines.push('ATTR:'+attr);lines.push(...allUrls);await navigator.clipboard.writeText(lines.join('\n'));alert('Copied '+allUrls.length+' images for "'+label+'"'+(attr?'\n'+attr:'')+'!\n\nPaste into RadQuiz stack import.')}catch(e){alert('Error: '+e.message)}})())
 */
