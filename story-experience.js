(() => {
  const root = document.querySelector('#storyJourney');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const stage = $('.story-stage');
  const media = $$('.story-scene');
  const tabs = [];
  const railNumber = $('#storyRailNumber');
  const railCity = $('#storyRailCity');
  const railPrice = $('#storyRailPrice');
  const railNextNumber = $('#storyRailNextNumber');
  const railNext = $('#storyRailNext');
  const dots = $('#storyDots');
  const prev = $('#storyPrev');
  const next = $('#storyNext');
  let active = 0;

  scenes.forEach((s,i)=>{
    const dot=document.createElement('button');
    dot.type='button'; dot.className='story-dot'+(i===0?' is-active':'');
    dot.dataset.scene=i; dot.setAttribute('aria-label','Go to '+s.place);
    dots?.appendChild(dot); tabs.push(dot);
  });

  function refreshRail(index){
    const s=scenes[index];
    const n=scenes[(index+1)%scenes.length];
    railNumber.textContent=String(index+1).padStart(2,'0');
    railCity.textContent=s.place;
    railPrice.textContent=s.price || 'Custom quote';
    railNextNumber.textContent=String((index+1)%scenes.length+1).padStart(2,'0');
    railNext.textContent=n.place;
    tabs.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
    if(prev) prev.disabled=index===0;
    if(next) next.disabled=index===scenes.length-1;
  }

  // Pointer-driven depth: the image, orbit and pin subtly follow the visitor.
  if(!reduceMotion){
    stage.addEventListener('pointermove',e=>{
      const r=stage.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      gsap.to(media,{x:x*18,y:y*12,duration:.7,ease:'power3.out',overwrite:true});
      gsap.to('.story-orbit-a',{x:x*-28,y:y*-18,duration:1.2,ease:'power3.out',overwrite:true});
      gsap.to('.story-orbit-b',{x:x*22,y:y*14,duration:1,ease:'power3.out',overwrite:true});
      gsap.to(destination,{x:x*22,y:y*15,duration:.7,ease:'power3.out',overwrite:true});
      if(cursor){
        cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px';
      }
    });
    stage.addEventListener('pointerleave',()=>{
      gsap.to(media,{x:0,y:0,duration:1,ease:'power3.out'});
      gsap.to('.story-orbit-a,.story-orbit-b,.story-destination',{x:0,y:0,duration:1,ease:'power3.out'});
    });

    // Swipe/drag interaction: drag horizontally to move between story chapters.
    let downX=0,downY=0,dragging=false;
    stage.addEventListener('pointerdown',e=>{
      if(e.target.closest('a,button')) return;
      downX=e.clientX; downY=e.clientY; dragging=true;
      stage.setPointerCapture?.(e.pointerId);
    });
    stage.addEventListener('pointerup',e=>{
      if(!dragging) return;
      dragging=false;
      const dx=e.clientX-downX,dy=e.clientY-downY;
      if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.15){
        jumpToScene(active+(dx<0?1:-1));
      }
    });
    stage.addEventListener('pointercancel',()=>dragging=false);
  }

  // Lightweight, reliable scroll chapter controller. Every scroll segment owns one city.
  // GSAP is still used for visual transitions, but city selection does not depend on ScrollTrigger.
  let ticking=false;
  function updateJourney(){
    const r=root.getBoundingClientRect();
    const max=Math.max(1,root.offsetHeight-window.innerHeight);
    const p=Math.max(0,Math.min(1,-r.top/max));
    const scaled=p*(scenes.length-1);
    const scene=Math.min(scenes.length-1,Math.floor(scaled+0.00001));
    progress.style.transform='scaleX('+p+')';
    if(route) route.style.strokeDashoffset=String(1400*(1-p));
    if(scene!==active) setCopy(scene,true);
    const pathPoint=92+(818*p);
    destination.style.left='calc('+Math.min(91,Math.max(9,pathPoint/10))+'%)';
    destination.style.top=(38+Math.sin(p*Math.PI*2)*10)+'%';
    if(scene===scenes.length-1 && scaled-scene>.8) destination.style.opacity=.75;
    else destination.style.opacity=1;
    ticking=false;
  }
  function requestJourneyUpdate(){
    if(!ticking){ ticking=true; requestAnimationFrame(updateJourney); }
  }
  window.addEventListener('scroll',requestJourneyUpdate,{passive:true});
  window.addEventListener('resize',requestJourneyUpdate,{passive:true});
  requestJourneyUpdate();

  $('#storyExplore')?.addEventListener('click',()=>{
    const detail=document.createElement('div');
    detail.className='story-detail-pop';
    detail.innerHTML='<span>'+scenes[active].kicker+'</span><strong>'+scenes[active].place+'</strong><p>Move your pointer to shape the scene. Drag left or right to travel between chapters. Scroll to direct the full story.</p><button type="button">Close</button>';
    const detailStyle=document.createElement('style');
    detailStyle.textContent='.story-detail-pop{position:fixed;z-index:300;right:5vw;top:50%;width:min(330px,82vw);padding:25px;background:rgba(4,13,20,.88);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(22px);color:#fff;transform:translateY(-50%);box-shadow:0 25px 80px rgba(0,0,0,.4)}.story-detail-pop span{font:800 8px Manrope;letter-spacing:.2em;color:#e8793f}.story-detail-pop strong{display:block;font:800 30px Manrope;margin:12px 0}.story-detail-pop p{font:12px/1.7 "DM Sans";color:#c5d0d5}.story-detail-pop button{border:0;border-radius:99px;padding:9px 14px;font:800 9px Manrope;cursor:pointer}.story-detail-pop button{margin-top:6px}';
    document.head.appendChild(detailStyle);
    document.body.appendChild(detail);
    window.gsap?.fromTo(detail,{autoAlpha:0,x:25},{autoAlpha:1,x:0,duration:.45,ease:'power3.out'});
    detail.querySelector('button').addEventListener('click',()=>{detail.remove();detailStyle.remove()});
  });
})();