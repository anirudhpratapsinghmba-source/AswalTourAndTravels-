(() => {
  const root = document.querySelector('#storyJourney');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = [
    {kicker:'01 · UTTARAKHAND', title:'Begin where<br><em>mountains breathe.</em>', desc:'Rishikesh · Mussoorie · Haridwar · Nainital. Start high, follow the river, and let the Himalayas set the pace.', place:'RISHIKESH', region:'30.1° N · 78.3° E', side:'RIVER · MOUNTAIN · STILLNESS'},
    {kicker:'02 · RAJASTHAN', title:'Walk into<br><em>royal light.</em>', desc:'Jaipur · Udaipur · Jodhpur · Jaisalmer. Fort walls, blue streets and a desert that glows after sunset.', place:'JAISALMER', region:'26.9° N · 70.9° E', side:'FORT · DESERT · HERITAGE'},
    {kicker:'03 · UTTAR PRADESH', title:'Follow the<br><em>river of stories.</em>', desc:'Varanasi · Ayodhya · Mathura · Agra. Ancient lanes, river light and living culture woven into every turn.', place:'VARANASI', region:'25.3° N · 83.0° E', side:'GANGA · CULTURE · FAITH'},
    {kicker:'04 · KERALA', title:'Let the<br><em>water slow you.</em>', desc:'Kochi · Munnar · Thekkady · Alappuzha. Tea hills, wildlife, houseboats and warm coastal evenings.', place:'ALLEPPEY', region:'9.5° N · 76.3° E', side:'TEA · WATER · WELLNESS'},
    {kicker:'05 · GOA', title:'End with<br><em>the sea.</em>', desc:'Panaji · Vagator · Calangute · Palolem. Beach roads, old Goa and sunsets without a clock.', place:'PALOLEM', region:'15.0° N · 74.0° E', side:'SEA · SUNSET · FREEDOM'}
  ];

  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const stage = $('.story-stage');
  const media = $$('.story-scene');
  const tabs = $$('.story-tab');
  const kicker = $('#storyKicker');
  const title = $('#storyTitle');
  const desc = $('#storyDescription');
  const place = $('#storyPlace');
  const region = $('#storyRegion');
  const side = $('#storySide');
  const counter = $('#storyCounter');
  const progress = $('#storyProgress');
  const destination = $('#storyDestination');
  const route = $('.story-route-progress');
  const cursor = $('#storyCursor');
  let active = 0;

  // Full-width story chapter stylesheet is loaded separately so the legacy canvas
  // engine can stay in the repository without participating in this experience.
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'story-experience.css';
  document.head.appendChild(style);

  function setCopy(index, animate = true){
    index = Math.max(0, Math.min(scenes.length - 1, index));
    const s = scenes[index];
    if(index === active && kicker.textContent === s.kicker) return;
    active = index;

    tabs.forEach((tab,i)=>tab.classList.toggle('is-active',i===index));
    counter.textContent = String(index+1).padStart(2,'0') + ' / 05';

    if(!window.gsap || !animate || reduceMotion){
      kicker.textContent=s.kicker; title.innerHTML=s.title; desc.textContent=s.desc;
      place.textContent=s.place; region.textContent=s.region; side.textContent=s.side;
      media.forEach((m,i)=>m.classList.toggle('is-active',i===index));
      return;
    }

    const oldText = [kicker,title,desc,place,region,side];
    gsap.to(oldText,{autoAlpha:0,y:18,duration:.22,stagger:.025,ease:'power2.in',onComplete:()=>{
      kicker.textContent=s.kicker; title.innerHTML=s.title; desc.textContent=s.desc;
      place.textContent=s.place; region.textContent=s.region; side.textContent=s.side;
      gsap.fromTo(oldText,{autoAlpha:0,y:18},{autoAlpha:1,y:0,duration:.62,stagger:.045,ease:'power3.out'});
    }});

    media.forEach((m,i)=>{
      if(i===index){
        gsap.set(m,{zIndex:2});
        gsap.fromTo(m,{opacity:0,scale:1.13,clipPath:'inset(0 0 100% 0)'},{opacity:1,scale:1.03,clipPath:'inset(0 0 0% 0)',duration:.95,ease:'power4.inOut'});
      }else{
        gsap.to(m,{opacity:0,scale:1.08,duration:.7,ease:'power2.out'});
      }
    });
    gsap.fromTo(destination,{x:35,y:18,scale:.75},{x:0,y:0,scale:1,duration:.8,ease:'back.out(1.7)'});
  }

  function jumpToScene(index){
    const sectionTop = root.getBoundingClientRect().top + window.scrollY;
    const maxScroll = root.offsetHeight - window.innerHeight;
    const target = sectionTop + maxScroll * (index/(scenes.length-1));
    window.scrollTo({top:target,behavior:reduceMotion?'auto':'smooth'});
  }

  tabs.forEach((tab)=>tab.addEventListener('click',()=>jumpToScene(Number(tab.dataset.scene))));

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

  // GSAP ScrollTrigger creates the actual narrative timeline: the section pins,
  // the route draws, and each chapter becomes a new visual movement.
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    const proxy={p:0};
    gsap.to(proxy,{
      p:1,
      ease:'none',
      scrollTrigger:{
        trigger:root,
        start:'top top',
        end:'bottom bottom',
        scrub:0.8,
        anticipatePin:1,
        invalidateOnRefresh:true,
        onUpdate:self=>{
          const p=self.progress;
          const scaled=p*(scenes.length-1);
          const scene=Math.min(scenes.length-1,Math.floor(scaled+0.00001));
          const local=scaled-scene;
          progress.style.transform='scaleX('+p+')';
          if(route) route.style.strokeDashoffset=String(1400*(1-p));
          if(scene!==active) setCopy(scene,true);
          const pathPoint=92+(818*p);
          destination.style.left='calc('+Math.min(91,Math.max(9,pathPoint/10))+'%)';
          destination.style.top=(38+Math.sin(p*Math.PI*2)*10)+'%';
          if(scene===scenes.length-1 && local>.8) destination.style.opacity=.75;
          else destination.style.opacity=1;
        }
      }
    });

    // A gentle opening choreography once the story first enters.
    gsap.fromTo([kicker,title,desc,'.story-actions'],{y:35,autoAlpha:0},{y:0,autoAlpha:1,duration:1.1,stagger:.08,ease:'power4.out',delay:.2});
  }else{
    // Graceful fallback if a CDN is blocked.
    window.addEventListener('scroll',()=>{
      const r=root.getBoundingClientRect();
      const p=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-innerHeight)));
      const scene=Math.min(4,Math.floor(p*5));
      if(scene!==active) setCopy(scene,false);
      progress.style.transform='scaleX('+p+')';
    },{passive:true});
  }

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