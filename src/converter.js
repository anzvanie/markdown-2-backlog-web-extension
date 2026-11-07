/* Local-only Markdown -> Nulab Backlog notation converter. No dependencies. */
(function(root){'use strict';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function inline(input,warnings){
 let s=String(input), saved=[];const stash=v=>{let id='\uE000'+saved.length+'\uE001';saved.push(v);return id;};
 // Backslash-escaped Markdown punctuation should remain literal in output.
 s=s.replace(/\\([\\`*_{}\[\]()#+.!>~|%-])/g,(_,c)=>stash('\\'+c));
 s=s.replace(/`+([^`\n]+?)`+/g,(_,v)=>{warnings.push('Inline code has no verified Backlog-notation equivalent; preserved as plain text.');return stash(v);});
 s=s.replace(/!\[([^\]]*)\]\((<?[^\s)]+>?)(?:\s+"[^"]*")?\)/g,(_,alt,url)=>{warnings.push('External Markdown image URL cannot be embedded as a Backlog attachment; retained as a link.');return stash('[['+(alt||'Image')+'>'+url.replace(/^<|>$/g,'')+']]');});
 s=s.replace(/\[([^\]]+)\]\((<?[^\s)]+>?)(?:\s+"[^"]*")?\)/g,(_,label,url)=>stash('[['+label+'>'+url.replace(/^<|>$/g,'')+']]'));
 // Handle combined strong+em before individual emphasis.
 s=s.replace(/\*\*\*(.+?)\*\*\*|___(.+?)___/g,(_,a,b)=>stash("'''''"+inline(a||b,warnings)+"'''''"));
 s=s.replace(/\*\*(.+?)\*\*|__(.+?)__/g,(_,a,b)=>stash("''"+inline(a||b,warnings)+"''"));
 s=s.replace(/~~(.+?)~~/g,(_,v)=>stash('%%'+inline(v,warnings)+'%%'));
 s=s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)|(?<!\w)_([^_\n]+)_(?!\w)/g,(_,a,b)=>stash("'''"+inline(a||b,warnings)+"'''"));
 return s.replace(/\uE000(\d+)\uE001/g,(_,n)=>saved[+n]);
}
function splitCells(line){let t=line.trim().replace(/^\|/,'').replace(/\|$/,'');return t.split(/(?<!\\)\|/).map(x=>x.trim().replace(/\\\|/g,'|'));}
function convertDetailed(input){
 const warnings=[], lines=String(input??'').replace(/\r\n?/g,'\n').split('\n'), out=[];let fence=null, code=[], stack=[];
 function flushCode(){out.push('{code'+(fence?.lang && /^(java|cs)$/.test(fence.lang)?':'+fence.lang:'')+'}');out.push(...code);out.push('{/code}');code=[];fence=null;}
 function listLine(indent,kind,body){while(stack.length && indent<stack[stack.length-1].indent)stack.pop();if(!stack.length||indent>stack[stack.length-1].indent)stack.push({indent,kind});else stack[stack.length-1].kind=kind;return stack.map(x=>x.kind).join('')+' '+inline(body,warnings);}
 for(let i=0;i<lines.length;i++){
  const raw=lines[i],trim=raw.trim();
  if(fence){if(new RegExp('^\\s{0,3}'+(fence.char==='`'?'`':'~')+'{'+fence.size+',}\\s*$').test(raw)){flushCode();}else code.push(raw);continue;}
  let fm=raw.match(/^\s{0,3}(`{3,}|~{3,})\s*([\w+-]*)\s*$/);if(fm){stack=[];fence={char:fm[1][0],size:fm[1].length,lang:fm[2].toLowerCase()};if(fence.lang&&!['java','cs'].includes(fence.lang))warnings.push('Code language '+fence.lang+' is not supported by the documented Backlog code macro; generic code used.');continue;}
  if(!trim){out.push('');stack=[];continue;}
  let setext=i+1<lines.length&&lines[i+1].match(/^\s{0,3}(=+|-+)\s*$/);if(setext && !/^\s*[-+*]\s/.test(raw)){let level=setext[1][0]==='='?1:2;out.push('*'.repeat(level)+' '+inline(trim,warnings));i++;stack=[];continue;}
  let h=raw.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);if(h){let depth=h[1].length;if(depth>3)warnings.push('Heading H'+depth+' downgraded to H3: Backlog notation documents only H1–H3.');out.push('*'.repeat(Math.min(depth,3))+' '+inline(h[2],warnings));stack=[];continue;}
  if(/^\s{0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(raw)){warnings.push('Markdown horizontal rule has no verified Backlog-notation equivalent; replaced with a plain separator.');out.push('────────');stack=[];continue;}
  // Markdown table with alignment separator; Backlog table header is the trailing |h marker.
  if(i+1<lines.length && /^\s*\|?.+\|.+\|?\s*$/.test(raw) && /^\s*\|?\s*:?-{3,}:?\s*\|/.test(lines[i+1])){
    const hdr=splitCells(raw),sep=splitCells(lines[i+1]);if(hdr.length===sep.length && sep.every(c=>/^:?-{3,}:?$/.test(c))){
      out.push('|'+hdr.map(c=>inline(c,warnings)).join('|')+'|h');
      if(sep.some(c=>c.includes(':')))warnings.push('Markdown table column alignment is not preserved in Backlog notation.');
      i++;while(i+1<lines.length&&/^\s*\|/.test(lines[i+1])){i++;let cells=splitCells(lines[i]);out.push('|'+cells.map(c=>inline(c,warnings)).join('|')+'|');}stack=[];continue;
    }
  }
  let quote=raw.match(/^\s{0,3}>\s?(.*)$/);if(quote){out.push('> '+inline(quote[1],warnings));stack=[];continue;}
  let li=raw.match(/^([ \t]*)([-+*]|\d+[.)])\s+(.+)$/);if(li){let indent=li[1].replace(/\t/g,'    ').length,kind=/^\d/.test(li[2])?'+':'-';out.push(listLine(indent,kind,li[3]));continue;}
  // Preserve indented code blocks, including blank lines within block.
  if(/^( {4}|\t)/.test(raw)&&!stack.length){let block=[];while(i<lines.length&&(/^( {4}|\t)/.test(lines[i])||(!lines[i].trim()&&i+1<lines.length&&/^( {4}|\t)/.test(lines[i+1])))){block.push(lines[i].replace(/^( {4}|\t)/,''));i++;}i--;out.push('{code}',...block,'{/code}');continue;}
  if(/^\s*</.test(raw))warnings.push('Raw HTML is not converted; check the output manually.');
  out.push(inline(raw,warnings));stack=[];
 }
 if(fence){warnings.push('Unclosed Markdown code fence was closed automatically.');flushCode();}
 return {text:out.join('\n').replace(/^\n+|\n+$/g,''),warnings:[...new Set(warnings)]};
}
function preview(value){
 const lines=String(value).split('\n'),out=[],list=[],code=[];let table=[];let inCode=false;
 const fmt=s=>{let x=esc(s);x=x.replace(/\[\[([^\]]+?)&gt;(https?:\/\/[^\]\s]+)\]\]/g,(_,label,url)=>'<a href="'+url.replace(/&quot;/g,'')+'" target="_blank" rel="noopener noreferrer">'+label+'</a>');return x.replace(/'''''(.+?)'''''/g,'<strong><em>$1</em></strong>').replace(/'''(.+?)'''/g,'<em>$1</em>').replace(/''(.+?)''/g,'<strong>$1</strong>').replace(/%%(.+?)%%/g,'<del>$1</del>');};
 function closeLists(){while(list.length){out.push('</li></'+list.pop()+'>');}}
 function flushTable(){if(!table.length)return;out.push('<table>');table.forEach((row,idx)=>{let head=row.endsWith('|h'),cells=splitCells(head?row.slice(0,-1):row);out.push('<tr>'+cells.map(c=>'<'+(head?'th':'td')+'>'+fmt(c)+'</'+(head?'th':'td')+'>').join('')+'</tr>');});out.push('</table>');table=[];}
 for(let line of lines){if(/^\{code(?::\w+)?\}$/.test(line)){closeLists();flushTable();inCode=true;code=[];continue;}if(inCode){if(line==='{/code}'){out.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');inCode=false;}else code.push(line);continue;}
 if(/^\|.*\|(?:h)?$/.test(line)){closeLists();table.push(line);continue;}flushTable();
 let li=line.match(/^([-+]+)\s+(.+)$/);if(li){let types=[...li[1]].map(c=>c==='+'?'ol':'ul'),common=0;while(common<types.length&&common<list.length&&types[common]===list[common])common++;while(list.length>common)out.push('</li></'+list.pop()+'>');for(let j=common;j<types.length;j++){out.push('<'+types[j]+'><li>');list.push(types[j]);}if(common===types.length)out.push('</li><li>');let check=li[2].match(/^\[([ xX])\]\s*(.*)$/);out.push(check?'<input type="checkbox" disabled '+(check[1].toLowerCase()==='x'?'checked':'')+'>'+fmt(check[2]):fmt(li[2]));continue;}
 closeLists();let h=line.match(/^(\*{1,3})\s+(.+)$/);if(h){out.push('<h'+h[1].length+'>'+fmt(h[2])+'</h'+h[1].length+'>');continue;}
 if(line.startsWith('> ')){out.push('<blockquote>'+fmt(line.slice(2))+'</blockquote>');continue;}
 if(line.trim())out.push('<p>'+fmt(line)+'</p>');
 }
 closeLists();flushTable();if(inCode)out.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');return out.join('\n');
}
root.BacklogConverter={convert:s=>convertDetailed(s).text,convertDetailed,preview};
})(typeof globalThis!=='undefined'?globalThis:this);
