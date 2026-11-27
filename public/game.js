
import * as THREE from "three";
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9bcbd7); scene.fog = new THREE.Fog(0x9bcbd7,45,100);
const camera = new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,200);
const renderer = new THREE.WebGLRenderer({antialias:true}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xeafaff,0x52616a,2));
const sun=new THREE.DirectionalLight(0xfff0d7,2.3);sun.position.set(-20,35,18);sun.castShadow=true;scene.add(sun);
const mat=(c,rough=.8)=>new THREE.MeshStandardMaterial({color:c,roughness:rough});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,90),mat(0x9aa9a2));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function box(x,y,z,sx,sy,sz,color){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function cylinder(x,y,z,r,h,color){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),mat(color));m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m}
 // quay, water, dock
const water=new THREE.Mesh(new THREE.PlaneGeometry(100,26),new THREE.MeshStandardMaterial({color:0x3b9cae,roughness:.35,metalness:.1}));water.rotation.x=-Math.PI/2;water.position.set(0,-.08,-34);scene.add(water);
box(0,-.1,-18,58,.35,16,0x777f7d);box(0,.05,-8,58,.5,5,0x8b9690);
for(let x=-25;x<=25;x+=10){cylinder(x,.1,-10,.35,1,0x4b5558)}
// container stacks
const containerColors=[0xb85f48,0x397b91,0xd19a48,0x597b65,0x6c6b88];
for(let i=0;i<5;i++)for(let j=0;j<3;j++){box(-24+i*10,1.3+j*2.65,13,8,2.5,5,containerColors[(i+j)%containerColors.length]);}
for(let i=0;i<6;i++)box(-27+i*10,.7,23,8,1.3,3,0xc0a77c);
// warehouse
box(22,3,2,10,6,12,0xc5c2b4);for(let x=18;x<=26;x+=4)box(x,2.2,-4,.3,4,.3,0x56636a);
// ship on dock
box(0,1,-21,18,2.4,10,0x263f51);box(0,2.8,-21,8,1.4,5,0xe8e5d8);box(0,4.2,-21,4,1.3,3,0xffffff);
for(let x=-6;x<=6;x+=4)box(x,2.8,-16,.35,1,.35,0x252d35);
const shipLabel=document.createElement("div");shipLabel.style.cssText="position:fixed;color:#fff;font-weight:900;text-shadow:0 2px 5px #000;pointer-events:none";shipLabel.textContent="BLUE HORIZON";document.body.appendChild(shipLabel);
// player model builder
function makePerson(color){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.85,4,8),mat(color));body.position.y=1.15;body.castShadow=true;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.28,16,12),mat(0xf0c7a1));head.position.y=1.95;g.add(head);const legmat=mat(0x263744);for(let x of [-.2,.2]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.19,.7,.22),legmat);leg.position.set(x,.4,0);g.add(leg)}return g}
const local=makePerson(0xe0a53b);scene.add(local);let remote=new Map();
const itemMeshes=new Map();
const itemDefs={
storm:{color:0x515b78,shape:"cloud",label:"폭풍 구름"},snow:{color:0xeffaff,shape:"snow",label:"폭설 경보"},shipfault:{color:0xc5a15d,shape:"tool",label:"선박 결함 키트"},warehouse:{color:0xd46c42,shape:"crate",label:"창고 사고"},customs:{color:0xd8c15c,shape:"sign",label:"세관 검사"},
snowblower:{color:0x7cb7c8,shape:"machine",label:"만능 제설기"},soldiers:{color:0x6c8b62,shape:"badge",label:"군인 출동 명령서"},staff:{color:0x6b8f7a,shape:"brief",label:"사내 잉여 인력"},lobby:{color:0x9c8154,shape:"brief",label:"세관사 로비 서류"}};
function makeItem(def){const g=new THREE.Group();const base=mat(def.color);if(def.shape==="cloud"){for(let i=0;i<4;i++){let m=new THREE.Mesh(new THREE.SphereGeometry(.48,12,10),base);m.position.set((i-1.5)*.48,.5+(i%2)*.18,0);g.add(m)}}
else if(def.shape==="snow"){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.65,0),base);g.add(m);for(let i=0;i<3;i++){let s=new THREE.Mesh(new THREE.BoxGeometry(.08,1.6,.08),mat(0x77a9d5));s.rotation.z=i*Math.PI/3;g.add(s)}}
else if(def.shape==="crate"){g.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),base));for(let x of [-.3,.3]){let b=new THREE.Mesh(new THREE.BoxGeometry(.08,1.05,1.03),mat(0x6e4933));b.position.x=x;g.add(b)}}
else if(def.shape==="sign"){g.add(new THREE.Mesh(new THREE.BoxGeometry(.9,.8,.12),base));let pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.8,8),mat(0x555));pole.position.y=-.65;g.add(pole)}
else if(def.shape==="machine"){g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,.65,.75),base));let wheelmat=mat(0x252b2d);for(let x of [-.4,.4]){let w=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.15,12),wheelmat);w.rotation.z=Math.PI/2;w.position.set(x,-.4,.35);g.add(w)}}
else if(def.shape==="tool"){g.add(new THREE.Mesh(new THREE.BoxGeometry(.85,.35,.4),base));let h=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.8,8),mat(0x6a5134));h.rotation.z=Math.PI/2;h.position.y=.35;g.add(h)}
else {g.add(new THREE.Mesh(new THREE.BoxGeometry(.75,.85,.18),base));let cross=new THREE.Mesh(new THREE.BoxGeometry(.14,.55,.2),mat(0xf4e6bf));g.add(cross)}
g.position.y=.65;g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
let items=[],players=[],myId=null,carrying=null,ws=null,connected=false;
const itemGroup=new THREE.Group();scene.add(itemGroup);
function syncItems(list){for(const [id,m] of itemMeshes){itemGroup.remove(m);itemMeshes.delete(id)}items=list;for(const it of items){if(!it.active)continue;const m=makeItem(itemDefs[it.id]||{color:0xffffff,shape:"crate"});m.position.set(it.x,.2,it.z);itemGroup.add(m);itemMeshes.set(it.id,m)}}
function connect(){const proto=location.protocol==="https:"?"wss":"ws";ws=new WebSocket(`${proto}://${location.host}`);ws.onopen=()=>{connected=true;document.querySelector("#status").textContent="서버 연결됨 · 다른 플레이어 접속 가능"};ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==="welcome"){myId=m.id;syncItems(m.state.items);m.state.players.forEach(p=>{if(p.id!==myId)addRemote(p)});updateShip(m.state.ship)}if(m.type==="join")addRemote(m.player);if(m.type==="leave"){const r=remote.get(m.id);if(r){scene.remove(r.mesh);remote.delete(m.id)}}if(m.type==="player"&&m.player.id!==myId)updateRemote(m.player);if(m.type==="items")syncItems(m.items);if(m.type==="ship")updateShip(m.ship);};ws.onclose=()=>{connected=false;document.querySelector("#status").textContent="서버 연결 끊김 · 새로고침 후 재접속"}}
function send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))}
function addRemote(p){if(p.id===myId)return;const mesh=makePerson(p.color||0x55aabb);scene.add(mesh);remote.set(p.id,{mesh,data:p})}
function updateRemote(p){let r=remote.get(p.id);if(!r){addRemote(p);r=remote.get(p.id)}if(r){r.mesh.position.set(p.x,0,p.z);r.mesh.rotation.y=p.rot;r.data=p}}
function updateShip(s){document.querySelector("#shipline").textContent=`지연 ${s.delay}시간 · ${s.reasons.join(", ")||"지연 없음"}`}
let keys={},yaw=0,pitch=-.2,locked=false;
document.querySelector("#enter").onclick=()=>{document.querySelector("#start").style.display="none";renderer.domElement.requestPointerLock();if(!ws)connect()};
document.addEventListener("pointerlockchange",()=>locked=document.pointerLockElement===renderer.domElement);
document.addEventListener("mousemove",e=>{if(locked){yaw-=e.movementX*.0025;pitch=Math.max(-.8,Math.min(.45,pitch-e.movementY*.002))}});
document.addEventListener("keydown",e=>{keys[e.code]=true;if(e.code==="KeyE")interact();if(e.code==="KeyG")drop()});
document.addEventListener("keyup",e=>keys[e.code]=false);
function toast(t){const el=document.querySelector("#toast");el.textContent=t;el.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>el.style.opacity=0,1800)}
function interact(){if(carrying){if(Math.hypot(local.position.x,local.position.z+20)<7){send({type:"apply"});carrying=null;local.remove(local.getObjectByName("carried"));toast("선박에 적용 요청!")}else toast("선박 가까이 이동해야 적용할 수 있어요.");return}
let best=null,dist=2.5;for(const it of items){if(!it.active)continue;const d=Math.hypot(it.x-local.position.x,it.z-local.position.z);if(d<dist){dist=d;best=it}}
if(best){carrying=best.id;send({type:"pickup",itemId:best.id});const obj=makeItem(itemDefs[best.id]);obj.name="carried";obj.position.set(0,1.9,-.8);local.add(obj);toast(`${best.label} 들기 완료 · 이동속도 감소`)}else toast("가까이에 줍거나 적용할 아이템이 없어요.") }
function drop(){if(!carrying)return;send({type:"drop"});carrying=null;const obj=local.getObjectByName("carried");if(obj)local.remove(obj);toast("아이템을 내려놓았어요.")}
let last=performance.now(),sendTimer=0;
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;
const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));let dir=new THREE.Vector3();
if(keys.KeyW)dir.add(forward);if(keys.KeyS)dir.sub(forward);if(keys.KeyD)dir.add(right);if(keys.KeyA)dir.sub(right);
if(dir.lengthSq()>0){
 dir.normalize();
 const speed=(keys.ShiftLeft||keys.ShiftRight?8:5.2)*(carrying?.78:1);
 const oldPos=local.position.clone();
 local.position.addScaledVector(dir,speed*dt);
 local.rotation.y=Math.atan2(dir.x,dir.z);
 // Moving forklift and container carrier physically block the player.
 if(Math.hypot(local.position.x-fork.position.x,local.position.z-fork.position.z)<1.9 ||
    Math.hypot(local.position.x-carrier.position.x,local.position.z-carrier.position.z)<2.5){
   local.position.copy(oldPos);
   if(Math.random()<.08) toast("운반 차량에 막혔어요!");
 }
}
local.position.x=THREE.MathUtils.clamp(local.position.x,-27,27);local.position.z=THREE.MathUtils.clamp(local.position.z,-27,26);
// camera follows with orbit-like third-person perspective
const target=new THREE.Vector3(local.position.x,1.3,local.position.z);const camOffset=new THREE.Vector3(Math.sin(yaw)*8,4.2+pitch*4,Math.cos(yaw)*8);camera.position.copy(target).add(camOffset);camera.lookAt(target);
if(carrying){const ob=local.getObjectByName("carried");if(ob)ob.rotation.y=Math.sin(now*.003)*.12}
for(const [id,r] of remote){r.mesh.position.y=.03;}
// forklift & container tug moving obstacle
const t=now*.00035;fork.position.set(Math.sin(t)*15,.55,Math.cos(t*1.4)*9);fork.rotation.y=Math.cos(t)*.6;
carrier.position.set(Math.cos(t*.7)*19,.65,Math.sin(t*.7)*14);carrier.rotation.y=-t*.7;
sendTimer+=dt;if(sendTimer>.07){send({type:"move",x:local.position.x,z:local.position.z,rot:local.rotation.y,carrying});sendTimer=0}
const p=local.position.clone();p.y+=4; p.project(camera);shipLabel.style.left=((p.x*.5+.5)*innerWidth-45)+"px";shipLabel.style.top=((-p.y*.5+.5)*innerHeight-15)+"px";
document.querySelector("#players").textContent=`접속 플레이어: ${remote.size+1}`;
renderer.render(scene,camera)}
// moving forklift obstacle model
const fork=new THREE.Group();const chassis=new THREE.Mesh(new THREE.BoxGeometry(2.1,.8,1.4),mat(0xe3b33d));chassis.position.y=.5;fork.add(chassis);const cab=new THREE.Mesh(new THREE.BoxGeometry(.8,1.2,1.2),mat(0x384950));cab.position.set(-.3,1.35,0);fork.add(cab);const mast=new THREE.Mesh(new THREE.BoxGeometry(.12,2,.12),mat(0x333b40));mast.position.set(1.05,1.3,0);fork.add(mast);for(let z of [-.55,.55]){const f=new THREE.Mesh(new THREE.BoxGeometry(1.2,.12,.16),mat(0x333b40));f.position.set(1.55,.25,z);fork.add(f)}scene.add(fork);
const carrier=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(3.2,.65,2.2),mat(0x4f6975));base.position.y=.5;carrier.add(base);for(let x of [-1.2,1.2])for(let z of [-.8,.8]){let w=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.18,12),mat(0x222));w.rotation.z=Math.PI/2;w.position.set(x,.2,z);carrier.add(w)}const load=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.4,1.8),mat(0xb96a4b));load.position.y=1.45;carrier.add(load);scene.add(carrier);
// decorative cranes
for(let x of [-25,25]){box(x,8,-7,.5,16,.5,0xd8a13b);box(x/2,15,-7,25,.5,.5,0xd8a13b);box(x,5,-7,5,.3,.3,0x333)}
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
animate(performance.now());
