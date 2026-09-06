(function(){
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const values=[100,250,500,1000,2000,4000,8000,15000,30000,60000,120000,250000,500000,750000,1000000];
  const labels=['A','B','C','D'];
  const state={round:1,score:0,selected:null,answered:false,current:null,player:'PLAYER',used:{fifty:false,advisor:false,swap:false,poll:false,shield:false},shieldArmed:false,teacherUnlocked:false,testQuestions:[]};
  let audioStarted=false, teacherBankReady=false, teacherTestReady=false;

  const screens={home:$('#homeScreen'),game:$('#gameScreen'),teacher:$('#teacherScreen')};
  const modals={pass:$('#teacherPassModal'),guide:$('#guideModal'),settings:$('#settingsModal'),result:$('#gameOverModal')};

  function showScreen(name){
    Object.values(screens).forEach(x=>x.classList.remove('active'));
    screens[name].classList.add('active');
    $('#app').classList.toggle('teacher-mode',name==='teacher');
    window.scrollTo(0,0);
  }
  function openModal(m){m.classList.add('active')}
  function closeModal(m){m.classList.remove('active')}
  function formatScore(n){return new Intl.NumberFormat('vi-VN').format(n)}
  function safeScore(){if(state.round>10)return values[9];if(state.round>5)return values[4];return 0}
  function setFeedback(html,type=''){const el=$('#feedbackBox');el.className='feedback-box'+(type?' '+type:'');el.innerHTML=html||''}
  function ensureAudio(){GameAudio.ensure();if(!audioStarted){GameAudio.startMusic();audioStarted=true}}
  function persistRun(){
    try{
      if(!state.current)return;
      sessionStorage.setItem('cpct-active-run',JSON.stringify({round:state.round,score:state.score,current:state.current,player:state.player,used:state.used,shieldArmed:state.shieldArmed}));
    }catch(_e){}
  }
  function clearRun(){try{sessionStorage.removeItem('cpct-active-run')}catch(_e){}}

  function buildLadder(){
    const list=$('#ladderList');list.innerHTML='';
    values.forEach((v,i)=>{
      const n=i+1,div=document.createElement('div');
      div.className='ladder-item'+([5,10,15].includes(n)?' safe':'')+(n===state.round?' current':'')+(n<state.round?' passed':'');
      div.innerHTML=`<span class="num">${n}</span><span class="value">${formatScore(v)}</span><span class="marker">${[5,10].includes(n)?'◆':''}</span>`;
      list.appendChild(div);
    });
  }

  function resetAnswerUI(){
    state.selected=null;state.answered=false;
    $('#confirmBtn').disabled=true;$('#confirmBtn').classList.remove('hidden');$('#nextBtn').classList.add('hidden');
    setFeedback('');
    const reveal=$('#lifelineReveal'); if(reveal){reveal.innerHTML='';reveal.classList.add('hidden')}
  }

  function renderQuestion(){
    const q=state.current;
    $('#roundNumber').textContent=state.round;$('#scoreValue').textContent=formatScore(values[state.round-1]);
    $('#categoryLabel').textContent=q.category;$('#questionText').textContent=q.text;$('#questionMath').innerHTML=q.formula||'';
    const grid=$('#answerGrid');grid.innerHTML='';
    q.answers.forEach((ans,i)=>{
      const b=document.createElement('button');b.type='button';b.className='answer-btn';b.dataset.index=i;
      b.innerHTML=`<span class="answer-letter">${labels[i]}</span><span class="answer-content">${ans}</span>`;
      b.addEventListener('click',()=>selectAnswer(i));grid.appendChild(b);
    });
    resetAnswerUI();buildLadder();updateLifelines();persistRun();
  }

  function selectAnswer(i){
    if(state.answered)return;
    GameAudio.fx.select();state.selected=i;
    $$('.answer-btn').forEach((b,j)=>b.classList.toggle('selected',j===i));
    $('#confirmBtn').disabled=false;setFeedback(`Đã chọn <b>${labels[i]}</b>. Nhấn <b>CHỐT ĐÁP ÁN</b> khi bạn chắc chắn.`);
  }

  function lockAnswer(){
    if(state.selected===null||state.answered)return;
    state.answered=true;GameAudio.fx.lock();$('#confirmBtn').disabled=true;
    const buttons=$$('.answer-btn');buttons.forEach(b=>b.disabled=true);buttons[state.selected].classList.add('locked');
    setFeedback('Đang chốt đáp án…');
    setTimeout(()=>revealAnswer(),850);
  }

  function revealAnswer(){
    const q=state.current,buttons=$$('.answer-btn'),picked=state.selected;
    buttons.forEach(b=>b.classList.remove('locked'));

    if(picked===q.correct){
      buttons[q.correct].classList.add('correct');
      state.score=values[state.round-1];GameAudio.fx.correct();
      if(state.shieldArmed){state.shieldArmed=false;$('.arena-panel').classList.remove('shield-armed')}
      const milestone=[5,10].includes(state.round);if(milestone) setTimeout(()=>GameAudio.fx.milestone(),280);
      setFeedback(`<b>CHÍNH XÁC!</b> ${q.explanation}${milestone?'<br><strong>◆ Bạn vừa chạm mốc an toàn.</strong>':''}`,'good');
      $('#confirmBtn').classList.add('hidden');$('#nextBtn').classList.remove('hidden');
      $('#nextBtn').textContent=state.round===15?'NHẬN DANH HIỆU 🏆':'CÂU TIẾP THEO ➜';
      buildLadder();updateLifelines();persistRun();
      return;
    }

    if(state.shieldArmed){
      state.shieldArmed=false;$('.arena-panel').classList.remove('shield-armed');
      buttons[picked].classList.add('wrong','shield-blocked');buttons[picked].disabled=true;
      buttons.forEach((b,i)=>{if(i!==picked&&!b.classList.contains('eliminated'))b.disabled=false});
      state.answered=false;state.selected=null;$('#confirmBtn').disabled=true;$('#confirmBtn').classList.remove('hidden');
      GameAudio.fx.lifeline();
      setFeedback('<b>♢ KHIÊN CƠ HỘI ĐÃ KÍCH HOẠT!</b> Phương án vừa chọn chưa đúng nhưng lượt chơi vẫn tiếp tục. Hãy chọn lại một đáp án khác.','hint');
      updateLifelines();persistRun();
      return;
    }

    buttons[q.correct].classList.add('correct');buttons[picked].classList.add('wrong');GameAudio.fx.wrong();
    setFeedback(`<b>CHƯA ĐÚNG.</b> Đáp án đúng là <b>${labels[q.correct]}</b>.<br>${q.explanation}`,'bad');
    $('#confirmBtn').classList.add('hidden');
    setTimeout(()=>finish(false),1700);
  }

  function nextQuestion(){
    if(state.round===15){finish(true);return}
    state.round++;state.current=RootQuestions.generate(state.round);renderQuestion();GameAudio.fx.click();
  }

  function updateLifelines(){
    [['#fiftyBtn','fifty'],['#advisorBtn','advisor'],['#swapBtn','swap'],['#pollBtn','poll'],['#shieldBtn','shield']].forEach(([sel,key])=>{
      const b=$(sel);if(!b)return;b.disabled=state.used[key]||state.answered;b.classList.toggle('used',state.used[key]);
      b.classList.toggle('armed',key==='shield'&&state.shieldArmed);
    });
  }
  function useFifty(){
    if(state.used.fifty||state.answered)return;ensureAudio();state.used.fifty=true;GameAudio.fx.lifeline();
    const wrong=[0,1,2,3].filter(i=>i!==state.current.correct);shuffleInPlace(wrong);wrong.slice(0,2).forEach(i=>{$$('.answer-btn')[i].classList.add('eliminated');$$('.answer-btn')[i].disabled=true});
    setFeedback('50:50 đã loại hai phương án không đúng.','hint');updateLifelines();persistRun();
  }
  function useAdvisor(){
    if(state.used.advisor||state.answered)return;ensureAudio();state.used.advisor=true;GameAudio.fx.lifeline();setFeedback(`<b>CỐ VẤN TOÁN:</b> ${state.current.hint}`,'hint');updateLifelines();persistRun();
  }
  function useSwap(){
    if(state.used.swap||state.answered)return;ensureAudio();state.used.swap=true;GameAudio.fx.lifeline();state.current=RootQuestions.generate(state.round);renderQuestion();setFeedback('Đã đổi sang một câu khác cùng mức độ.','hint');updateLifelines();persistRun();
  }
  function usePoll(){
    if(state.used.poll||state.answered)return;ensureAudio();state.used.poll=true;GameAudio.fx.lifeline();
    const buttons=$$('.answer-btn'),active=buttons.map((b,i)=>b.classList.contains('eliminated')?null:i).filter(i=>i!==null);
    const pct=[0,0,0,0],correct=state.current.correct;
    const main=active.length<=2?Math.floor(72+Math.random()*12):Math.floor(56+Math.random()*16);pct[correct]=main;
    const rest=active.filter(i=>i!==correct);let remain=100-main;
    if(rest.length){
      const weights=rest.map(()=>Math.random()+.35),sum=weights.reduce((a,b)=>a+b,0);let used=0;
      rest.forEach((idx,k)=>{if(k===rest.length-1)pct[idx]=remain-used;else{const v=Math.max(0,Math.floor(remain*weights[k]/sum));pct[idx]=v;used+=v}});
    }
    const reveal=$('#lifelineReveal');
    reveal.innerHTML=`<div class="poll-card"><div class="poll-head"><span>▥ THĂM DÒ ẢO</span><small>Gợi ý tham khảo, không phải đáp án tuyệt đối</small></div><div class="poll-bars">${labels.map((l,i)=>`<div class="poll-row"><b>${l}</b><div><i style="width:${pct[i]}%"></i></div><strong>${pct[i]}%</strong></div>`).join('')}</div></div>`;
    reveal.classList.remove('hidden');setFeedback('Kết quả bình chọn đã xuất hiện phía trên các phương án.','hint');updateLifelines();persistRun();
  }
  function useShield(){
    if(state.used.shield||state.answered)return;ensureAudio();state.used.shield=true;state.shieldArmed=true;GameAudio.fx.lifeline();
    $('.arena-panel').classList.add('shield-armed');setFeedback('<b>♢ KHIÊN CƠ HỘI ĐÃ SẴN SÀNG.</b> Nếu câu trả lời tiếp theo chưa đúng, bạn sẽ được chọn lại một lần mà không kết thúc lượt chơi.','hint');updateLifelines();persistRun();
  }
  function shuffleInPlace(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}}

  function startGame(){
    ensureAudio();state.player=$('#playerName').value.trim()||'NHÀ TOÁN HỌC';state.round=1;state.score=0;state.selected=null;state.answered=false;state.used={fifty:false,advisor:false,swap:false,poll:false,shield:false};state.shieldArmed=false;$('.arena-panel').classList.remove('shield-armed');
    $('#playerLabel').textContent=state.player.toUpperCase();state.current=RootQuestions.generate(1);showScreen('game');renderQuestion();
  }

  function finish(won){
    clearRun();
    const guaranteed=won?values[14]:safeScore();
    $('#resultIcon').textContent=won?'🏆':'◆';$('#resultKicker').textContent=won?'CHINH PHỤC CĂN THỨC':'KẾT THÚC LƯỢT CHƠI';
    $('#resultTitle').textContent=won?'BẬC THẦY CĂN THỨC!':'Hành trình tạm dừng';$('#resultScore').textContent=formatScore(won?values[14]:guaranteed);
    $('#resultText').textContent=won?`${state.player}, bạn đã vượt qua đủ 15 câu và chạm mốc 1.000.000 điểm!`:(guaranteed>0?`Bạn dừng ở câu ${state.round}. Thành tích được bảo toàn tại mốc an toàn gần nhất.`:`Bạn dừng ở câu ${state.round}. Hãy thử lại để chạm mốc an toàn đầu tiên.`);
    $('#resultDetails').innerHTML=`<div><small>CÂU ĐÃ TỚI</small><b>${state.round}/15</b></div><div><small>ĐIỂM CAO NHẤT LƯỢT</small><b>${formatScore(state.score)}</b></div>`;
    if(won)GameAudio.fx.win();openModal(modals.result);
  }

  // Teacher mode
  function requestTeacher(){if(state.teacherUnlocked){openTeacher();return}$('#teacherPass').value='';$('#passError').textContent='';openModal(modals.pass);setTimeout(()=>$('#teacherPass').focus(),80)}
  function checkTeacherPass(){if($('#teacherPass').value==='05067379'){state.teacherUnlocked=true;closeModal(modals.pass);openTeacher();GameAudio.fx.correct()}else{$('#passError').textContent='Mật khẩu chưa đúng.';GameAudio.fx.wrong()}}
  function openTeacher(){showScreen('teacher');if(!teacherBankReady){renderTeacherBank();teacherBankReady=true}}

  function renderTeacherBank(){
    const root=$('#teacherBank');
    root.innerHTML=`<div class="teacher-toolbar"><label>Mức câu hỏi <select id="bankRange"><option value="1" selected>Câu 1–5</option><option value="6">Câu 6–10</option><option value="11">Câu 11–15</option><option value="all">Toàn bộ 1–15</option></select></label><button id="regenBank" type="button">↻ TẠO BỘ CÂU MỚI</button><span id="bankStatus" class="bank-status" aria-live="polite"></span></div><div id="bankList" class="teacher-list"></div><div id="bankPager" class="bank-pager hidden"><button id="bankPrev" type="button">← 5 CÂU TRƯỚC</button><span id="bankPageLabel"></span><button id="bankNext" type="button">5 CÂU TIẾP →</button></div>`;

    let bankBusy=false,bankItems=[],bankPage=0;
    const pageSize=5;
    const setBusy=(busy)=>{
      bankBusy=busy;
      const btn=$('#regenBank'),range=$('#bankRange');
      btn.disabled=busy;range.disabled=busy;
      btn.textContent=busy?'ĐANG TẠO…':'↻ TẠO BỘ CÂU MỚI';
      $('#bankStatus').textContent=busy?'Đang chuẩn bị câu hỏi…':'';
    };
    const renderPage=()=>{
      const list=$('#bankList');
      const start=bankPage*pageSize,end=Math.min(start+pageSize,bankItems.length);
      const frag=document.createDocumentFragment();
      const holder=document.createElement('div');
      holder.innerHTML=bankItems.slice(start,end).map((item,i)=>teacherQuestionHTML(item.q,item.level,start+i+1)).join('');
      while(holder.firstChild)frag.appendChild(holder.firstChild);
      list.replaceChildren(frag);
      const pager=$('#bankPager'),pages=Math.max(1,Math.ceil(bankItems.length/pageSize));
      pager.classList.toggle('hidden',pages<=1);
      $('#bankPrev').disabled=bankPage<=0;$('#bankNext').disabled=bankPage>=pages-1;
      $('#bankPageLabel').textContent=`Đang xem ${start+1}–${end} / ${bankItems.length}`;
      $('#bankStatus').textContent=`Đã tạo ${bankItems.length} câu • hiển thị tối đa 5 câu mỗi trang`;
    };
    const generate=()=>{
      if(bankBusy)return;
      setBusy(true);
      // Nhường một frame cho trình duyệt cập nhật giao diện trước khi tạo bộ mới.
      requestAnimationFrame(()=>setTimeout(()=>{
        try{
          const v=$('#bankRange').value;
          const levels=v==='all'?Array.from({length:15},(_,i)=>i+1):Array.from({length:5},(_,i)=>Number(v)+i);
          bankItems=levels.map(level=>({level,q:RootQuestions.generate(level)}));
          bankPage=0;renderPage();
        }catch(err){
          console.error('Teacher bank generation error:',err);
          $('#bankStatus').textContent='Không thể tạo bộ câu hỏi. Hãy thử lại.';
        }finally{setBusy(false)}
      },0));
    };
    $('#bankRange').addEventListener('change',generate);
    $('#regenBank').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();GameAudio.fx.click();generate()});
    $('#bankPrev').addEventListener('click',e=>{e.preventDefault();if(bankPage>0){bankPage--;renderPage();window.scrollTo({top:$('#teacherBank').offsetTop-90,behavior:'smooth'})}});
    $('#bankNext').addEventListener('click',e=>{e.preventDefault();const pages=Math.ceil(bankItems.length/pageSize);if(bankPage<pages-1){bankPage++;renderPage();window.scrollTo({top:$('#teacherBank').offsetTop-90,behavior:'smooth'})}});
    generate();
  }
  function teacherQuestionHTML(q,level,index){
    return `<article class="teacher-q"><div class="teacher-q-head"><span>CÂU ${index}</span><span>MỨC ${level}/15 • ${q.category}</span></div><h4>${escapeHtml(q.text)}</h4><div class="teacher-formula">${q.formula||''}</div><div class="teacher-options">${q.answers.map((a,i)=>`<div class="teacher-option ${i===q.correct?'correct':''}"><b>${labels[i]}.</b> ${a}</div>`).join('')}</div><div class="teacher-explain"><b>Đáp án: ${labels[q.correct]}</b><br>${q.explanation}<br><b>Gợi ý:</b> ${escapeHtml(q.hint)}</div></article>`;
  }
  function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

  function renderTestSetup(){
    const root=$('#teacherTest');root.innerHTML=`<div class="teacher-toolbar"><label>Số câu <select id="testCount"><option>5</option><option selected>10</option><option>15</option></select></label><label>Phạm vi <select id="testRange"><option value="mixed">Trộn toàn bộ</option><option value="1">Mức 1–5</option><option value="6">Mức 6–10</option><option value="11">Mức 11–15</option></select></label><button id="startTestBtn" type="button">BẮT ĐẦU TEST</button></div><div id="testArea"></div>`;
    $('#startTestBtn').addEventListener('click',startTeacherTest);
  }
  function startTeacherTest(){
    const count=Number($('#testCount').value),range=$('#testRange').value;state.testQuestions=[];
    for(let i=0;i<count;i++){let level;if(range==='mixed')level=1+Math.floor(Math.random()*15);else level=Number(range)+Math.floor(Math.random()*5);state.testQuestions.push(RootQuestions.generate(level))}
    const area=$('#testArea');
    area.innerHTML=`<form id="teacherTestForm" class="test-box">${state.testQuestions.map((q,qi)=>`<div class="test-question" data-q="${qi}"><h4>Câu ${qi+1}. ${escapeHtml(q.text)}</h4><div class="teacher-formula">${q.formula||''}</div><div class="test-answer-grid">${q.answers.map((a,ai)=>`<label class="test-choice"><input type="radio" name="q${qi}" value="${ai}"><span><b>${labels[ai]}.</b> ${a}</span></label>`).join('')}</div></div>`).join('')}<button class="primary-btn" type="submit">NỘP BÀI & CHẤM ĐIỂM</button></form>`;
    $('#teacherTestForm').addEventListener('submit',gradeTeacherTest);area.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function gradeTeacherTest(e){
    e.preventDefault();let correct=0;const form=e.currentTarget;
    state.testQuestions.forEach((q,qi)=>{const chosen=form.querySelector(`input[name="q${qi}"]:checked`);if(chosen&&Number(chosen.value)===q.correct)correct++});
    const pct=Math.round(correct/state.testQuestions.length*100);const result=document.createElement('div');result.className='test-result';result.innerHTML=`<b>KẾT QUẢ: ${correct}/${state.testQuestions.length} • ${pct}%</b><br><span>${pct>=80?'Rất tốt!':pct>=60?'Đạt yêu cầu.':'Nên luyện thêm các dạng chưa chắc.'}</span>`;form.prepend(result);
    form.querySelectorAll('.test-question').forEach((box,qi)=>{const q=state.testQuestions[qi],choices=box.querySelectorAll('.test-choice');choices.forEach((label,ai)=>{if(ai===q.correct){label.style.borderColor='rgba(104,239,177,.55)';label.style.background='rgba(47,161,112,.12)'}});const exp=document.createElement('div');exp.className='teacher-explain';exp.innerHTML=`<b>Đáp án ${labels[q.correct]}.</b> ${q.explanation}`;box.appendChild(exp)});
    form.querySelectorAll('input').forEach(x=>x.disabled=true);form.querySelector('button[type="submit"]').disabled=true;GameAudio.fx.milestone();window.scrollTo({top:form.offsetTop-80,behavior:'smooth'});
  }

  // Events
  $('#startBtn').addEventListener('click',startGame);$('#confirmBtn').addEventListener('click',lockAnswer);$('#nextBtn').addEventListener('click',nextQuestion);
  $('#fiftyBtn').addEventListener('click',useFifty);$('#advisorBtn').addEventListener('click',useAdvisor);$('#swapBtn').addEventListener('click',useSwap);$('#pollBtn').addEventListener('click',usePoll);$('#shieldBtn').addEventListener('click',useShield);
  $('#teacherBtn').addEventListener('click',requestTeacher);$('#teacherEntryBtn').addEventListener('click',requestTeacher);$('#confirmPassBtn').addEventListener('click',checkTeacherPass);$('#cancelPassBtn').addEventListener('click',()=>closeModal(modals.pass));$('#teacherPass').addEventListener('keydown',e=>{if(e.key==='Enter')checkTeacherPass()});
  $('#teacherBackBtn').addEventListener('click',()=>showScreen('home'));
  $$('.tab-btn').forEach(b=>b.addEventListener('click',()=>{
    $$('.tab-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    $$('.teacher-panel').forEach(x=>x.classList.remove('active'));
    const isBank=b.dataset.tab==='bank';
    $('#teacher'+(isBank?'Bank':'Test')).classList.add('active');
    if(isBank&&!teacherBankReady){renderTeacherBank();teacherBankReady=true}
    if(!isBank&&!teacherTestReady){renderTestSetup();teacherTestReady=true}
  }));
  $('#guideBtn').addEventListener('click',()=>openModal(modals.guide));$('#closeGuideBtn').addEventListener('click',()=>closeModal(modals.guide));
  $('#settingsBtn').addEventListener('click',()=>openModal(modals.settings));$('#closeSettingsBtn').addEventListener('click',()=>closeModal(modals.settings));
  $('#musicSlider').addEventListener('input',e=>{const v=Number(e.target.value);$('#musicValue').textContent=v+'%';GameAudio.setMusic(v/100);ensureAudio()});
  $('#sfxSlider').addEventListener('input',e=>{const v=Number(e.target.value);$('#sfxValue').textContent=v+'%';GameAudio.setSfx(v/100);ensureAudio()});
  $('#soundBtn').addEventListener('click',()=>{ensureAudio();const on=GameAudio.toggle();$('#soundBtn').textContent=on?'🔊':'🔇'});
  $('#homeBtn').addEventListener('click',()=>{clearRun();closeModal(modals.result);showScreen('home')});$('#resultHomeBtn').addEventListener('click',()=>{clearRun();closeModal(modals.result);showScreen('home')});$('#playAgainBtn').addEventListener('click',()=>{closeModal(modals.result);startGame()});
  Object.values(modals).forEach(m=>m.addEventListener('click',e=>{if(e.target===m&&m!==modals.result)closeModal(m)}));
  document.addEventListener('keydown',e=>{
    if(!screens.game.classList.contains('active')||Object.values(modals).some(m=>m.classList.contains('active')))return;
    const key=e.key.toUpperCase();const map={A:0,B:1,C:2,D:3,'1':0,'2':1,'3':2,'4':3};
    if(map[key]!==undefined){const b=$$('.answer-btn')[map[key]];if(b&&!b.disabled)selectAnswer(map[key])}
    if(e.key==='Enter'){if(!$('#nextBtn').classList.contains('hidden'))nextQuestion();else if(!$('#confirmBtn').disabled)lockAnswer()}
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){GameAudio.stopMusic()}
    else if(audioStarted){GameAudio.startMusic()}
  });
  window.addEventListener('pagehide',()=>GameAudio.stopMusic());

  function restoreRun(){
    try{
      const raw=sessionStorage.getItem('cpct-active-run');if(!raw)return false;
      const saved=JSON.parse(raw);
      if(!saved||!saved.current||!saved.round)return false;
      state.round=saved.round;state.score=saved.score||0;state.current=saved.current;state.player=saved.player||'NHÀ TOÁN HỌC';
      state.used=Object.assign({fifty:false,advisor:false,swap:false,poll:false,shield:false},saved.used||{});
      state.shieldArmed=!!saved.shieldArmed;
      $('#playerLabel').textContent=state.player.toUpperCase();
      if(state.shieldArmed)$('.arena-panel').classList.add('shield-armed');
      showScreen('game');renderQuestion();
      setFeedback('<b>Đã khôi phục lượt chơi</b> sau khi trang được tải lại. Bạn có thể tiếp tục từ câu hiện tại.','hint');
      return true;
    }catch(_e){clearRun();return false}
  }

  if(!restoreRun())buildLadder();
})();
