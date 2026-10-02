(() => {
const mount=document.getElementById('immersive3dStage');
if(!mount)return;
const canvas=document.createElement('canvas');
canvas.className='travel-canvas';
mount.appendChild(canvas);
const ctx=canvas.getContext('2d');
let w=0,h=0,dpr=1,t=0,mx=0,my=0,tx=0,ty=0,drag=false,lastX=0,lastY=0;
const stars=Array.from({length:170},()=>({x:Math.random(),y:Math.random()*.68,z:Math.random(),s:Math.random()*1.8+.3}));
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=mount.clientWidth;h=mount.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
function hill(points,base,amp,depth,shift){
 const p=[];
 for(let i=0;i<=points;i++){const x=i/points*w*1.25-w*.12;const n=Math.sin(i*.75+shift)*.25+Math.sin(i*.31+shift*1.7)*.45+Math.sin(i*.13)*.3;p.push([x,base-n*amp-(i%3===0?amp*.12:0)])}
 ctx.beginPath();ctx.moveTo(0,h);p.forEach(a=>ctx.lineTo(a[0],a[1]));ctx.lineTo(w,h);ctx.closePath();ctx.fill();
}
function draw(){
 t+=.012;mx+=(tx-mx)*.045;my+=(ty-my)*.045;
 const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#061321');g.addColorStop(.48,'#0b2435');g.addColorStop(1,'#02070d');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 const glow=ctx.createRadialGradient(w*.62,h*.35,0,w*.62,h*.35,w*.55);glow.addColorStop(0,'rgba(71,144,182,.26)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 stars.forEach(s=>{let x=s.x*w+(mx*18*s.z);let y=s.y*h+(my*8*s.z);if(x<0)x+=w;if(x>w)x-=w;ctx.globalAlpha=.25+s.z*.6;ctx.fillStyle='#d8edf5';ctx.beginPath();ctx.arc(x,y,s.s,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;
 ctx.save();ctx.translate(mx*22,my*7);
 ctx.fillStyle='#0b2232';hill(22,h*.69,105,1,t*.2);
 ctx.fillStyle='#12364a';hill(24,h*.75,125,1,t*.17+1);
 ctx.fillStyle='#1b4a61';hill(26,h*.82,105,1,t*.13+2);
 ctx.restore();
 // snow caps
 ctx.save();ctx.translate(mx*10,my*4);ctx.fillStyle='rgba(232,241,242,.82)';
 for(let i=0;i<7;i++){const x=w*(.07+i*.145);const y=h*(.59-(i%2)*.035);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+30,y+42);ctx.lineTo(x+60,y);ctx.lineTo(x+48,y+9);ctx.lineTo(x+30,y-18);ctx.closePath();ctx.fill()}ctx.restore();
 // river
 ctx.save();ctx.translate(w*.57+mx*13,0);ctx.rotate(-.08);const rg=ctx.createLinearGradient(0,h*.58,0,h);rg.addColorStop(0,'rgba(52,148,183,.1)');rg.addColorStop(.55,'rgba(35,113,146,.7)');rg.addColorStop(1,'rgba(16,55,76,.95)');ctx.fillStyle=rg;ctx.beginPath();ctx.moveTo(-55,h);ctx.quadraticCurveTo(10,h*.75,28,h*.56);ctx.quadraticCurveTo(75,h*.78,130,h);ctx.closePath();ctx.fill();
 for(let i=0;i<7;i++){ctx.strokeStyle='rgba(150,225,238,.18)';ctx.beginPath();ctx.moveTo(-25+i*16,h*.7+i*24);ctx.lineTo(65+i*9,h*.69+i*24);ctx.stroke()}ctx.restore();
 // floating destination pin
 const px=w*.67+mx*25,py=h*.38+my*10;ctx.strokeStyle='rgba(232,121,63,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(px,py,25+Math.sin(t*2)*5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#e8793f';ctx.shadowBlur=18;ctx.shadowColor='#e8793f';ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 requestAnimationFrame(draw);
}
function pointer(x,y){const r=mount.getBoundingClientRect();tx=(x-r.left-r.width/2)/r.width*2;ty=(y-r.top-r.height/2)/r.height*2}
mount.addEventListener('pointermove',e=>{pointer(e.clientX,e.clientY);if(drag){tx+=(e.clientX-lastX)*.003;ty+=(e.clientY-lastY)*.002;lastX=e.clientX;lastY=e.clientY}});
mount.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;mount.setPointerCapture(e.pointerId)});
mount.addEventListener('pointerup',()=>drag=false);mount.addEventListener('pointercancel',()=>drag=false);
window.addEventListener('resize',resize);resize();draw();
})();