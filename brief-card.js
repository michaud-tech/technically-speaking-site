/* Shared brief renderer. Cards live in brief-cards.js, keyed by scenario id.
   Display only: the scorer still reads the full written brief on the server. */
(function(root){
  if(typeof document!=='undefined'&&!document.getElementById('tsb-css')){var st=document.createElement('style');st.id='tsb-css';st.textContent="/* Shared brief layout: goal first, the person second, the situation as quiet reference. */\n.tsb-kicker{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#66635c;margin:0}\n.tsb-goal{border-left:6px solid #f4c400;padding:2px 0 2px 22px;margin:10px 0 36px;max-width:900px}\n.tsb-goal h2{font-size:clamp(25px,3.2vw,36px);line-height:1.13;font-weight:900;letter-spacing:-.035em;margin:0;color:#1d1d1b}\n.tsb-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:44px;align-items:start}\n.tsb-side{position:sticky;top:20px}\n.tsb-person{background:#1d1d1b;color:#f4f2ed;padding:26px 26px 22px}\n.tsb-person .tsb-kicker{color:#f4c400}\n.tsb-person h3{font-size:26px;font-weight:900;letter-spacing:-.03em;line-height:1.1;margin:6px 0 2px;color:#f4f2ed}\n.tsb-person .tsb-role{font-size:14px;color:#b9b3a8;margin:0 0 18px;line-height:1.4}\n.tsb-person dl,.tsb-facts dl{display:grid;gap:10px 14px;margin:0}\n.tsb-person dl{grid-template-columns:128px 1fr;font-size:15px;line-height:1.45}\n.tsb-person dt{color:#b9b3a8;font-size:13px;padding-top:2px;font-weight:400}\n.tsb-person dd{margin:0;color:#f4f2ed}\n.tsb-person dd.tsb-hot{font-weight:700}\n.tsb-facts{margin-top:24px;border-top:1px solid #d9d4ca;padding-top:16px;font-size:14px;line-height:1.5;color:#3c3a36}\n.tsb-facts .tsb-kicker{margin-bottom:8px}\n.tsb-facts .tsb-sum{font-weight:700;color:#1d1d1b;margin:0 0 8px}\n.tsb-facts ul{list-style:none;padding:0;margin:0 0 14px}\n.tsb-facts li{padding-left:14px;position:relative;margin:2px 0}\n.tsb-facts li:before{content:\"\";position:absolute;left:0;top:.62em;width:5px;height:5px;background:#8a857b}\n.tsb-facts dl{grid-template-columns:118px 1fr;gap:6px 12px}\n.tsb-facts dt{font-weight:700;color:#1d1d1b}\n.tsb-facts dd{margin:0}\n.tsb-facts .tsb-note{font-size:12px;color:#8a857b;margin:14px 0 0}\n.tsb-setting{font-size:22px;font-weight:800;letter-spacing:-.02em;line-height:1.25;margin:6px 0 6px;color:#1d1d1b}\n.tsb-hint{color:#66635c;font-size:14px;margin:0}\n.tsb-pitch textarea.pitch{min-height:340px}\n/* Stacked version for course pages */\n.tsb-stack .tsb-goal{margin-bottom:22px}\n.tsb-stack .tsb-goal h2{font-size:clamp(22px,2.6vw,28px)}\n.tsb-stack{margin:18px 0 28px}\n@media(max-width:860px){\n  .tsb-grid{grid-template-columns:1fr;gap:30px}.tsb-side{position:static}\n  .tsb-goal{margin-bottom:24px;padding-left:16px}\n  .tsb-person{padding:22px 18px}\n  .tsb-person dl,.tsb-facts dl{grid-template-columns:1fr;gap:0}\n  .tsb-person dt,.tsb-facts dt{margin-top:10px}\n  .tsb-setting{font-size:20px}\n}\n@media print{.tsb-person{background:none;color:#000;border:1px solid #999}.tsb-person *{color:#000!important}.tsb-side{position:static}}\n/* Assessment pages widen while the brief is open */\nbody.tsb-wide main .wrap{max-width:1120px}\n";document.head.appendChild(st);}
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  function goal(card){return '<p class="tsb-kicker">Your goal</p><div class="tsb-goal"><h2>'+esc(card.goal)+'</h2></div>';}
  function person(p){
    var h='<section class="tsb-person"><p class="tsb-kicker">'+esc(p.kicker||"Who you're talking to")+'</p><h3>'+esc(p.name)+'</h3>';
    if(p.role)h+='<p class="tsb-role">'+esc(p.role)+'</p>';
    h+='<dl>'+(p.rows||[]).map(function(r){return '<dt>'+esc(r[0])+'</dt><dd'+(r[2]?' class="tsb-hot"':'')+'>'+esc(r[1])+'</dd>';}).join('')+'</dl></section>';
    return h;
  }
  function facts(f){
    var h='<section class="tsb-facts"><p class="tsb-kicker">'+esc(f.title||'The situation')+'</p>';
    if(f.summary)h+='<p class="tsb-sum">'+esc(f.summary)+'</p>';
    if(f.bullets&&f.bullets.length)h+='<ul>'+f.bullets.map(function(b){return '<li>'+esc(b)+'</li>';}).join('')+'</ul>';
    if(f.rows&&f.rows.length)h+='<dl>'+f.rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd>';}).join('')+'</dl>';
    if(f.note)h+='<p class="tsb-note">'+esc(f.note)+'</p>';
    return h+'</section>';
  }
  function side(card){return person(card.person)+facts(card.facts);}
  function fallback(paras,ask){
    return {goal:ask||'',setting:'',person:null,facts:null,paras:paras||[]};
  }
  var TSBrief={
    card:function(id){return (root.TS_BRIEF_CARDS||{})[id]||null;},
    /* Assessment pages: fills #tsbGoal, #brief (left column) and #tsbSetting. */
    fill:function(id,paras,ask){
      var c=TSBrief.card(id), g=document.getElementById('tsbGoal'), b=document.getElementById('brief'), s=document.getElementById('tsbSetting');
      if(c){g.innerHTML=goal(c);b.innerHTML=side(c);if(s)s.textContent=c.setting||'What would you say?';}
      else{g.innerHTML=goal({goal:ask||''});b.innerHTML='<section class="tsb-facts" style="border:0;padding:0;margin:0"><p class="tsb-kicker">The brief</p>'+(paras||[]).map(function(p){return '<p style="margin:0 0 10px">'+esc(p)+'</p>';}).join('')+'</section>';if(s)s.textContent='What would you say?';}
      return c;
    },
    /* Course pages: stacked version inside an existing element. */
    stack:function(el,id,brief){
      var c=TSBrief.card(id);
      if(!c){el.innerHTML=String(brief||'').split('\n\n').map(function(p){return '<p>'+esc(p)+'</p>';}).join('');return null;}
      el.classList.add('tsb-stack');el.innerHTML=goal(c)+side(c);return c;
    }
  };
  root.TSBrief=TSBrief;
})(typeof window!=='undefined'?window:globalThis);
