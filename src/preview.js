/* Copy only supported preview elements into the live document. */
(function(root){'use strict';
const tags=new Set(['p','h1','h2','h3','strong','em','del','a','ul','ol','li','input','blockquote','pre','code','table','tbody','tr','th','td']);
function render(target,html){
 const doc=target.ownerDocument;
 const parsed=new DOMParser().parseFromString(html,'text/html');
 function copy(node){
  if(node.nodeType===3)return doc.createTextNode(node.textContent);
  if(node.nodeType!==1||!tags.has(node.localName))return doc.createTextNode(node.textContent||'');
  const el=doc.createElement(node.localName);
  if(node.localName==='a'){
   const href=node.getAttribute('href')||'';
   if(/^https?:\/\//i.test(href)){el.setAttribute('href',href);el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer');}
  }
  if(node.localName==='input'){el.type='checkbox';el.disabled=true;el.checked=node.hasAttribute('checked');}
  for(const child of node.childNodes)el.append(copy(child));
  return el;
 }
 target.replaceChildren(...Array.from(parsed.body.childNodes,copy));
}
root.BacklogPreview={render};
})(globalThis);
