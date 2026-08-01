(function(){
const STORAGE='royalTigerDashboardDraftV2';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let refs=new Map(),seq=0;
function n(v){v=Number(v);return Number.isFinite(v)?v:0}
function derive(o){if('sales'in o&&'fees'in o)o.feeRatio=o.sales?+(o.fees/o.sales*100).toFixed(2):0;if('sales'in o&&'personDays'in o)o.humanEff=o.personDays?+(o.sales/o.personDays).toFixed(2):null}
function field(obj,key,label,step='0.01'){const id='e'+(++seq);refs.set(id,{obj,key});return '<label><span>'+label+'</span><input data-ref="'+id+'" type="number" step="'+step+'" value="'+(obj[key]??'')+'"></label>'}
function save(){localStorage.setItem(STORAGE,JSON.stringify({periods:weeks}))}
function load(){try{const d=JSON.parse(localStorage.getItem(STORAGE));if(!d?.periods)return;Object.keys(d.periods).forEach(k=>{if(weeks[k])Object.assign(weeks[k],d.periods[k])})}catch(e){console.warn('draft ignored',e)}}
function table(title,items,cols){if(!items?.length)return'';return '<div class="edit-block"><h3>'+title+'</h3><div class="edit-table"><table><thead><tr><th>名称</th>'+cols.map(x=>'<th>'+x[1]+'</th>').join('')+'</tr></thead><tbody>'+items.map((o,i)=>'<tr><td><b>'+esc(o.level||o.city||o.name||o.week||('记录'+(i+1)))+'</b></td>'+cols.map(([k,l,step])=>'<td>'+field(o,k,'',step||'0.01')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></div>'}
function openEditor(){
 refs=new Map();seq=0;const key=$('#week').value,w=weeks[key],m=w.metrics;
 let html='<div class="edit-intro"><b>'+esc(w.label)+'数据编辑</b><span>修改基础数据后，费比、人效、图表和进度条会立即更新。草稿仅保存在当前浏览器。</span></div>';
 html+='<div class="edit-block"><h3>核心数据</h3><div class="edit-grid">'+field(m,'sales','销售额')+field(m,'fees','活动费用')+field(m,'events','活动场次','1')+field(m,'personDays','促销人员天数','1')+field(m,'humanHitRate','人效达标率')+'</div></div>';
 html+=table('活动类型',w.levels,[['events','场次','1'],['sales','销售额'],['fees','费用'],['personDays','人天','1'],['humanHitRate','达标率']]);
 html+=table('城市经营',w.cities,[['events','场次','1'],['sales','销售额'],['fees','费用'],['personDays','人天','1'],['humanHitRate','达标率']]);
 html+=table('经营趋势',w.trend||w.weekly,[['events','场次','1'],['sales','销售额'],['fees','费用'],['personDays','人天','1'],['humanHitRate','达标率']]);
 html+='<div class="edit-block"><p class="fine">巡店数据待接入，收到巡店台账后将开放巡店指标编辑。</p></div>';
 $('#editorBody').innerHTML=html;$('#editorModal').classList.add('open');$('#editorModal').setAttribute('aria-hidden','false');
}
function closeEditor(){$('#editorModal').classList.remove('open');$('#editorModal').setAttribute('aria-hidden','true')}
document.addEventListener('input',e=>{const id=e.target.dataset.ref;if(!id)return;const r=refs.get(id);r.obj[r.key]=n(e.target.value);derive(r.obj);if('visits'in r.obj&&'target'in r.obj)r.obj.achievement=r.obj.target?+(r.obj.visits/r.obj.target*100).toFixed(1):0;save();render()});
$('#editBtn').addEventListener('click',openEditor);$('#editorClose').addEventListener('click',closeEditor);$('#editorDone').addEventListener('click',closeEditor);
document.querySelectorAll('main section').forEach(sec=>{const title=sec.querySelector('.title');if(!title)return;const btn=document.createElement('button');btn.type='button';btn.textContent='编辑';btn.title='编辑本期数据并自动更新该窗口';btn.style.cssText='margin-left:auto;border:1px solid var(--line);border-radius:99px;padding:5px 12px;background:#fff;color:var(--b);font:900 12px Huakang;cursor:pointer';btn.addEventListener('click',openEditor);title.appendChild(btn)});
$('#editorModal').addEventListener('click',e=>{if(e.target.id==='editorModal')closeEditor()});
$('#resetBtn').addEventListener('click',()=>{if(confirm('确定恢复网站原始数据吗？当前设备上的编辑草稿会被清除。')){localStorage.removeItem(STORAGE);location.reload()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeEditor()});
load();render();
})();
