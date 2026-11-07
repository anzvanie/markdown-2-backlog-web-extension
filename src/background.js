const api=globalThis.browser||globalThis.chrome;
const MENU_ID='markdown-to-backlog-selection';
api.runtime.onInstalled.addListener(()=>api.contextMenus.create({id:MENU_ID,title:'Convert selection to Backlog notation',contexts:['selection']}));
api.contextMenus.onClicked.addListener(async info=>{
 if(info.menuItemId!==MENU_ID||!info.selectionText)return;
 const token=String(Date.now())+'-'+Math.random().toString(36).slice(2);
 await api.storage.local.set({pendingSelection:info.selectionText,pendingToken:token,pendingAt:Date.now()});
 // A standalone extension window is reliable for Firefox/Zen and Chrome alike.
 await api.windows.create({url:api.runtime.getURL('popup.html?selection='+encodeURIComponent(token)),type:'popup',width:600,height:760,focused:true});
});
