(() => {
  const mount = document.getElementById('immersive3dStage');
  const section = document.getElementById('immersiveJourney');
  if (!mount || !section) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'travel-canvas';
  mount.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let w=0,h=0,dpr=1,t=0,mx=0,my=0,tx=0,ty=0,drag=false,lastX=0,lastY=0;
  let progress=0,targetProgress=0,currentScene=0;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stars = Array.from({length:190},()=>({
    x:Math.random(), y:Math.random()*.62, z:Math.random(),
    s:Math.random()*1.5+.25
  }));

  const chapters=[...document.querySelectorAll('.journey-chapter')];
  const counter=document.getElementById('journeyCounter');
  const progressBar=document.getElementById('journeyProgress');

  function resize(){
    dpr=Math.min(devicePixelRatio||1,2);
    w=mount.clientWidth; h=mount.clientHeight;
    canvas.width=w*dpr; canvas.height=h*dpr;
    canvas.style.width=w+'px'; canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v));}
  function ease(v){return v*v*(3-2*v);}
  function sceneFor(p){return Math.min(4,Math.floor(clamp(p)*5));}

  function updateScroll(){
    const r=section.getBoundingClientRect();
    const total=Math.max(1,section.offsetHeight-innerHeight);
    targetProgress=clamp(-r.top/total);
    if(reduceMotion) progress=targetProgress;
    const scene=sceneFor(targetProgress);
    if(scene!==currentScene){
      currentScene=scene;
      chapters.forEach((c,i)=>c.classList.toggle('active',i===scene));
      if(counter) counter.textContent=String(scene+1).padStart(2,'0')+' / 05';
    }
    if(progressBar) progressBar.style.transform='scaleX('+targetProgress+')';
  }

  function mountain(points,base,amp,offset,fill){
    ctx.fillStyle=fill; ctx.beginPath(); ctx.moveTo(-40,h);
    for(let i=0;i<=points;i++){
      const x=-40+(w+80)*i/points;
      const wave=Math.sin(i*.72+offset)*.12+Math.sin(i*.29+offset*1.3)*.18;
      const y=base-amp*(.35+Math.abs(Math.sin(i*.41+offset*.4))*.65)-wave*amp;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(w+40,h); ctx.closePath(); ctx.fill();
  }

  function snowPeak(x,y,size,alpha=.8){
    ctx.fillStyle='rgba(235,243,244,'+alpha+')';
    ctx.beginPath();
    ctx.moveTo(x-size*.24,y+size*.28);
    ctx.lineTo(x,y-size*.32);
    ctx.lineTo(x+size*.25,y+size*.28);
    ctx.lineTo(x+size*.08,y+size*.14);
    ctx.lineTo(x,y-size*.03);
    ctx.lineTo(x-size*.08,y+size*.15);
    ctx.closePath(); ctx.fill();
  }

  function draw(){
    t+=.008;
    mx+=(tx-mx)*.045; my+=(ty-my)*.045;
    progress += (targetProgress-progress)*(reduceMotion?1:.075);

    const scene=sceneFor(progress);
    const local=progress*5-scene;
    const nextScene=Math.min(4,scene+1);
    const blend=ease(clamp((local-.62)/.38));

    // cinematic sky changes continuously between chapters
    const skyTop=[
      [5,18,31],[7,27,43],[8,37,53],[18,30,47],[24,18,32]
    ];
    const skyBottom=[
      [2,8,15],[5,18,29],[7,31,42],[19,47,55],[7,18,28]
    ];
    const a=skyTop[scene], b=skyTop[nextScene], c=skyBottom[scene], d=skyBottom[nextScene];
    const mix=(u,v)=>Math.round(u+(v-u)*blend);
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'rgb('+mix(a[0],b[0])+','+mix(a[1],b[1])+','+mix(a[2],b[2])+')');
    g.addColorStop(1,'rgb('+mix(c[0],d[0])+','+mix(c[1],d[1])+','+mix(c[2],d[2])+')');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

    const glow=ctx.createRadialGradient(w*(.62+mx*.025),h*(.34+my*.015),0,w*.62,h*.34,w*.65);
    glow.addColorStop(0,'rgba(83,166,198,.24)'); glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);

    stars.forEach(s=>{
      let x=s.x*w+mx*24*s.z, y=s.y*h+my*10*s.z;
      if(x<0)x+=w;if(x>w)x-=w;
      ctx.globalAlpha=.15+s.z*.65;
      ctx.fillStyle='#d9edf4'; ctx.beginPath();ctx.arc(x,y,s.s,0,Math.PI*2);ctx.fill();
    });
    ctx.globalAlpha=1;

    ctx.save();
    ctx.translate(mx*18,my*6);
    mountain(24,h*.73,180,t*.18,'#081a29');
    mountain(27,h*.80,145,t*.14+1.4,'#103149');
    mountain(30,h*.87,115,t*.1+2.6,'#17445b');
    ctx.restore();

    // clean snow ridges instead of the broken diamond shapes
    ctx.save(); ctx.translate(mx*8,my*3);
    for(let i=0;i<7;i++){
      const x=w*(.05+i*.15), y=h*(.52+(i%3)*.035);
      snowPeak(x,y,Math.min(105,w*.18),.72);
    }
    ctx.restore();

    // scene 2 onward: river expands as the viewer scrolls
    const riverStart=clamp((progress-.25)/.5);
    if(riverStart>0){
      ctx.save();
      const rw=70+riverStart*w*.25;
      const center=w*.58+mx*12;
      const top=h*(.69-riverStart*.16);
      const rg=ctx.createLinearGradient(0,top,0,h);
      rg.addColorStop(0,'rgba(62,176,207,.08)');
      rg.addColorStop(.45,'rgba(37,128,164,.66)');
      rg.addColorStop(1,'rgba(10,50,72,.98)');
      ctx.fillStyle=rg;ctx.beginPath();
      ctx.moveTo(center-rw*.12,h);ctx.quadraticCurveTo(center-rw*.35,h*.8,center-rw*.08,top);
      ctx.quadraticCurveTo(center+rw*.12,h*.67,center+rw*.48,h);
      ctx.closePath();ctx.fill();
      for(let i=0;i<8;i++){
        const yy=top+(h-top)*(i/8);
        ctx.strokeStyle='rgba(170,232,240,.2)';
        ctx.beginPath();ctx.moveTo(center-rw*.22+i*3,yy);ctx.lineTo(center+rw*.24-i*2,yy+2);ctx.stroke();
      }
      ctx.restore();
    }

    // destination pulse moves across the composition with the story
    const px=w*(.68-.28*progress)+mx*24;
    const py=h*(.38+.16*progress)+my*10;
    const radius=18+Math.sin(t*2)*5+progress*12;
    ctx.strokeStyle='rgba(232,121,63,.78)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#e8793f';ctx.shadowBlur=20;ctx.shadowColor='#e8793f';
    ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;

    // route line
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.setLineDash([3,8]);ctx.beginPath();
    ctx.moveTo(w*.18,h*.78);ctx.quadraticCurveTo(w*.46,h*.62,w*.68,h*.38);ctx.stroke();ctx.setLineDash([]);

    requestAnimationFrame(draw);
  }

  function pointer(x,y){
    const r=mount.getBoundingClientRect();
    tx=(x-r.left-r.width/2)/r.width*2;
    ty=(y-r.top-r.height/2)/r.height*2;
  }

  mount.addEventListener('pointermove',e=>{
    pointer(e.clientX,e.clientY);
    if(drag){tx+=(e.clientX-lastX)*.003;ty+=(e.clientY-lastY)*.002;lastX=e.clientX;lastY=e.clientY;}
  });
  mount.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;mount.setPointerCapture(e.pointerId);});
  mount.addEventListener('pointerup',()=>drag=false);
  mount.addEventListener('pointercancel',()=>drag=false);
  addEventListener('scroll',updateScroll,{passive:true});
  addEventListener('resize',resize);
  resize(); updateScroll(); draw();
})();