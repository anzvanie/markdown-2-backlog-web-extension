const api=globalThis.browser||globalThis.chrome;
const source=document.getElementById('source'),output=document.getElementById('output'),preview=document.getElementById('preview'),status=document.getElementById('status'),warnings=document.getElementById('warnings');
let timer;
function notify(msg){status.textContent=msg;}
function render(){let data=BacklogConverter.convertDetailed(source.value);output.value=data.text;BacklogPreview.render(preview,BacklogConverter.preview(data.text));warnings.replaceChildren();for(let warning of data.warnings){let li=document.createElement('li');li.textContent=warning;warnings.append(li);}clearTimeout(timer);timer=setTimeout(()=>api.storage.local.set({draft:source.value}),300);}
async function useSelection(){try{const [tab]=await api.tabs.query({active:true,currentWindow:true});if(!tab?.id)throw Error();const result=await api.scripting.executeScript({target:{tabId:tab.id},func:()=>{let el=document.activeElement;return window.getSelection()?.toString()||(el&&typeof el.selectionStart==='number'?el.value.slice(el.selectionStart,el.selectionEnd):'');}});let selection=result?.[0]?.result;if(!selection)throw Error();source.value=selection;render();notify('Selection loaded.');}catch{notify('No selection found, or this page does not allow scripting. Use right-click instead.');}}
document.getElementById('getSelection').addEventListener('click',useSelection);
document.getElementById('clear').addEventListener('click',()=>{source.value='';render();source.focus();});
document.getElementById('convert').addEventListener('click',()=>{render();notify('Converted.');});
document.getElementById('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(output.value);notify('Copied.');}catch{output.focus();output.select();notify('Clipboard unavailable. Press Ctrl+C.');}});
source.addEventListener('input',render);
(async()=>{try{const state=await api.storage.local.get(['draft','pendingSelection','pendingToken','pendingAt']);const token=new URLSearchParams(location.search).get('selection');if(token&&token===state.pendingToken&&Date.now()-state.pendingAt<120000){source.value=state.pendingSelection;await api.storage.local.remove(['pendingSelection','pendingToken','pendingAt']);}else source.value=state.draft||'';render();}catch(e){notify('Could not load saved draft.');render();}})();
