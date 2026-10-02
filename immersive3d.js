import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const mount = document.getElementById('immersive3dStage');
if (!mount) throw new Error('3D mount not found');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07131f, 0.035);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(0, 2.8, 9.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9ec7df, 0x08111a, 2.2));
const sun = new THREE.DirectionalLight(0xffdfbd, 3.2);
sun.position.set(-4, 8, 5);
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

function mountain(x, y, z, scale, color) {
  const geometry = new THREE.ConeGeometry(1.25, 2.8, 7, 3);
  const material = new THREE.MeshStandardMaterial({ color, roughness: .92, metalness: .02, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(scale, scale * (0.8 + Math.random() * .35), scale);
  mesh.rotation.y = Math.random() * Math.PI;
  world.add(mesh);
  return mesh;
}

const mountains = [
  mountain(-5,-1.0,-2,2.8,0x163449),
  mountain(-3,-.9,-.8,2.2,0x20445a),
  mountain(-1,-1.1,-2.2,3.5,0x102b3e),
  mountain(1.8,-1.0,-1.2,2.7,0x1a3a4e),
  mountain(4,-1.1,-2.4,3.3,0x0d2637),
  mountain(6,-1.0,-.5,2.1,0x17364a),
  mountain(-7,-1.1,-4,2.4,0x0b2232),
  mountain(7,-1.1,-4,2.8,0x0a1e2d)
];

const snow = new THREE.Group();
world.add(snow);
mountains.slice(0,6).forEach((m, idx) => {
  const g = new THREE.ConeGeometry(.46, .78, 7, 1);
  const mat = new THREE.MeshStandardMaterial({color:0xe8f0f1, roughness:1});
  const cap = new THREE.Mesh(g,mat);
  cap.position.copy(m.position);
  cap.position.y += m.scale.y * .88;
  cap.scale.setScalar(m.scale.x * .9);
  cap.rotation.y = m.rotation.y;
  snow.add(cap);
});

const riverGeo = new THREE.PlaneGeometry(5.5, 22, 1, 18);
const riverMat = new THREE.MeshStandardMaterial({color:0x1f6683,roughness:.22,metalness:.15,transparent:true,opacity:.82});
const river = new THREE.Mesh(riverGeo,riverMat);
river.rotation.x=-Math.PI/2;
river.position.set(.8,-1.28,-3);
river.rotation.z=.22;
world.add(river);

const stars = new THREE.BufferGeometry();
const points=[];
for(let i=0;i<420;i++) points.push((Math.random()-.5)*25, Math.random()*10-1, (Math.random()-.5)*18-5);
stars.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
const starMat=new THREE.PointsMaterial({color:0xcfe7f2,size:.025,transparent:true,opacity:.65});
scene.add(new THREE.Points(stars,starMat));

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.1,.008,8,80),
  new THREE.MeshBasicMaterial({color:0xe8793f,transparent:true,opacity:.8})
);
ring.position.set(1.7,1.1,.1);
ring.rotation.x=.8;
world.add(ring);

const pin = new THREE.Mesh(
  new THREE.SphereGeometry(.055,16,16),
  new THREE.MeshBasicMaterial({color:0xe8793f})
);
pin.position.set(1.7,1.1,.1);
world.add(pin);

let targetX=0, targetY=0, currentX=0, currentY=0;
let dragging=false, lastX=0, lastY=0;

const pointer = (x,y) => {
  const r=mount.getBoundingClientRect();
  targetX=((x-r.left)/r.width-.5)*2;
  targetY=((y-r.top)/r.height-.5)*2;
};
mount.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;mount.setPointerCapture(e.pointerId)});
mount.addEventListener('pointermove',e=>{
  pointer(e.clientX,e.clientY);
  if(dragging){
    targetX += (e.clientX-lastX)*.0025;
    targetY += (e.clientY-lastY)*.0015;
    lastX=e.clientX; lastY=e.clientY;
  }
});
mount.addEventListener('pointerup',()=>dragging=false);
mount.addEventListener('pointercancel',()=>dragging=false);

function resize(){
  const w=mount.clientWidth,h=mount.clientHeight;
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h);
}
window.addEventListener('resize',resize);

const clock=new THREE.Clock();
function animate(){
  const t=clock.getElapsedTime();
  currentX += (targetX-currentX)*.035;
  currentY += (targetY-currentY)*.035;
  world.rotation.y = currentX*.28 + Math.sin(t*.08)*.025;
  world.rotation.x = currentY*.08;
  camera.position.x += (currentX*1.15-camera.position.x)*.025;
  camera.position.y += ((2.8-currentY*.5)-camera.position.y)*.025;
  camera.lookAt(0,-.45,-1.8);
  ring.rotation.z=t*.35;
  ring.scale.setScalar(1+Math.sin(t*2)*.08);
  pin.scale.setScalar(1+Math.sin(t*3)*.18);
  river.position.y=-1.28+Math.sin(t*.7)*.012;
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}
resize();
animate();