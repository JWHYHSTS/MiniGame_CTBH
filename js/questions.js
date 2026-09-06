(function(){
  const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
  const fmt=n=>String(n).replace(/-/g,'−');
  const math=s=>`<math xmlns="http://www.w3.org/1998/Math/MathML"><mtext>${s}</mtext></math>`;
  const sqrt=s=>`<math xmlns="http://www.w3.org/1998/Math/MathML"><msqrt><mtext>${s}</mtext></msqrt></math>`;
  const frac=(n,d)=>`<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mtext>${n}</mtext><mtext>${d}</mtext></mfrac></math>`;
  const q=(category,text,formula,answers,correct,hint,explanation)=>({category,text,formula,answers,correct,hint,explanation});
  const mc=(obj)=>{const tagged=obj.answers.map((x,i)=>({x,ok:i===obj.correct}));const s=shuffle(tagged);obj.answers=s.map(v=>v.x);obj.correct=s.findIndex(v=>v.ok);return obj};
  const squares=[4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400];

  function basicRoot(){
    const sq=pick(squares),r=Math.round(Math.sqrt(sq));
    if(Math.random()<.5) return mc(q('CĂN BẬC HAI','Tính giá trị của biểu thức:',sqrt(sq),[math(r),math(-r),math(sq),math(`±${r}`)],0,'Kí hiệu √a là căn bậc hai số học nên kết quả không âm.',`${sqrt(sq)} = ${math(r)}.`));
    return mc(q('CĂN BẬC HAI','Các căn bậc hai của số sau là:',math(sq),[math(`${r} và −${r}`),math(r),math(-r),math(`${sq} và −${sq}`)],0,'Một số dương có hai căn bậc hai đối nhau.',`Vì ${math(`${r}² = ${sq}`)} và ${math(`(−${r})² = ${sq}`)}, nên hai căn bậc hai là ${math(`${r} và −${r}`)}.`));
  }
  function rootSquareNumber(){
    const a=rand(2,14),neg=Math.random()<.55;
    const inside=neg?`(−${a})²`:`${a}²`;
    return mc(q('TÍNH CHẤT CĂN BẬC HAI','Không dùng máy tính, hãy tính:',sqrt(inside),[math(a),math(-a),math(a*a),math(`±${a}`)],0,'Dùng √(a²)=|a|.',`${sqrt(inside)} = ${math(`|${neg?'−':''}${a}| = ${a}`)}.`));
  }
  function identifyIdentity(){
    const a=rand(1,7);
    return mc(q('HẰNG ĐẲNG THỨ','Khẳng định nào đúng với mọi số thực x?', '',[
      `${sqrt(`(x − ${a})²`)} = ${math(`|x − ${a}|`)}`,
      `${sqrt(`(x − ${a})²`)} = ${math(`x − ${a}`)}`,
      `${sqrt(`(x − ${a})²`)} = ${math(`${a} − x`)}`,
      `${sqrt(`(x − ${a})²`)} = ${math(`x + ${a}`)}`
    ],0,'Công thức tổng quát là √(A²)=|A|.',`${sqrt(`(x − ${a})²`)} = ${math(`|x − ${a}|`)}.`));
  }
  function domainLinearPos(){
    const a=rand(1,6),m=rand(2,5),b=a*m;
    return mc(q('ĐIỀU KIỆN XÁC ĐỊNH','Tìm điều kiện để căn thức xác định:',sqrt(`${m}x − ${b}`),[math(`x ≥ ${a}`),math(`x > ${a}`),math(`x ≤ ${a}`),math(`x < ${a}`)],0,'Biểu thức dưới dấu căn phải không âm.',`${math(`${m}x − ${b} ≥ 0`)} ⇒ ${math(`x ≥ ${a}`)}.`));
  }
  function domainLinearNeg(){
    const c=rand(1,8);
    return mc(q('ĐIỀU KIỆN XÁC ĐỊNH','Căn thức sau xác định khi:',sqrt(`${c} − x`),[math(`x ≤ ${c}`),math(`x < ${c}`),math(`x ≥ ${c}`),math(`x > ${c}`)],0,'Đặt biểu thức dưới dấu căn ≥ 0.',`${math(`${c} − x ≥ 0`)} ⇒ ${math(`x ≤ ${c}`)}.`));
  }
  function evaluateIdentity(){
    const a=rand(1,6),x=rand(-4,7),v=Math.abs(x-a);
    const opts=[v, -v, v*v, Math.abs(x+a)];
    const uniq=[...new Set(opts)]; while(uniq.length<4) uniq.push(v+uniq.length+2);
    return mc(q('TÍNH GIÁ TRỊ',`Tại x = ${fmt(x)}, tính:`,sqrt(`(x − ${a})²`),uniq.slice(0,4).map(math),0,'Thay x vào rồi dùng √(A²)=|A|.',`${sqrt(`(x − ${a})²`)} = ${math(`|x − ${a}|`)}. Với ${math(`x=${fmt(x)}`)} ta được ${math(v)}.`));
  }
  function simplifyConditionLess(){
    const a=rand(1,7);
    return mc(q('RÚT GỌN THEO ĐIỀU KIỆN',`Biết x < ${a}. Rút gọn biểu thức:`,sqrt(`(x − ${a})²`),[math(`${a} − x`),math(`x − ${a}`),math(`|x − ${a}|`),math(`x + ${a}`)],0,`Vì x < ${a} nên x − ${a} < 0.`,`${sqrt(`(x − ${a})²`)} = ${math(`|x − ${a}| = ${a} − x`)}.`));
  }
  function simplifyConditionGreater(){
    const a=rand(1,7);
    return mc(q('RÚT GỌN THEO ĐIỀU KIỆN',`Biết x > ${a}. Rút gọn biểu thức:`,sqrt(`(x − ${a})²`),[math(`x − ${a}`),math(`${a} − x`),math(`|x − ${a}|`),math(`x + ${a}`)],0,`Vì x > ${a} nên x − ${a} > 0.`,`${sqrt(`(x − ${a})²`)} = ${math(`|x − ${a}| = x − ${a}`)}.`));
  }
  function perfectSquarePoly(){
    const x=rand(-3,5),value=Math.abs(2*x-1);const wrong=[2*x-1,(2*x-1)**2,Math.abs(x-1),value+2];const opts=[value,...wrong.filter(v=>v!==value)].slice(0,4);
    while(new Set(opts).size<4) opts[opts.length-1]+=3;
    return mc(q('NHẬN DẠNG BÌNH PHƯƠNG',`Tại x = ${fmt(x)}, tính giá trị:`,sqrt('4x² − 4x + 1'),opts.map(math),0,'Nhận ra 4x² − 4x + 1 = (2x − 1)².',`${sqrt('4x² − 4x + 1')} = ${math('|2x − 1|')}. Thay x vào được ${math(value)}.`));
  }
  function xRootX6(){
    return mc(q('RÚT GỌN CĂN THỨC','Biết x < 0. Rút gọn:',`${math('x · ')}${sqrt('x⁶')}`,[math('−x⁴'),math('x⁴'),math('−x³'),math('x³')],0,'√(x⁶)=√((x³)²)=|x³|. Với x<0 thì x³<0.',`${sqrt('x⁶')} = ${math('|x³| = −x³')}, nên ${math('x·(−x³)=−x⁴')}.`));
  }
  function falling(){
    const t=rand(2,7),s=(4.9*t*t).toFixed(1).replace('.',',');
    return mc(q('VẬN DỤNG THỰC TẾ',`Một vật rơi tự do theo công thức S = 4,9t². Nếu vật rơi quãng đường ${s} m thì thời gian rơi là:`, '',[`${t} giây`,`${t*t} giây`,`${(t+1)} giây`,`${Math.max(1,t-1)} giây`],0,'Thay S vào công thức. Vì thời gian không âm nên chỉ nhận t ≥ 0.',`${math(`4,9t² = ${s}`)} ⇒ ${math(`t² = ${t*t}`)} ⇒ ${math(`t = ${t}`)} giây.`));
  }
  function domainMixed(){
    const k=rand(2,5),t=rand(1,5);
    return mc(q('ĐIỀU KIỆN XÁC ĐỊNH','Chọn điều kiện xác định đúng:',sqrt(`${k}x + ${k*t}`),[math(`x ≥ −${t}`),math(`x > −${t}`),math(`x ≤ −${t}`),math(`x < −${t}`)],0,'Biểu thức dưới căn phải ≥ 0.',`${math(`${k}x + ${k*t} ≥ 0`)} ⇒ ${math(`x ≥ −${t}`)}.`));
  }
  function conceptual(){
    const type=rand(0,2);
    if(type===0)return mc(q('NHẬN BIẾT','Phát biểu nào đúng?', '',['Căn bậc hai số học của số không âm luôn không âm.','Mọi số thực đều có hai căn bậc hai.','√a luôn bằng ±a.','√(a²)=a với mọi số thực a.'],0,'Phân biệt “căn bậc hai” với “căn bậc hai số học”.','Theo định nghĩa, √a là căn bậc hai không âm của a khi a ≥ 0.'));
    if(type===1)return mc(q('NHẬN BIẾT','Điều kiện để căn thức √A xác định là:', '',[math('A ≥ 0'),math('A > 0'),math('A ≤ 0'),math('A ≠ 0')],0,'Biểu thức dưới dấu căn bậc hai phải không âm.',`Điều kiện xác định là ${math('A ≥ 0')}.`));
    return identifyIdentity();
  }
  function trickyAbsolute(){
    const a=rand(1,5);
    return mc(q('RÚT GỌN NÂNG CAO',`Biết x < −${a}. Rút gọn:`,sqrt(`(x + ${a})²`),[math(`−x − ${a}`),math(`x + ${a}`),math(`−x + ${a}`),math(`|x − ${a}|`)],0,`x < −${a} ⇒ x + ${a} < 0.`,`${sqrt(`(x + ${a})²`)} = ${math(`|x + ${a}| = −x − ${a}`)}.`));
  }

  const pools={
    1:[basicRoot,conceptual],2:[basicRoot,rootSquareNumber],3:[rootSquareNumber,conceptual],
    4:[identifyIdentity,evaluateIdentity],5:[identifyIdentity,rootSquareNumber,evaluateIdentity],
    6:[domainLinearPos,domainLinearNeg],7:[domainLinearPos,domainMixed],8:[domainLinearNeg,domainMixed,conceptual],
    9:[simplifyConditionLess,simplifyConditionGreater],10:[simplifyConditionLess,simplifyConditionGreater,trickyAbsolute],
    11:[perfectSquarePoly,evaluateIdentity],12:[xRootX6,perfectSquarePoly],13:[falling,domainMixed,trickyAbsolute],
    14:[xRootX6,falling,perfectSquarePoly],15:[falling,xRootX6,trickyAbsolute,perfectSquarePoly]
  };
  function generate(level){return pick(pools[Math.max(1,Math.min(15,level))])();}
  function generateSet(count=15,startLevel=1){return Array.from({length:count},(_,i)=>generate(Math.min(15,startLevel+i)))}
  function mixed(count=10){return Array.from({length:count},()=>generate(rand(1,15)))}
  window.RootQuestions={generate,generateSet,mixed,math,sqrt,frac};
})();
