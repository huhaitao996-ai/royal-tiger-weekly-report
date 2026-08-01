(function(){
const fmt=n=>n==null?'—':Number(n).toLocaleString('zh-CN',{maximumFractionDigits:2});
const cash=n=>n==null?'—':'¥'+fmt(n);
const pct=n=>n==null?'—':Number(n).toFixed(1)+'%';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const style=document.createElement('style');
style.textContent=`
main .card{cursor:pointer}main .card:hover:after{content:'点击查看数据组成';position:absolute;right:12px;top:10px;background:#632c16;color:#fff;border-radius:99px;padding:4px 9px;font:400 10px HuakangW7;box-shadow:0 5px 14px #632c1630}
.detail-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:#2b170fac;padding:22px;z-index:120}.detail-modal.open{display:flex}.detail-panel{width:min(960px,96vw);max-height:88vh;overflow:auto;border-radius:20px;background:#fbf7ee;box-shadow:0 30px 90px #0007}.detail-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;background:#ffcc00;padding:18px 22px}.detail-head h2{margin:0;font:400 22px HuakangW9}.detail-close{border:0;background:#fff;width:36px;height:36px;border-radius:50%;font-size:22px;cursor:pointer}.detail-body{padding:20px}.detail-formula{background:#fff3c9;border:1px solid #ffcc00;border-radius:12px;padding:13px 15px;margin-bottom:15px;line-height:1.7}.detail-table{overflow:auto;border:1px solid #ead8b5;border-radius:13px;background:#fff}.detail-table table{min-width:680px}.detail-table th{position:sticky;top:0}.detail-foot{color:#8a6b5a;font:400 12px HuakangW7;margin-top:12px}
@media(max-width:650px){.detail-modal{padding:8px}.detail-body{padding:12px}main .card:hover:after{display:none}}`;
document.head.appendChild(style);
const modal=document.createElement('div');modal.className='detail-modal';modal.setAttribute('aria-hidden','true');
modal.innerHTML='<div class="detail-panel" role="dialog" aria-modal="true"><div class="detail-head"><h2 id="detailTitle">数据组成</h2><button class="detail-close" aria-label="关闭">×</button></div><div class="detail-body"><div id="detailFormula" class="detail-formula"></div><div id="detailContent"></div><div class="detail-foot">当前展示会读取你在“编辑数据”中保存的最新草稿。</div></div></div>';
document.body.appendChild(modal);
function grid(headers,rows){return '<div class="detail-table"><table><thead><tr>'+headers.map(x=>'<th>'+safe(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+safe(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}
function cityRows(w){return w.cities.map(x=>[x.city,x.events,cash(x.sales),cash(x.fees),pct(x.feeRatio),x.personDays??'—',cash(x.humanEff),pct(x.humanHitRate)])}
function levelRows(w){return (w.levels||[]).map(x=>[x.level,x.events,cash(x.sales),cash(x.fees),pct(x.feeRatio),x.personDays??'—',cash(x.humanEff),pct(x.humanHitRate)])}
function weeklyRows(w){return (w.trend||w.weekly||[]).map(x=>[x.week,x.events,cash(x.sales),cash(x.fees),pct(x.feeRatio),x.personDays??'—',cash(x.humanEff),pct(x.humanHitRate)])}
function show(title,formula,content){document.querySelector('#detailTitle').textContent=title;document.querySelector('#detailFormula').innerHTML=formula;document.querySelector('#detailContent').innerHTML=content;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function explain(card,section,w){
 const label=card.querySelector('.klabel')?.textContent.trim()||card.querySelector('.chart-title')?.textContent.trim()||section.querySelector('.title')?.childNodes[1]?.textContent?.trim()||'数据组成';
 const cityTable=()=>grid(['城市','场次','销售额','费用','费比','人天','人效','达标率'],cityRows(w));
 const levelTable=()=>grid(['活动类型','场次','销售额','费用','费比','人天','人效','达标率'],levelRows(w));
 if(label.includes('销售额'))return show(label,'<b>组成：</b>当前周期各城市活动销售金额合计。',cityTable());
 if(label.includes('活动费用'))return show(label,'<b>组成：</b>促销员、试吃、物料、场地、运输及其他活动费用合计。',cityTable());
 if(label.includes('综合费比'))return show(label,'<b>计算：</b>活动费用 '+cash(w.metrics.fees)+' ÷ 活动销售额 '+cash(w.metrics.sales)+' = '+pct(w.metrics.feeRatio),grid(['销售额','费用','综合费比'],[[cash(w.metrics.sales),cash(w.metrics.fees),pct(w.metrics.feeRatio)]]));
 if(label==='活动场次')return show(label,'<b>组成：</b>当前周期不同城市的有效活动记录数量。',cityTable());
 if(label.includes('人效')||label.includes('达标率')||label.includes('临促人天')||label.includes('不同活动类型'))return show(label,'<b>计算：</b>人效 = 销售额 ÷ 临促人员天数；单场达到¥1,000/人天判定为达标。',levelTable());
 if(label.includes('巡店')||label.includes('经理综合')||label.includes('督导综合'))return show(label,'<b>状态：</b>巡店数据待接入。收到1—7月巡店台账后，将显示人员目标、覆盖门店和质量评分。','<div class="card note">当前仅展示活动数据。</div>');
 if(section.id==='trend')return show('经营趋势数据','<b>组成：</b>所选周期及相邻周次的销售额、费用、费比和活动人效。',grid(['周期','场次','销售额','费用','费比','人天','人效','达标率'],weeklyRows(w)));
 if(section.id==='quadrant')return show('城市四象限数据','<b>状态：</b>活动数据已更新，巡店数据待接入；接入后自动恢复四象限。',cityTable());
 if(section.id==='cities')return show('城市经营明细','<b>组成：</b>当前周期所有城市的活动、投入、人效与巡店数据。',cityTable());
 if(section.id==='archive'||label.includes('数据状态'))return show(label,'<b>来源：</b>皇家小虎浙江省区1—7月活动台账，共631条去重活动。',grid(['周期','日期范围','活动场次','巡店状态'],[[w.label,w.range,w.metrics.events,'待接入']]));
 return show(label,'<b>数据说明：</b>该窗口由当前所选周期的基础数据和计算指标组成。',cityTable());
}
document.querySelector('main').addEventListener('click',e=>{if(e.target.closest('button,input,select,a')||e.target.closest('.modal'))return;const card=e.target.closest('.card');if(!card)return;const section=card.closest('section');if(!section)return;const w=weeks[document.querySelector('#week').value];explain(card,section,w)});
function close(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
modal.querySelector('.detail-close').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
