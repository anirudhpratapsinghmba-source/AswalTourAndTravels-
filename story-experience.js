(() => {
  const root=document.querySelector('#storyJourney');
  if(!root) return;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = [
    {kicker:'01 · JAMMU & KASHMIR', title:'Where the<br><em>mountains begin.</em>', desc:'Srinagar · Gulmarg · Pahalgam. Lakes, meadows and Himalayan roads opening into the north.', place:'SRINAGAR', region:'34.1° N · 74.8° E', side:'LAKE · VALLEY · HIMALAYA', price:'From ₹14,999*'},
    {kicker:'02 · HIMACHAL PRADESH', title:'Chase the<br><em>mountain light.</em>', desc:'Manali · Shimla · Kasol. Pine forests, high passes and slow mornings above the clouds.', place:'MANALI', region:'32.2° N · 77.2° E', side:'PINE · PASS · CLOUD', price:'From ₹9,999*'},
    {kicker:'03 · UTTARAKHAND', title:'Begin where<br><em>mountains breathe.</em>', desc:'Rishikesh · Mussoorie · Haridwar · Nainital. Rivers, ghats and Himalayan escapes.', place:'RISHIKESH', region:'30.1° N · 78.3° E', side:'RIVER · MOUNTAIN · STILLNESS', price:'From ₹8,000*'},
    {kicker:'04 · RAJASTHAN', title:'Walk into<br><em>royal light.</em>', desc:'Jaipur · Udaipur · Jodhpur · Jaisalmer. Fort walls, blue streets and desert sunsets.', place:'JAISALMER', region:'26.9° N · 70.9° E', side:'FORT · DESERT · HERITAGE', price:'From ₹5,000*'},
    {kicker:'05 · DELHI', title:'Meet the<br><em>city of stories.</em>', desc:'Old Delhi · India Gate · Humayun’s Tomb. History, food and a capital that never stops moving.', place:'NEW DELHI', region:'28.6° N · 77.2° E', side:'HISTORY · FOOD · CAPITAL', price:'From ₹7,999*'},
    {kicker:'06 · UTTAR PRADESH', title:'Follow the<br><em>river of stories.</em>', desc:'Agra · Mathura · Ayodhya · Varanasi. Architecture, devotion and the timeless Ganga.', place:'VARANASI', region:'25.3° N · 83.0° E', side:'GANGA · CULTURE · FAITH', price:'From ₹10,999*'},
    {kicker:'07 · GOA', title:'Let the<br><em>coast take over.</em>', desc:'Panaji · Vagator · Calangute · Palolem. Beach roads, old Goa and sunsets without a clock.', place:'PALOLEM', region:'15.0° N · 74.0° E', side:'SEA · SUNSET · FREEDOM', price:'From ₹8,999*'},
    {kicker:'08 · KERALA', title:'Let the<br><em>water slow you.</em>', desc:'Kochi · Munnar · Thekkady · Alappuzha. Tea hills, wildlife and houseboats.', place:'ALLEPPEY', region:'9.5° N · 76.3° E', side:'TEA · WATER · WELLNESS', price:'From ₹15,000*'},
    {kicker:'09 · TAMIL NADU', title:'Follow the<br><em>temple horizon.</em>', desc:'Chennai · Madurai · Ooty · Rameswaram. Sacred architecture, hills and southern coastlines.', place:'MADURAI', region:'9.9° N · 78.1° E', side:'TEMPLES · HILLS · COAST', price:'From ₹12,999*'},
    {kicker:'10 · KARNATAKA', title:'Find the<br><em>road less expected.</em>', desc:'Bengaluru · Coorg · Hampi · Mysuru. Coffee estates, royal history and ancient stone.', place:'HAMPI', region:'15.3° N · 76.5° E', side:'COFFEE · RUINS · ROYALTY', price:'From ₹11,999*'},
    {kicker:'11 · SIKKIM', title:'Higher into<br><em>the quiet.</em>', desc:'Gangtok · Pelling · Lachung. Monasteries, mountain roads and views toward Kanchenjunga.', place:'GANGTOK', region:'27.3° N · 88.6° E', side:'MONASTERY · PEAK · MIST', price:'From ₹13,999*'},
    {kicker:'12 · ASSAM', title:'End where<br><em>the wild begins.</em>', desc:'Guwahati · Kaziranga · Majuli. River islands, tea country and the call of the wild.', place:'KAZIRANGA', region:'26.6° N · 93.2° E', side:'WILDLIFE · TEA · RIVER', price:'From ₹14,999*'}
  ];


  const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
  const stage=$('.story-stage'), media=$('.story-scene');
  // Preload every chapter image so the first scroll never reveals a blank frame.
  media.forEach(scene=>{
    const raw=scene.style.getPropertyValue('--image').trim();
    const url=raw.replace(/^url\(['"]?(.*?)['"]?\)$/,'$1');
    if(url){ const img=new Image(); img.decoding='async'; img.loading='eager'; img.src=url; }
  });
  const kicker=$('#storyKicker'), title=$('#storyTitle'), desc=$('#storyDescription');
  const place=$('#storyPlace'), region=$('#storyRegion'), side=$('#storySide');
  const counter=$('#storyCounter'), progress=$('#storyProgress'), destination=$('#storyDestination');
  const route=$('.story-route-progress'), cursor=$('#storyCursor');
  const railNumber=$('#storyRailNumber'), railCity=$('#storyRailCity'), railPrice=$('#storyRailPrice');
  const railNextNumber=$('#storyRailNextNumber'), railNext=$('#storyRailNext');
  const dots=$('#storyDots'), prev=$('#storyPrev'), next=$('#storyNext');
  let active=0, ticking=false;

  // Build exactly one compact city selector. Twelve cities remain available without
  // filling the screen with twelve cards.
  const tabs=scenes.map((s,i)=>{
    const dot=document.createElement('button');
    dot.type='button'; dot.className='story-dot'+(i===0?' is-active':'');
    dot.setAttribute('aria-label','Go to '+s.place);
    dot.addEventListener('click',()=>jumpToScene(i));
    dots?.appendChild(dot);
    return dot;
  });

  function refreshRail(index){
    const s=scenes[index], n=scenes[Math.min(index+1,scenes.length-1)];
    railNumber.textContent=String(index+1).padStart(2,'0');
    railCity.textContent=s.place;
    railPrice.textContent=s.price||'Custom quote';
    railNextNumber.textContent=String(Math.min(index+1,scenes.length-1)+1).padStart(2,'0');
    railNext.textContent=n.place;
    tabs.forEach((d,i)=>d.classList.toggle('is-active',i===index));
    if(prev) prev.disabled=index===0;
    if(next) next.disabled=index===scenes.length-1;
  }

  function setCopy(index,animate=true){
    index=Math.max(0,Math.min(scenes.length-1,index));
    const s=scenes[index];
    if(index===active && kicker.textContent===s.kicker) return;
    active=index;
    refreshRail(index);
    counter.textContent=String(index+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');

    if(!window.gsap || !animate || reduceMotion){
      kicker.textContent=s.kicker; title.innerHTML=s.title; desc.textContent=s.desc;
      place.textContent=s.place; region.textContent=s.region; side.textContent=s.side;
      media.forEach((m,i)=>{m.classList.toggle('is-active',i===index);m.style.zIndex=i===index?'2':'0';});
      return;
    }

    const textEls=[kicker,title,desc,place,region,side];
    gsap.killTweensOf(textEls);
    gsap.to(textEls,{autoAlpha:0,y:14,duration:.16,stagger:.015,ease:'power2.in',onComplete:()=>{
      kicker.textContent=s.kicker; title.innerHTML=s.title; desc.textContent=s.desc;
      place.textContent=s.place; region.textContent=s.region; side.textContent=s.side;
      gsap.fromTo(textEls,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.42,stagger:.025,ease:'power3.out'});
    }});
    media.forEach((m,i)=>{
      gsap.killTweensOf(m);
      if(i===index){
        gsap.set(m,{zIndex:2});
        gsap.fromTo(m,{opacity:0,scale:1.1,clipPath:'inset(0 0 100% 0)'},{opacity:1,scale:1.03,clipPath:'inset(0)',duration:.62,ease:'power3.inOut'});
      }else{
        gsap.to(m,{opacity:0,scale:1.06,duration:.42,ease:'power2.out'});
        m.classList.remove('is-active');
      }
    });
    destination && gsap.fromTo(destination,{scale:.78},{scale:1,duration:.5,ease:'back.out(1.8)'});
  }

  let wheelLocked=false;
  function jumpToScene(index){
    index=Math.max(0,Math.min(scenes.length-1,index));
    if(index===active && index!==0) return;
    // Change the copy immediately; the scroll motion follows it.
    setCopy(index,true);
    const top=root.getBoundingClientRect().top+window.scrollY;
    const max=Math.max(1,root.offsetHeight-window.innerHeight);
    const target=top+max*(index/(scenes.length-1));
    window.scrollTo({top:target,behavior:reduceMotion?'auto':'smooth'});
  }

  // Desktop: one deliberate wheel gesture advances exactly one city.
  // Trackpad bursts are throttled so a single swipe cannot skip chapters.
  stage?.addEventListener('wheel',e=>{
    if(Math.abs(e.deltaY)<18 || wheelLocked) return;
    const r=root.getBoundingClientRect();
    const inStory=r.top<innerHeight*0.35 && r.bottom>innerHeight*0.65;
    if(!inStory) return;
    const direction=e.deltaY>0?1:-1;
    const target=Math.max(0,Math.min(scenes.length-1,active+direction));
    if(target===active) return;
    e.preventDefault();
    wheelLocked=true;
    jumpToScene(target);
    window.setTimeout(()=>{wheelLocked=false;},700);
  },{passive:false});

  prev?.addEventListener('click',()=>jumpToScene(active-1));
  next?.addEventListener('click',()=>jumpToScene(active+1));
  refreshRail(0);

  // Scroll itself is the chapter controller. Each city owns an equal, short segment.
  function updateJourney(){
    const r=root.getBoundingClientRect();
    const max=Math.max(1,root.offsetHeight-window.innerHeight);
    const p=Math.max(0,Math.min(1,-r.top/max));
    const scaled=p*(scenes.length-1);
    const scene=Math.min(scenes.length-1,Math.round(scaled));
    progress.style.transform='scaleX('+p+')';
    if(route) route.style.strokeDashoffset=String(1400*(1-p));
    if(scene!==active) setCopy(scene,true);
    if(destination){
      destination.style.left='calc('+Math.min(91,Math.max(9,(92+818*p)/10))+'%)';
      destination.style.top=(38+Math.sin(p*Math.PI*2)*10)+'%';
    }
    ticking=false;
  }
  function requestJourneyUpdate(){
    if(!ticking){ticking=true;requestAnimationFrame(updateJourney);}
  }
  window.addEventListener('scroll',requestJourneyUpdate,{passive:true});
  window.addEventListener('resize',requestJourneyUpdate,{passive:true});
  requestJourneyUpdate();

  if(!reduceMotion && stage && window.gsap){
    stage.addEventListener('pointermove',e=>{
      const r=stage.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      gsap.to(media,{x:x*14,y:y*9,duration:.65,ease:'power3.out',overwrite:true});
      gsap.to('.story-orbit-a',{x:x*-24,y:y*-15,duration:1,ease:'power3.out',overwrite:true});
      gsap.to('.story-orbit-b',{x:x*18,y:y*12,duration:.9,ease:'power3.out',overwrite:true});
      if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';}
    });
    stage.addEventListener('pointerleave',()=>{
      gsap.to(media,{x:0,y:0,duration:.8,ease:'power3.out'});
      gsap.to('.story-orbit-a,.story-orbit-b',{x:0,y:0,duration:.8,ease:'power3.out'});
    });
    let downX=0,downY=0,dragging=false;
    stage.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;downX=e.clientX;downY=e.clientY;dragging=true;stage.setPointerCapture?.(e.pointerId);});
    stage.addEventListener('pointerup',e=>{
      if(!dragging)return; dragging=false;
      const dx=e.clientX-downX,dy=e.clientY-downY;
      if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.15) jumpToScene(active+(dx<0?1:-1));
    });
    stage.addEventListener('pointercancel',()=>dragging=false);
  }

  $('#storyExplore')?.addEventListener('click',()=>{
    const detail=document.createElement('div'); detail.className='story-detail-pop';
    detail.innerHTML='<span>'+scenes[active].kicker+'</span><strong>'+scenes[active].place+'</strong><p>Scroll to move one city at a time. Use the arrows or dots to jump directly to a city.</p><button type="button">Close</button>';
    const st=document.createElement('style'); st.textContent='.story-detail-pop{position:fixed;z-index:300;right:5vw;top:50%;width:min(330px,82vw);padding:25px;background:rgba(4,13,20,.9);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(22px);color:#fff;transform:translateY(-50%);box-shadow:0 25px 80px rgba(0,0,0,.4)}.story-detail-pop span{font:800 8px Manrope;letter-spacing:.2em;color:#e8793f}.story-detail-pop strong{display:block;font:800 30px Manrope;margin:12px 0}.story-detail-pop p{font:12px/1.7 "DM Sans";color:#c5d0d5}.story-detail-pop button{border:0;border-radius:99px;padding:9px 14px;font:800 9px Manrope;cursor:pointer;margin-top:6px}';
    document.head.appendChild(st);document.body.appendChild(detail);
    window.gsap?.fromTo(detail,{autoAlpha:0,x:25},{autoAlpha:1,x:0,duration:.35,ease:'power3.out'});
    detail.querySelector('button').addEventListener('click',()=>{detail.remove();st.remove();});
  });
})();