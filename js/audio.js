(function(){
  let ctx=null,master=null,musicGain=null,sfxGain=null,muted=false,musicVol=.72,sfxVol=.9,loopTimer=null,step=0;
  function ensure(){if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();master=ctx.createGain();musicGain=ctx.createGain();sfxGain=ctx.createGain();musicGain.gain.value=musicVol*.24;sfxGain.gain.value=sfxVol*.5;musicGain.connect(master);sfxGain.connect(master);master.connect(ctx.destination);master.gain.value=1}
  function osc(freq,dur=.15,type='sine',gain=.18,when=0,dest='sfx'){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime+when);g.gain.setValueAtTime(0.0001,ctx.currentTime+when);g.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+when+.015);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+when+dur);o.connect(g);g.connect(dest==='music'?musicGain:sfxGain);o.start(ctx.currentTime+when);o.stop(ctx.currentTime+when+dur+.03)}
  function chord(arr,dur=.5,gain=.05){ensure();arr.forEach((f,i)=>osc(f,dur,'sine',gain,i*.015,'music'))}
  function startMusic(){ensure();stopMusic();if(!ctx)return;step=0;const progression=[[110,164.81,220],[98,146.83,196],[123.47,185,246.94],[92.5,138.59,185]];loopTimer=setInterval(()=>{if(muted)return;const c=progression[step%progression.length];chord(c,1.5,.025);osc(c[0]*2,.16,'triangle',.026,0,'music');osc(c[0]*2.5,.12,'triangle',.018,.36,'music');step++},850)}
  function stopMusic(){if(loopTimer){clearInterval(loopTimer);loopTimer=null}}
  const fx={
    click(){ensure();osc(420,.07,'triangle',.13)},select(){ensure();osc(520,.08,'sine',.14);osc(680,.08,'sine',.08,.05)},lock(){ensure();osc(220,.22,'sawtooth',.08);osc(330,.3,'triangle',.09,.12);osc(440,.38,'sine',.1,.22)},correct(){ensure();[523.25,659.25,783.99,1046.5].forEach((f,i)=>osc(f,.26,'triangle',.13,i*.08))},wrong(){ensure();osc(190,.35,'sawtooth',.13);osc(150,.45,'sawtooth',.09,.12)},milestone(){ensure();[392,523.25,659.25,783.99].forEach((f,i)=>osc(f,.45,'sine',.12,i*.11))},win(){ensure();[261.63,329.63,392,523.25,659.25,783.99,1046.5].forEach((f,i)=>osc(f,.55,'triangle',.13,i*.09))},lifeline(){ensure();osc(740,.16,'sine',.12);osc(980,.22,'sine',.08,.12)}
  };
  function setMusic(v){musicVol=Math.max(0,Math.min(1,v));if(musicGain)musicGain.gain.value=musicVol*.24}
  function setSfx(v){sfxVol=Math.max(0,Math.min(1,v));if(sfxGain)sfxGain.gain.value=sfxVol*.5}
  function toggle(){ensure();muted=!muted;if(master)master.gain.value=muted?0:1;return !muted}
  window.GameAudio={ensure,startMusic,stopMusic,fx,setMusic,setSfx,toggle,isMuted:()=>muted};
})();
